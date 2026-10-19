# Implementation Plan: Key Puzzle Registration Gate

**Branch**: `001-key-puzzle-registration` | **Date**: 2026-10-18 | **Spec**: `specs/001-key-puzzle-registration/spec.md`

**Input**: Feature specification from `/specs/001-key-puzzle-registration/spec.md`

**Note**: This template is filled in by the `/speckit-plan` command; its definition describes the execution workflow.

## Summary

A static, Halloween-themed key-puzzle registration gate. A prospective attendee opens a single page showing the heading "The key is worthy only of intelligent people" next to a 3x3 sliding puzzle (8 tiles, 1 empty space). Solving the puzzle animates the tiles into a key silhouette, reveals "The door is open now", then shows a registration form (name, phone number, discount code). Form data is saved in the visitor's browser only (no server storage or transmission in this feature) to carry into a later step where the discount code sets a price discount. Returning visitors resume at their current step without re-solving.

## Technical Context

**Language/Version**: TypeScript (ES2020 target), compiled by Vite; no framework (no React, no Vue, no build-heavy tooling)

**Primary Dependencies**: three.js (3D tile rendering and scene), GSAP (smooth slide/rotate/fade animations), both as ES modules; Vitest for unit testing; Vite as dev server and build tool

**Build Tooling**: Vite (dev server, TypeScript compilation, ES module bundling, production build)

**Storage**: Browser localStorage — stores puzzle state (current board, solved flag), visitor progress (current journey step), and registration form data (name, phone, discount code, save status); no server, no files, no cookies required

**Testing**: Vitest (unit tests for puzzle logic, validation, storage wrapper); manual browser-based validation scenarios in quickstart.md for end-to-end flow

**Target Platform**: Modern web browsers (desktop and mobile), static file hosting (GitHub Pages, Netlify, Vercel, or any static host)

**Project Type**: Static frontend web site / single-page feature (no backend, no API routes, no server-side rendering)

**Performance Goals**: 60 fps tile drag-and-slide animation, initial page load under 1.5s on 4G mobile, puzzle solve-to-form transition under 500ms

**Constraints**: No backend files (WordPress is the user's own responsibility), form data must persist in browser only, mobile-first responsive (≤320px width), Halloween theming on all views, reduced-motion preference honored, keyboard/screen-reader operable, TypeScript only (no frameworks)

**Scale/Scope**: Single-event Halloween site, low-to-moderate traffic, one feature (puzzle gate + registration form), ~1 page, <10 TS source modules

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

| Constitution Principle | Gate Requirement | Status | Evidence |
|---|---|---|---|
| I. Halloween Theme Fidelity (NON-NEGOTIABLE) | All user-facing elements reflect playful-spooky theme; no generic/off-theme design | PASS | Spec requires themed copy ("The door is open now"), themed errors/confirmations, Halloween voice microcopy; constitution Additional Constraints reinforce this |
| II. Mobile-First Responsiveness (NON-NEGOTIABLE) | Works on phone-sized screens; no horizontal scroll; touch targets tappable; critical flow completable on narrow viewport | PASS | FR-013 requires all views usable on phone screens; SC-006 requires 320px width with no horizontal scrolling; Edge Cases require heading block and puzzle to stack/reflow |
| III. Registration Integrity | Clear validation, field-adjacent errors, no silent data loss; explicit success/failure/loading states | PASS | FR-007 (inline errors, no value clearing), FR-009 (themed error on failed save, input preserved), FR-010 (themed confirmation), SC-005 (100% persisted or explicit error) |
| IV. Accessible & Performant Experience | Contrast, reduced-motion, keyboard/screen-reader operable, optimized assets | PASS | FR-012 (keyboard + touch + reduced-motion), FR-013 (touch targets), SC-007 (reduced-motion completes journey without animation), constitution §IV performance requirements |

**Gate Result**: All four constitution principles pass. No violations, no justifications needed. Complexity Tracking section is not required.

## Project Structure

### Documentation (this feature)

```text
specs/[###-feature]/
├── plan.md              # This file (/speckit-plan command output)
├── research.md          # Phase 0 output (/speckit-plan command)
├── data-model.md        # Phase 1 output (/speckit-plan command)
├── quickstart.md        # Phase 1 output (/speckit-plan command)
├── contracts/           # Phase 1 output (/speckit-plan command)
└── tasks.md             # Phase 2 output (/speckit-tasks command - NOT created by /speckit-plan)
```

### Source Code (repository root)

```text
src/
├── index.html            # Single entry page (gate + form + confirmation)
├── css/
│   └── style.css         # Halloween-themed, mobile-first styles
├── ts/
│   ├── main.ts           # App bootstrap, route-like step management
│   ├── puzzle.ts         # 3x3 sliding puzzle logic (three.js scene, solvability, shuffle)
│   ├── form.ts           # Registration form validation and browser storage
│   ├── storage.ts        # localStorage wrapper (puzzle state, visitor progress, form data)
│   ├── types.ts          # Shared TypeScript interfaces/types
│   └── theme.ts          # Halloween theming constants (colors, copy, microcopy)
└── assets/
    ├── key-silhouette.png # Solved key artwork (composed across tiles)
    └── ...               # Optimized themed assets (fonts, icons)
```

**Structure Decision**: Single project, static frontend. All source under `src/` at repository root; documentation under `specs/001-key-puzzle-registration/`. No backend directory (WordPress integration deferred to a later step). Tests co-located or under a `tests/` directory at repository root, run with Vitest.

## Complexity Tracking

> **Fill ONLY if Constitution Check has violations that must be justified**

Not required — no constitution violations.
