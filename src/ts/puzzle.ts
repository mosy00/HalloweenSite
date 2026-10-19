// Key Puzzle — 3x3 sliding tile puzzle with three.js rendering and GSAP animations
// Covers US1 tasks T010–T017

import * as THREE from "three";
import { gsap } from "gsap";
import type { PuzzleState } from "./types";
import {
  readPuzzleState,
  writePuzzleState,
  readProgress,
  writeProgress,
} from "./storage";
import { THEME } from "./theme";
import { initForm } from "./form";

const TILE_COUNT = 8;
const MIN_SHUFFLE_MOVES = 25;
const INACTIVITY_MS = 3 * 60 * 1000;

const puzzleEl = document.getElementById("puzzle");
const formEl = document.getElementById("form");
const confirmationEl = document.getElementById("confirmation");
const doorMessageEl = document.getElementById("door-message");

let scene: THREE.Scene;
let camera: THREE.PerspectiveCamera;
let renderer: THREE.WebGLRenderer;
let tiles: THREE.Mesh[] = [];
let emptyIndex = 8;

let state: PuzzleState;
let lastMoveAt = 0;
let shuffleTimer: number | null = null;
let shuffleOffered = false;
let reducedMotion = false;
let successRunning = false;

// Shared raycaster for tile picking (click + drag)
const raycaster = new THREE.Raycaster();

const TARGET_BOARD: number[] = [1, 2, 3, 4, 5, 6, 7, 8, 0];

const GRID_POS: { x: number; y: number }[] = [
  { x: -1, y: 1 },
  { x: 0, y: 1 },
  { x: 1, y: 1 },
  { x: -1, y: 0 },
  { x: 0, y: 0 },
  { x: 1, y: 0 },
  { x: -1, y: -1 },
  { x: 0, y: -1 },
  { x: 1, y: -1 },
];

const KEY_ART_SIZE = 768;
const KEY_CELL = KEY_ART_SIZE / 3;

function drawSparkle(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  r: number,
  color: string
): void {
  ctx.fillStyle = color;
  ctx.beginPath();
  ctx.moveTo(x, y - r);
  ctx.quadraticCurveTo(x, y, x + r, y);
  ctx.quadraticCurveTo(x, y, x, y + r);
  ctx.quadraticCurveTo(x, y, x - r, y);
  ctx.quadraticCurveTo(x, y, x, y - r);
  ctx.fill();
}

// Old-key silhouette shared by all tiles. Tile (tileId) shows the cell at
// index (tileId - 1), so the solved board reassembles the full key.
function drawKeyShape(
  ctx: CanvasRenderingContext2D,
  dx: number,
  dy: number,
  color: string
): void {
  ctx.fillStyle = color;
  // Bow (ring)
  ctx.beginPath();
  ctx.arc(384 + dx, 230 + dy, 190, 0, Math.PI * 2);
  ctx.arc(384 + dx, 230 + dy, 92, 0, Math.PI * 2);
  ctx.fill("evenodd");
  // Collar
  ctx.fillRect(322 + dx, 396 + dy, 124, 40);
  // Shaft
  ctx.fillRect(354 + dx, 436 + dy, 60, 210);
  // Teeth: both extend left across the shaft; lower tooth stretches
  // further left so it reaches into the 7th tile (bottom-left) and stays
  // distinguishable from the empty 9th slot
  ctx.fillRect(234 + dx, 534 + dy, 180, 38);
  ctx.fillRect(180 + dx, 592 + dy, 234, 42);
  // Rounded tip
  ctx.beginPath();
  ctx.arc(384 + dx, 646 + dy, 30, 0, Math.PI);
  ctx.fill();
}

// Paints the full 3x3 key artwork once; each tile samples its own cell.
// Bottom-right cell is intentionally plain background (it is the empty slot).
function paintKeyArt(): HTMLCanvasElement {
  const art = document.createElement("canvas");
  art.width = KEY_ART_SIZE;
  art.height = KEY_ART_SIZE;
  const ctx = art.getContext("2d");
  if (!ctx) throw new Error("2D canvas context unavailable");

  ctx.fillStyle = THEME.colors.surface;
  ctx.fillRect(0, 0, KEY_ART_SIZE, KEY_ART_SIZE);

  // Faint Halloween sparkles so even background-only tiles are recognizable
  const sparkleColor = "rgba(212, 160, 23, 0.35)";
  drawSparkle(ctx, 90, 90, 16, sparkleColor);
  drawSparkle(ctx, 150, 650, 14, sparkleColor);
  drawSparkle(ctx, 660, 110, 15, sparkleColor);
  drawSparkle(ctx, 60, 330, 11, sparkleColor);
  drawSparkle(ctx, 655, 430, 12, sparkleColor);
  drawSparkle(ctx, 250, 700, 13, sparkleColor);
  ctx.fillStyle = "rgba(212, 160, 23, 0.22)";
  for (const [x, y, r] of [
    [200, 60, 5],
    [40, 520, 6],
    [560, 250, 5],
    [700, 560, 6],
    [330, 60, 4],
    [480, 720, 5],
  ] as const) {
    ctx.beginPath();
    ctx.arc(x, y, r, 0, Math.PI * 2);
    ctx.fill();
  }

  // Key: shadow pass offset down-right, then gold pass on top
  drawKeyShape(ctx, 10, 12, THEME.colors.keyShadow);
  drawKeyShape(ctx, 0, 0, THEME.colors.key);

  // Tile seams — they line up into a grid when the puzzle is solved
  ctx.strokeStyle = "rgba(255, 107, 0, 0.55)";
  ctx.lineWidth = 4;
  for (let i = 1; i < 3; i++) {
    ctx.beginPath();
    ctx.moveTo(KEY_CELL * i, 0);
    ctx.lineTo(KEY_CELL * i, KEY_ART_SIZE);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(0, KEY_CELL * i);
    ctx.lineTo(KEY_ART_SIZE, KEY_CELL * i);
    ctx.stroke();
  }

  return art;
}

function sizeRenderer(): void {
  const canvas = renderer.domElement;
  const parent = canvas.parentElement;
  // Fallbacks: flex/percentage layout can report 0 before first paint
  const w = canvas.clientWidth || parent?.clientWidth || 300;
  const h = canvas.clientHeight || parent?.clientHeight || 300;
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
  // updateStyle=false: keep CSS sizing (100%), only set the drawing buffer
  renderer.setSize(Math.max(1, Math.floor(w)), Math.max(1, Math.floor(h)), false);
  camera.aspect = w / Math.max(1, h);
  camera.updateProjectionMatrix();
}

function showWebGLError(): void {
  if (!puzzleEl) return;
  const msg = document.createElement("p");
  msg.textContent =
    "Your browser could not start WebGL, which the key puzzle needs. Please try a recent version of Chrome, Edge, Firefox, or Safari.";
  msg.style.cssText = `color: ${THEME.colors.text}; padding: 1rem; text-align: center;`;
  puzzleEl.appendChild(msg);
}

function initThree(): boolean {
  const canvas = document.getElementById("puzzle-canvas") as HTMLCanvasElement;
  scene = new THREE.Scene();
  scene.background = new THREE.Color(THEME.colors.surface);

  camera = new THREE.PerspectiveCamera(45, 1, 0.1, 100);
  camera.position.set(0, 0, 5);

  try {
    renderer = new THREE.WebGLRenderer({ canvas, antialias: true });
  } catch {
    showWebGLError();
    return false;
  }
  sizeRenderer();

  const light = new THREE.AmbientLight(0xffffff, 0.8);
  scene.add(light);

  const geometry = new THREE.BoxGeometry(0.9, 0.9, 0.2);
  const art = paintKeyArt();
  for (let i = 0; i < TILE_COUNT; i++) {
    // Tile (i + 1) samples the art cell it belongs to when solved, so the
    // solved board visibly reassembles the key
    const cellCanvas = document.createElement("canvas");
    cellCanvas.width = KEY_CELL;
    cellCanvas.height = KEY_CELL;
    const cellCtx = cellCanvas.getContext("2d");
    if (!cellCtx) throw new Error("2D canvas context unavailable");
    const sx = (i % 3) * KEY_CELL;
    const sy = Math.floor(i / 3) * KEY_CELL;
    cellCtx.drawImage(art, sx, sy, KEY_CELL, KEY_CELL, 0, 0, KEY_CELL, KEY_CELL);
    const tex = new THREE.CanvasTexture(cellCanvas);
    tex.colorSpace = THREE.SRGBColorSpace;
    tex.anisotropy = 4;
    const face = new THREE.MeshBasicMaterial({ map: tex });
    const side = new THREE.MeshBasicMaterial({ color: THEME.colors.accentDark });
    // Box face order: +x, -x, +y, -y, +z (front), -z
    const material = [side, side, side, side, face, side];
    const tile = new THREE.Mesh(geometry, material);
    tile.userData = { tileId: i + 1 };
    scene.add(tile);
    tiles.push(tile);
  }

  window.addEventListener("resize", onResize);
  // Continuous render loop — without this nothing is ever drawn (Bug B)
  renderer.setAnimationLoop(() => {
    renderer.render(scene, camera);
  });
  return true;
}

function generateSolvableStart(): number[] {
  let board = [...TARGET_BOARD];
  let empty = 8;
  let moves = 0;

  while (moves < MIN_SHUFFLE_MOVES) {
    const neighbors = getNeighbors(empty);
    const next = neighbors[Math.floor(Math.random() * neighbors.length)];
    board[empty] = board[next];
    board[next] = 0;
    empty = next;
    moves++;
  }

  return board;
}

function getNeighbors(index: number): number[] {
  const pos = GRID_POS[index];
  const neighbors: number[] = [];
  GRID_POS.forEach((p, i) => {
    if (i === index) return;
    const dx = Math.abs(p.x - pos.x);
    const dy = Math.abs(p.y - pos.y);
    if ((dx === 1 && dy === 0) || (dx === 0 && dy === 1)) {
      neighbors.push(i);
    }
  });
  return neighbors;
}

// --- Drag state (pointer-based, works for touch + mouse) ---
let dragPointerId: number | null = null;
let dragTileId: number | null = null;
let dragMoved = false;
let suppressClick = false;
// Cell the dragged tile started from (tracks swaps mid-drag)
let dragFromCell = -1;
let dragStartClientX = 0;
let dragStartClientY = 0;
let dragLastX = 0;
let dragLastY = 0;
let dragLastT = 0;
let dragVelX = 0;
let dragVelY = 0;
const DRAG_TAP_SLOP_PX = 8;
const DRAG_COMPLETE = 0.3;
const DRAG_FLICK_VELOCITY = 2.5; // board cells per second

// Maps a screen-pointer position to the tile under it (or null).
function pickTile(event: PointerEvent, canvas: HTMLCanvasElement): THREE.Mesh | null {
  const rect = canvas.getBoundingClientRect();
  if (rect.width === 0 || rect.height === 0) return null;
  const x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
  const y = -((event.clientY - rect.top) / rect.height) * 2 + 1;
  raycaster.setFromCamera(new THREE.Vector2(x, y), camera);
  const intersects = raycaster.intersectObjects(tiles);
  return intersects.length > 0 ? (intersects[0].object as THREE.Mesh) : null;
}


function onTileClick(tileId: number): void {
  const boardIndex = state.board.indexOf(tileId);
  if (boardIndex === -1) return;

  if (!isAdjacent(boardIndex, emptyIndex)) {
    return;
  }

  const temp = state.board[boardIndex];
  state.board[boardIndex] = state.board[emptyIndex];
  state.board[emptyIndex] = temp;
  emptyIndex = boardIndex;

  state.moveCount += 1;
  state.lastMoveAt = Date.now();
  state.solved = isSolved(state.board);

  renderTiles();
  writePuzzleState(state);

  if (state.solved) {
    onSolved();
  } else {
    resetInactivityTimer();
  }
}

function onPointerDown(event: PointerEvent, canvas: HTMLCanvasElement): void {
  if (state.solved || successRunning || dragPointerId !== null) return;
  if (event.pointerType === "mouse" && event.button !== 0) return;
  const tile = pickTile(event, canvas);
  if (!tile) return;
  dragPointerId = event.pointerId;
  dragTileId = tile.userData.tileId as number;
  dragMoved = false;
  dragFromCell = state.board.indexOf(dragTileId);
  dragStartClientX = event.clientX;
  dragStartClientY = event.clientY;
  dragLastX = event.clientX;
  dragLastY = event.clientY;
  dragLastT = performance.now();
  dragVelX = 0;
  dragVelY = 0;
  try {
    canvas.setPointerCapture(event.pointerId);
  } catch {
    // Pointer capture is best-effort; dragging still works without it
  }
}

function onPointerMove(event: PointerEvent): void {
  if (event.pointerId !== dragPointerId || dragTileId === null) return;
  const tile = tiles[dragTileId - 1];
  if (!tile) return;
  if (
    Math.hypot(event.clientX - dragStartClientX, event.clientY - dragStartClientY) >
    DRAG_TAP_SLOP_PX
  ) {
    dragMoved = true;
    gsap.killTweensOf(tile.position);
  } else if (!dragMoved) {
    return; // still within tap slop — don't move anything yet
  }
  const now = performance.now();
  const dt = (now - dragLastT) / 1000;
  const rect = renderer.domElement.getBoundingClientRect();
  const cellW = rect.width > 0 ? rect.width / 3 : 1;
  const cellH = rect.height > 0 ? rect.height / 3 : 1;
  if (dt > 0) {
    dragVelX = (event.clientX - dragLastX) / cellW / dt;
    dragVelY = (event.clientY - dragLastY) / cellH / dt;
  }
  dragLastX = event.clientX;
  dragLastY = event.clientY;
  dragLastT = now;

  // Move the tile 1:1 with the finger in board cells, then clamp each
  // axis to one cell so it stays inside the 3x3 grid.
  const from = GRID_POS[dragFromCell];
  const dxCells = (event.clientX - dragStartClientX) / cellW;
  const dyScreen = (event.clientY - dragStartClientY) / cellH;
  const targetX = Math.max(-1, Math.min(1, from.x + dxCells));
  const targetY = Math.max(-1, Math.min(1, from.y - dyScreen));
  tile.position.x = Math.max(from.x - 1, Math.min(from.x + 1, targetX));
  tile.position.y = Math.max(from.y - 1, Math.min(from.y + 1, targetY));

  // Mid-drag swap: sliding into a neighboring empty cell exchanges the
  // empty slot, so the tile can travel across the board in one gesture.
  const cellX = Math.round(tile.position.x);
  const cellY = Math.round(tile.position.y);
  const entered = GRID_POS.findIndex((p) => p.x === cellX && p.y === cellY);
  if (entered !== -1 && entered !== dragFromCell && state.board[entered] === 0) {
    commitDragMove(dragTileId, dragFromCell, entered);
  }
  renderer.render(scene, camera);
}

// Records a mid-drag swap: the tile formally moves into the empty cell,
// updating state, move count and the inactivity timer exactly like a tap.
function commitDragMove(tileId: number, fromCell: number, toCell: number): void {
  state.board[toCell] = tileId;
  state.board[fromCell] = 0;
  emptyIndex = fromCell;
  dragFromCell = toCell;
  state.moveCount += 1;
  state.lastMoveAt = Date.now();
  lastMoveAt = state.lastMoveAt;
  state.solved = isSolved(state.board);
  writePuzzleState(state);
  if (state.solved) {
    finishDrag();
    onSolved();
  } else {
    resetInactivityTimer();
  }
}

function finishDrag(): void {
  dragPointerId = null;
  dragTileId = null;
  dragMoved = false;
  dragFromCell = -1;
}

function onPointerUp(event: PointerEvent): void {
  if (event.pointerId !== dragPointerId || dragTileId === null) return;
  const tileId = dragTileId;
  if (dragMoved) {
    suppressClick = true;
    const tile = tiles[tileId - 1];
    const home = GRID_POS[dragFromCell];
    // Decide where the tile settles: same rule as a tap — it may only
    // occupy the empty slot when adjacent to it.
    const towardEmpty = isAdjacent(dragFromCell, emptyIndex);
    const distToHome = tile ? Math.hypot(tile.position.x - home.x, tile.position.y - home.y) : 1;
    const flick = Math.hypot(dragVelX, dragVelY) > DRAG_FLICK_VELOCITY;
    if (towardEmpty && (distToHome >= DRAG_COMPLETE || (flick && distToHome >= 0.08))) {
      commitDragMove(tileId, dragFromCell, emptyIndex);
    }
    if (!state.solved && tile) {
      const rest = GRID_POS[state.board.indexOf(tileId)];
      if (reducedMotion) {
        tile.position.set(rest.x, rest.y, 0);
      } else {
        gsap.to(tile.position, {
          x: rest.x,
          y: rest.y,
          duration: THEME.animation.duration,
          ease: THEME.animation.ease,
        });
      }
    }
    finishDrag();
  } else {
    // Genuine tap (within slop): same behavior as the click handler.
    finishDrag();
    onTileClick(tileId);
  }
}

function onPointerCancel(event: PointerEvent): void {
  if (event.pointerId !== dragPointerId || dragTileId === null) return;
  const tileId = dragTileId;
  const cell = state.board.indexOf(tileId);
  const rest = GRID_POS[cell === -1 ? dragFromCell : cell];
  const tile = tiles[tileId - 1];
  if (tile && rest) tile.position.set(rest.x, rest.y, 0);
  finishDrag();
}

function onSolved(): void {
  if (shuffleTimer) clearInterval(shuffleTimer);
  shuffleTimer = null;
  shuffleOffered = false;

  if (!reducedMotion) {
    // three.js rotation lives on .rotation — tween each mesh's y rotation
    tiles.forEach((tile, i) => {
      gsap.to(tile.rotation, {
        y: Math.PI * 2,
        duration: THEME.animation.duration * 2,
        ease: THEME.animation.ease,
        delay: i * 0.05,
      });
    });
  }

  if (doorMessageEl) {
    doorMessageEl.textContent = "The door is open now";
    doorMessageEl.hidden = false;
    gsap.to(doorMessageEl, {
      opacity: 1,
      duration: THEME.animation.duration,
      ease: THEME.animation.ease,
    });
  }

  gsap.to(scene.background, { r: 0.1, g: 0.05, b: 0.1, duration: 1 });
  gsap.to(puzzleEl, {
    opacity: 0,
    duration: 1,
    ease: THEME.animation.ease,
    onComplete: () => {
      if (puzzleEl) puzzleEl.hidden = true;
      if (formEl) formEl.hidden = false;
      initForm(); // wire up validation + Next button for the revealed form
      gsap.to(formEl, { opacity: 1, duration: 0.5 });
    },
  });

  const progress = readProgress() || {
    currentStep: "puzzle",
    puzzleSolved: false,
    formSubmitted: false,
  };
  progress.currentStep = "form";
  progress.puzzleSolved = true;
  writeProgress(progress);
}

function onResize(): void {
  if (!renderer) return;
  sizeRenderer();
  // Re-render once so the frame is never stale after a layout change
  renderer.render(scene, camera);
}

function isAdjacent(idx1: number, idx2: number): boolean {
  const p1 = GRID_POS[idx1];
  const p2 = GRID_POS[idx2];
  const dx = Math.abs(p1.x - p2.x);
  const dy = Math.abs(p1.y - p2.y);
  return (dx === 1 && dy === 0) || (dx === 0 && dy === 1);
}

function isSolved(board: number[]): boolean {
  for (let i = 0; i < board.length; i++) {
    if (board[i] !== TARGET_BOARD[i]) return false;
  }
  return true;
}

function renderTiles(): void {
  tiles.forEach((tile, i) => {
    const tileId = i + 1;
    const boardIndex = state.board.indexOf(tileId);
    if (boardIndex === -1) return;
    const pos = GRID_POS[boardIndex];

    if (reducedMotion) {
      tile.position.set(pos.x, pos.y, 0);
    } else {
      gsap.to(tile.position, {
        x: pos.x,
        y: pos.y,
        duration: THEME.animation.duration,
        ease: THEME.animation.ease,
      });
    }
  });
}

function resetInactivityTimer(): void {
  if (shuffleTimer) {
    clearInterval(shuffleTimer);
  }
  shuffleTimer = window.setInterval(() => {
    if (Date.now() - lastMoveAt >= INACTIVITY_MS && !shuffleOffered) {
      offerShuffle();
    }
  }, 1000);
}

function offerShuffle(): void {
  shuffleOffered = true;
  state.shuffleOffered = true;
  writePuzzleState(state);

  const offerEl = document.createElement("div");
  offerEl.className = "shuffle-offer";
  offerEl.innerHTML = `
    <p>${THEME.copy.shuffleOffer}</p>
    <button id="shuffle-accept">${THEME.copy.shuffleAccept}</button>
    <button id="shuffle-decline">${THEME.copy.shuffleDecline}</button>
  `;
  offerEl.style.cssText = `
    position: absolute; bottom: 1rem; left: 50%; transform: translateX(-50%);
    background: ${THEME.colors.surface}; border: 2px solid ${THEME.colors.accent};
    color: ${THEME.colors.text}; padding: 1rem; border-radius: 8px;
    text-align: center; z-index: 10;
  `;
  if (puzzleEl) puzzleEl.appendChild(offerEl);

  const acceptBtn = document.getElementById("shuffle-accept");
  const declineBtn = document.getElementById("shuffle-decline");

  acceptBtn?.addEventListener("click", () => {
    acceptShuffle();
    puzzleEl?.removeChild(offerEl);
  });

  declineBtn?.addEventListener("click", () => {
    declineShuffle();
    puzzleEl?.removeChild(offerEl);
  });
}

function acceptShuffle(): void {
  const newBoard = generateSolvableStart();
  state.board = newBoard;
  state.moveCount = 0;
  state.lastMoveAt = Date.now();
  state.solved = false;
  state.shuffleOffered = false;
  emptyIndex = state.board.indexOf(0);
  renderTiles();
  writePuzzleState(state);
  resetInactivityTimer();
}

function declineShuffle(): void {
  resetInactivityTimer();
}

export function initPuzzle(): void {
  reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  if (!initThree()) return;

  const saved = readPuzzleState();
  if (saved && saved.board.length === 9 && !saved.solved) {
    state = saved;
  } else {
    // Fresh board — also recovers from a stale solved board with no
    // matching progress record (e.g. leftover localStorage from testing)
    state = {
      board: generateSolvableStart(),
      targetBoard: TARGET_BOARD,
      moveCount: 0,
      solved: false,
      lastMoveAt: Date.now(),
      shuffleOffered: false,
    };
    writePuzzleState(state);
  }
  emptyIndex = state.board.indexOf(0);

  // Safety net: a saved solved board with form progress means the gate
  // was already passed — hand off to the form with its handlers wired.
  if (state.solved) {
    const progress = readProgress();
    if (progress && progress.currentStep === "form") {
      if (puzzleEl) puzzleEl.hidden = true;
      if (formEl) formEl.hidden = false;
      initForm();
      return;
    }
  }

  const canvas = document.getElementById("puzzle-canvas") as HTMLCanvasElement;
  // Pointer events unify mouse + touch: tap keeps the old click behavior,
  // while press-and-slide drags the tile toward the empty slot.
  canvas.addEventListener("pointerdown", (event) => onPointerDown(event, canvas));
  canvas.addEventListener("pointermove", onPointerMove);
  canvas.addEventListener("pointerup", onPointerUp);
  canvas.addEventListener("pointercancel", onPointerCancel);
  canvas.addEventListener("click", (event) => {
    if (suppressClick) {
      // Synthetic click after a real drag — swallow it so the tile
      // doesn't move twice.
      suppressClick = false;
      event.preventDefault();
      event.stopPropagation();
      return;
    }
    const tile = pickTile(event as unknown as PointerEvent, canvas);
    if (tile) onTileClick(tile.userData.tileId as number);
  });

  renderTiles();
  lastMoveAt = state.lastMoveAt;
  resetInactivityTimer();
}

export function getState(): PuzzleState {
  return state;
}