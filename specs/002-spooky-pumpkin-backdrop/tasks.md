---
description: "Task list for spooky-pumpkin-backdrop feature implementation"
---

# Tasks: Spooky Pumpkin Backdrop

**Input**: Design documents from `specs/002-spooky-pumpkin-backdrop/`

**Prerequisites**: plan.md (required), spec.md (required for user stories), research.md, data-model.md, contracts/

**Tests**: None — tests are OPTIONAL and not requested in the spec. Manual validation via `quickstart.md` scenarios.

**Organization**: Tasks grouped by user story for independent implementation and testing.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (US1, US2, US3)
- Include exact file paths in descriptions

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Verify baseline before layering the backdrop

- [X] T001 Verify 001 baseline builds and renders: run `npm run typecheck` and `npm run build`, open `src/index.html` via `npm run dev` and confirm gate/form/confirmation views load

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Backdrop tokens and fixed layer skeleton every story builds on

**CRITICAL**: No user story work can begin until this phase is complete

- [X] T002 Add backdrop design tokens to `src/css/style.css`: `--backdrop-base`, `--backdrop-grain-opacity: 0.07`, `--backdrop-cycle: 7s`, `--backdrop-glow-peak: 0.28`, `--backdrop-steady-glow: 0.16`
- [X] T003 [P] Insert fixed backdrop layer skeleton in `src/index.html`: empty `#backdrop` and `#backdrop-grain` divs as first `body` children before `.gate-container`, each with `aria-hidden="true"`
- [X] T004 Implement fixed positioning and static grain in `src/css/style.css`: both layers `position: fixed; inset: 0; pointer-events: none`, grain tiled `feTurbulence` data-URI at token opacity with NO animation, `.gate-container` stacking above

**Checkpoint**: Foundation ready — stories can now begin in priority order

---

## Phase 3: User Story 1 - Dark grainy backdrop with hidden pumpkin (Priority: P1) MVP

**Goal**: Deep dark static-grain scene with exactly one hard-to-see lone pumpkin behind all content

**Independent Test**: Fresh-load any view; background dark with still grain and no bright areas; pumpkin not obvious in a 2s glance but discoverable within ~30s; DevTools shows exactly one `g.pumpkin`; all text legible (quickstart Scenario 1)

- [X] T005 [US1] Compose single low-contrast pumpkin scene SVG in `src/index.html` inside `#backdrop`: exactly one `g.pumpkin` group, near-background fills, off-center placement, no second pumpkin anywhere
- [X] T006 [US1] Style pumpkin subtlety and layering in `src/css/style.css`: low group opacity, fluid scaling, `z-index` below `.gate-container`, backdrop intact on gate/form/confirmation views

---

## Phase 4: User Story 2 - Faint breathing eye-light (Priority: P2)

**Goal**: Slow repeating eye-glow loop (faint ramp, fully off, brief dark rest) that never beacons and runs during the puzzle success sequence

**Independent Test**: Watch eyes ~15s for 2+ full cycles with dark rests and faint peak; peak never reveals location; cycle undisturbed through solve animation; reduced-motion shows steady glow, zero pulsing (quickstart Scenarios 2+4)

- [X] T007 [P] [US1] Add eye-glow shapes in `src/index.html` pumpkin SVG: two `eye-glow` ellipses plus soft halo, dim amber fill, initial opacity 0
- [X] T008 [US2] Implement `eye-breathe` keyframes loop in `src/css/style.css`: opacity-only animation on `.eye-glow` using `--backdrop-cycle`, 0% off, ~35% peak capped at `--backdrop-glow-peak` (0.28), ~65% off, 65-100% dark rest, infinite
- [X] T009 [US2] Add reduced-motion fallback in `src/css/style.css`: `@media (prefers-reduced-motion: reduce)` sets `.eye-glow { animation: none; opacity: var(--backdrop-steady-glow); }`, pumpkin stays visible

---

## Phase 5: User Story 3 - Generous free space (Priority: P3)

**Goal**: Airy narrow-column layout with visible backdrop on all sides at desktop and 320px, no crowding or horizontal scroll

**Independent Test**: Gate/form/confirmation on desktop and 320px show centered column, wide gaps, ~1/3+ empty backdrop, no edge-to-edge content, no horizontal scroll (quickstart Scenario 3)

- [X] T010 [US3] Implement airy foreground column in `src/css/style.css`: `.gate-container { max-width: 520px; margin-inline: auto; padding: 3rem 1.5rem; gap >= 2.5rem; }`, wider desktop padding
- [X] T011 [US3] Add 320px adaptation in `src/css/style.css`: reduced but still generous spacing, fluid pumpkin scale, verified no `overflow-x`, no interaction lag

---

## Phase 6: Polish & Cross-Cutting Concerns

**Purpose**: Final validation across all stories

- [X] T012 Run full `quickstart.md` validation (Scenarios 1-5) against `src/index.html` + `src/css/style.css`: contrast on every view, single-pumpkin count, grain static, cycle timing, reduced motion, 320px scroll check, non-interference click-through, then `npm run typecheck` and `npm run build` green

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies — start immediately
- **Foundational (Phase 2)**: Depends on Setup — BLOCKS all stories
- **User Stories (Phases 3-5)**: Depend on Foundational; sequential P1 → P2 → P3 (same two files, no same-file parallelism)
- **Polish (Phase 6)**: Depends on all stories complete

### User Story Dependencies

- **US1 (P1)**: After Foundational — no other dependencies
- **US2 (P2)**: After Foundational + US1 (eye shapes extend the US1 pumpkin SVG)
- **US3 (P3)**: After Foundational — layout-independent but sequenced after to avoid CSS conflicts

### Within Each User Story

- DOM/SVG structure before CSS styling for that story
- Core visual before reduced-motion/mobile adaptation
- Story validated independently per quickstart before next story

### Parallel Opportunities

- T003 (HTML skeleton) parallel with T002 (CSS tokens) — different files
- T007 (eye SVG in HTML) parallel with T006 (pumpkin CSS) — different files, both after T005
- Everything else sequential: CSS tasks share `src/css/style.css`, SVG tasks share `src/index.html`

---

## Parallel Example: Foundational + US1 boundary

```bash
# Launch tokens + skeleton together (different files):
Task: "Add backdrop design tokens to src/css/style.css"
Task: "Insert fixed backdrop layer skeleton in src/index.html"

# After T005 lands, launch pumpkin styling + eye shapes together:
Task: "Style pumpkin subtlety and layering in src/css/style.css"
Task: "Add eye-glow shapes in src/index.html pumpkin SVG"
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Phase 1: Setup (T001)
2. Complete Phase 2: Foundational (T002-T004)
3. Complete Phase 3: User Story 1 (T005-T006)
4. **STOP and VALIDATE**: quickstart Scenario 1 independently
5. Deploy/demo if ready (static scene stands alone)

### Incremental Delivery

1. Setup + Foundational → layers ready
2. Add US1 → validate → Deploy/Demo (hidden pumpkin scene)
3. Add US2 → validate → Deploy/Demo (living eye-light)
4. Add US3 → validate → Deploy/Demo (airy layout)
5. Polish → full quickstart green

---

## Notes

- [P] tasks = different files, no dependencies on incomplete tasks
- [Story] label maps task to user story for traceability
- T007 labeled [US1]-adjacent HTML work done in parallel with T006; eye behavior completed by T008-T009 [US2]
- No test-framework tasks: spec requires manual browser validation only
- Data-model constraints quoted verbatim: grainOpacity 0.05-0.10; peakGlow <= 0.28; cycleMs ~7000ms; pumpkinCount exactly 1; eyeState cycling default / steady under reduced motion
- Contract: `contracts/backdrop-visual.contract.md` governs DOM/CSS facts
- Commit after each task; stop at any checkpoint to validate
- Avoid: second pumpkin, animated grain, bright peak, JS timers, new storage keys


