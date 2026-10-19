# Implementation Plan: Spooky Pumpkin Backdrop

**Branch**: `002-spooky-pumpkin-backdrop` | **Date**: 2026-10-19 | **Spec**: `specs/002-spooky-pumpkin-backdrop/spec.md`

**Input**: Feature specification from `/specs/002-spooky-pumpkin-backdrop/spec.md`

## Summary

Site-wide atmospheric backdrop over the 001 gate views: dark base +
static SVG-noise grain, exactly one low-contrast pumpkin fixed
behind content, eyes on a slow faint CSS breathing loop (ramp, off,
dark rest, repeat), and an airy narrow-column layout. Pure CSS +
inline SVG; no JS, storage, or network.

## Technical Context

**Language/Version**: TypeScript ES2020 via Vite; backdrop is CSS +
inline SVG in `src/index.html` / `src/css/style.css` (no new TS).

**Primary Dependencies**: None new (existing Vite, three.js, GSAP
for puzzle only). Backdrop uses no JS library.

**Storage**: N/A (presentational only; `halloween_001_*` unchanged).

**Testing**: Manual browser checks per `quickstart.md`; `npm run
typecheck` stays green. No new unit tests (no logic).

**Target Platform**: Modern browsers, desktop + 320px phones; static
hosting (same as 001).

**Project Type**: Static frontend single-page site.

**Performance Goals**: Zero added requests; backdrop <3KB inline;
opacity-only animation at 60fps; content interactive fast on 4G.

**Constraints**: Grain fully static; peak glow faint (<=0.28);
`prefers-reduced-motion` static glow; exactly one pumpkin; no
horizontal scroll at 320px; backdrop never blocks foreground.

**Scale/Scope**: One feature, ~2 files touched, <10KB CSS+SVG added.

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after design.*

| Principle | Gate Requirement | Status | Evidence |
|---|---|---|---|
| I. Halloween Theme Fidelity | Playful-spooky visuals only | PASS | Lone pumpkin, dark night scene, amber glow; orange/purple/black tokens |
| II. Mobile-First | Works at 320px, tappable, no h-scroll | PASS | Fluid SVG, narrow column, FR-007 quickstart checks |
| III. Registration Integrity | No data loss, explicit states | PASS | No storage/network touched; foreground flow untouched |
| IV. Accessible & Performant | Contrast, reduced-motion, fast | PASS | Low grain opacity, legibility checks, static-glow fallback, <3KB |

**Gate Result**: PASS. No violations; no Complexity Tracking needed.

## Project Structure

### Documentation (this feature)

```text
specs/002-spooky-pumpkin-backdrop/
├── plan.md
├── research.md
├── data-model.md
├── quickstart.md
├── contracts/
│   └── backdrop-visual.contract.md
└── tasks.md   # Phase 2 output (NOT created by plan)
```

### Source Code (repository root)

```text
src/
├── index.html        # add #backdrop + #backdrop-grain layers
├── css/
│   └── style.css     # tokens, grain, pumpkin, eye keyframes, spacing
└── ts/               # untouched (main/puzzle/form/storage/theme/types)
```

**Structure Decision**: Single static frontend. Backdrop layers as
fixed siblings before `.gate-container`; 001 logic untouched.

