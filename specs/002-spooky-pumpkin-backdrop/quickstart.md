# Quickstart: Spooky Pumpkin Backdrop

Manual browser checks proving the backdrop works end-to-end.
Links to `data-model.md` and `contracts/backdrop-visual.contract.md`
replace duplicated detail.

## Prerequisites

- Modern browser (Chrome/Firefox/Safari/Edge), desktop + 320px
  phone emulation.
- Site served via `npm run dev` (Vite root = `src/`) or `dist/`
  build; DevTools available.

## Test / Run Commands

| Action | Command | Expected Result |
|---|---|---|
| Type-check | `npm run typecheck` | No type errors |
| Dev server | `npm run dev` | Page opens, dark grainy bg |
| Build | `npm run build` | `dist/` builds cleanly |

## Validation Scenarios

### Scenario 1: Dark grainy backdrop, hidden lone pumpkin (FR-001/2/5)

1. Fresh load any view. Verify dark bg + fine static grain, no
   bright areas.
2. Glance 2s: pumpkin NOT obvious. Look ~30s: ONE spooky pumpkin
   discoverable off-center.
3. DevTools: count `g.pumpkin` = 1; grain layer has no animation.
4. Read all text/controls: legible, good contrast over grain.

### Scenario 2: Breathing eye-light (FR-003/4, SC-003)

1. Watch eyes ~15s (2+ cycles): faint ramp -> fully off ->
   brief dark rest -> repeat; slow, subtle, never a beacon.
2. Peak moment: glow faint; pumpkin location still not obvious.
3. Solve puzzle (001 flow): eye cycle keeps running undisturbed
   through assemble -> rotate -> fade -> form.

### Scenario 3: Free space desktop + 320px (FR-006/7, SC-004)

1. Desktop + 320px: content in narrow centered column, wide gaps,
   backdrop visible all sides, ~1/3+ empty; no edge crowding.
2. 320px: no horizontal scroll, no lag; pumpkin scaled, on-screen.

### Scenario 4: Reduced motion (FR-008, SC-005)

1. Enable `prefers-reduced-motion`, reload: zero pulsing anywhere;
   steady faint glow remains; pumpkin intact.

### Scenario 5: Non-interference + perf (FR-009/10, SC-006)

1. Click every control: backdrop never blocks/intercepts.
2. Mobile load: content readable/interactive fast; no jank.

## Expected Outcomes

| Criterion | Pass Condition |
|---|---|
| Static grain | Present, subtle, zero animation |
| One pumpkin | Exactly 1, hard-to-see yet findable |
| Eye cycle | Slow loop w/ dark rest, faint peak |
| Reduced motion | Static glow, no pulse |
| Free space | Airy column both widths, no scroll |
| Legibility | All text/controls pass contrast |

## References

- Spec: `spec.md`; Research: `research.md`
- Data model: `data-model.md`
- Visual contract: `contracts/backdrop-visual.contract.md`
