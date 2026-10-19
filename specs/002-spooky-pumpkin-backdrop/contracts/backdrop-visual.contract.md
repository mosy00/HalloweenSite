# Backdrop Visual Contract: Spooky Pumpkin Backdrop

Browser-only visual contract. No endpoints, no storage, no JS API.
A later reviewer checks these DOM/CSS facts in DevTools.

## DOM Contract

1. `body` first children include exactly two fixed layers in order:
   `#backdrop` (pumpkin scene) then `#backdrop-grain` (noise).
2. Both layers: `position: fixed; inset: 0; pointer-events: none;`
   and `aria-hidden="true"`.
3. `#backdrop` contains exactly ONE `g.pumpkin` group; no other
   pumpkin-like groups anywhere in the document.
4. Eye glow elements carry class `eye-glow` (one per eye + halo).
5. Foreground `.gate-container` renders above (`z-index` higher) and
   stays fully interactive; backdrop never overlaps controls.

## CSS Contract

- Grain: static tiled noise image, low opacity token
  (`--backdrop-grain-opacity: 0.07`), NO `animation`/`transition`.
- Eye-light: `animation: eye-breathe var(--backdrop-cycle, 7s)
  ease-in-out infinite;` animating `opacity` ONLY; peak keyframe
  opacity <= `--backdrop-glow-peak: 0.28`.
- Keyframes shape: ~0% off, ~35% peak, ~65% off, 65-100% dark rest.
- Reduced motion: `@media (prefers-reduced-motion: reduce)` sets
  `.eye-glow { animation: none; opacity: 0.16; }`.
- Free space: `.gate-container { max-width: 520px; margin-inline:
  auto; padding: 3rem 1.5rem; gap >= 2.5rem; }` desktop wider.
- Contrast: body text vs backdrop tokens must pass legibility
  checks on every view (FR-005).

## Failure Modes

- If SVG fails to parse, the dark base + grain must still render
  (layers are independent; scene is enhancement, base is CSS).
- If CSS animations are throttled (battery saver), eyes freeze at
  whatever frame — still faint, never blocking (FR-009).
