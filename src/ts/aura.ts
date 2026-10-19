// Pointer aura — candlelight glow + ember trail that follows the mouse
// on desktop and the finger position while scrolling on touch screens.
// Purely decorative: fixed overlay layers, never intercept input.

interface Ember {
  x: number;
  y: number;
  vx: number;
  vy: number;
  life: number;
  maxLife: number;
  size: number;
  hue: number;
}

const MAX_EMBERS = 140;
const AURA_LERP = 0.12;

export function initAura(): void {
  // Respect visitors who prefer no animation: leave the layers hidden.
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
  const aura = document.getElementById("pointer-aura");
  const canvas = document.getElementById("aura-canvas") as HTMLCanvasElement | null;
  if (!aura || !canvas) return;
  const ctx = canvas.getContext("2d");
  if (!ctx) return;

  let dpr = Math.min(window.devicePixelRatio || 1, 2);
  const resize = (): void => {
    dpr = Math.min(window.devicePixelRatio || 1, 2);
    canvas.width = Math.floor(window.innerWidth * dpr);
    canvas.height = Math.floor(window.innerHeight * dpr);
  };
  resize();
  window.addEventListener("resize", resize);

  // Glow rests off-center until the first pointer movement wakes it.
  let targetX = window.innerWidth / 2;
  let targetY = window.innerHeight * 0.4;
  let auraX = targetX;
  let auraY = targetY;
  let shown = false;
  let lastSpawnX = 0;
  let lastSpawnY = 0;
  const embers: Ember[] = [];
  let running = true;

  const moveTarget = (x: number, y: number, spawnGap: number): void => {
    targetX = x;
    targetY = y;
    if (!shown) {
      shown = true;
      aura.classList.add("is-visible");
    }
    const dist = Math.hypot(x - lastSpawnX, y - lastSpawnY);
    if (dist >= spawnGap && embers.length < MAX_EMBERS) {
      lastSpawnX = x;
      lastSpawnY = y;
      embers.push({
        x,
        y,
        vx: (Math.random() - 0.5) * 0.4,
        vy: -0.3 - Math.random() * 0.7,
        life: 0,
        maxLife: 50 + Math.random() * 50,
        size: (1 + Math.random() * 2.2) * dpr,
        hue: 20 + Math.random() * 25,
      });
    }
  };

  // Desktop: track mouse / pen movement.
  window.addEventListener(
    "pointermove",
    (event) => {
      if (event.pointerType === "touch") return; // handled below
      moveTarget(event.clientX, event.clientY, 14);
    },
    { passive: true }
  );

  // Touch screens: trail the finger while it scrolls the page up or down.
  // Passive listeners never block scrolling.
  const onTouch = (event: TouchEvent): void => {
    const touch = event.touches[0];
    if (!touch) return;
    moveTarget(touch.clientX, touch.clientY, 8);
  };
  window.addEventListener("touchstart", onTouch, { passive: true });
  window.addEventListener("touchmove", onTouch, { passive: true });

  document.addEventListener("visibilitychange", () => {
    running = !document.hidden;
    if (running) requestAnimationFrame(frame);
  });

  const frame = (): void => {
    if (!running) return;
    // Smooth the glow toward the pointer (candlelight lag).
    auraX += (targetX - auraX) * AURA_LERP;
    auraY += (targetY - auraY) * AURA_LERP;
    aura.style.transform = `translate3d(${auraX}px, ${auraY}px, 0)`;

    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.clearRect(0, 0, window.innerWidth, window.innerHeight);
    ctx.globalCompositeOperation = "lighter";
    for (let i = embers.length - 1; i >= 0; i--) {
      const ember = embers[i];
      ember.life += 1;
      ember.x += ember.vx;
      ember.y += ember.vy;
      ember.vy -= 0.004; // embers drift upward as they fade
      const remaining = 1 - ember.life / ember.maxLife;
      if (remaining <= 0) {
        embers.splice(i, 1);
        continue;
      }
      const flicker = 0.7 + 0.3 * Math.sin(ember.life * 0.35);
      ctx.beginPath();
      ctx.fillStyle = `hsla(${ember.hue}, 95%, ${55 * flicker}%, ${0.75 * remaining})`;
      ctx.arc(ember.x, ember.y, ember.size * remaining + 0.4, 0, Math.PI * 2);
      ctx.fill();
    }
    requestAnimationFrame(frame);
  };
  requestAnimationFrame(frame);
}
