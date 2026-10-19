---
description: "Task list for key-puzzle-registration feature implementation"
---

# Tasks: Key Puzzle Registration Gate

**Input**: Design documents from `specs/001-key-puzzle-registration/`

**Prerequisites**: plan.md (required), spec.md (required for user stories), research.md, data-model.md, contracts/

**Tests**: None — tests are OPTIONAL and not explicitly requested in the feature specification. Manual validation is covered by `quickstart.md` scenarios.

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (US1, US2, US3)
- Include exact file paths in descriptions

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Project initialization and basic structure

- [x] T001 Create project structure per plan.md: `src/`, `src/css/`, `src/ts/`, `src/assets/`
- [x] T002 Initialize `package.json` with Vite, TypeScript, three.js, GSAP, Vitest as dev dependencies
- [x] T003 [P] Create `tsconfig.json` at repository root: ES2020 target, strict mode, module ESNext
- [x] T004 [P] Create `vite.config.ts` at repository root: dev server, ES module bundling for three.js/GSAP
- [x] T005 [P] Create `src/index.html` with heading block, puzzle container, form container, confirmation container

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Core infrastructure that MUST be complete before ANY user story can be implemented

**⚠️ CRITICAL**: No user story work can begin until this phase is complete

- [x] T006 Create shared TypeScript types in `src/ts/types.ts` matching `contracts/browser-storage.contract.md`: `PuzzleState` (board: number[], targetBoard: number[], moveCount: number ≥ 0, solved: boolean, lastMoveAt: number ≥ 0, shuffleOffered: boolean), `VisitorProgress` (currentStep: "puzzle" | "form" | "confirmation", puzzleSolved: boolean, formSubmitted: boolean), `RegistrationData` (name: string required non-empty after trim, phone: string required matching /^[\d\s\+\-\(\)]{7,}$/, discountCode: string required min length ≥ 3, saveStatus: "saved" | "failed" | null, savedAt: number | null)
- [x] T007 Create `localStorage` wrapper in `src/ts/storage.ts`: feature-scoped keys `halloween_001_puzzle`, `halloween_001_progress`, `halloween_001_registration`; JSON serialize/deserialize; try/catch for quota errors (FR-009)
- [x] T008 [P] Create Halloween theming constants in `src/ts/theme.ts`: orange/purple/black palette, copy, microcopy per FR-014 (constitution Principle I)
- [x] T009 [P] Create mobile-first CSS in `src/css/style.css`: ≤320px width no horizontal scroll (SC-006), heading block and puzzle stack/resize (FR-013), touch targets comfortably tappable (FR-012)
## Phase 3: User Story 1 - Solve the key puzzle to open the door (Priority: P1) 🎯 MVP

**Goal**: Visitor solves 3x3 sliding puzzle, tiles assemble into key silhouette, key rotates, "The door is open now" appears, scene fades, registration form revealed on same page

**Independent Test**: Open main page in fresh browser, verify only heading block and puzzle visible, solve puzzle, verify assemble → rotate → "The door is open now" → fade sequence ends with registration form visible on same page

- [x] T010 [US1] Implement `PuzzleState` board logic in `src/ts/puzzle.ts`: 9-element array, 0 = empty space, values 1–8 each exactly once, `moveCount` integer ≥ 0, `lastMoveAt` timestamp
- [x] T011 [P] [US1] Implement solvable start generation ≥25 legal moves from `targetBoard` in `src/ts/puzzle.ts` (FR-004, SC-003: every generated start solvable, none trivially close to solved)
- [x] T012 [US1] Implement tile click/tap slide behavior in `src/ts/puzzle.ts`: adjacent tile slides into empty space; non-adjacent click does nothing (FR-002)
- [x] T013 [US1] Implement `moveCount` tracking and `lastMoveAt` update on every legal move in `src/ts/puzzle.ts`
- [x] T014 [US1] Implement solved detection → three.js key assemble animation → key rotate → "The door is open now" message → scene fade → reveal registration form in `src/ts/puzzle.ts` (FR-005)
- [x] T015 [US1] Implement 3-minute inactivity shuffle offer in `src/ts/puzzle.ts`: themed offer after ≥3 min no tile move; accept generates new solvable start ≥25 moves and resets `moveCount`; decline leaves board unchanged; no offer on initial load (FR-017)
- [x] T016 [US1] Implement reduced-motion support in `src/ts/puzzle.ts`: when `prefers-reduced-motion` enabled, key assembly/rotation/transitions occur without animation but key shape, message, and form still appear (FR-012, SC-007)
- [x] T017 [US1] Wire puzzle solve → set `VisitorProgress.currentStep = "form"`, `puzzleSolved = true` via `src/ts/storage.ts`
## Phase 4: User Story 2 - Submit registration through the revealed form (Priority: P2)

**Goal**: Visitor fills name, phone, discount code form with inline validation; valid input saved to browser; themed confirmation on success, themed error with input preserved on failure; duplicates allowed

**Independent Test**: Reach the form (fresh solve or test bypass), submit invalid then valid data, verify inline validation, entered data saved in browser per successful submission, confirmation on success, preserved input plus error on failure

- [x] T018 [US2] Create registration form UI in `src/index.html`: exactly three fields (name, phone number, discount code) and Next button
- [x] T019 [US2] Implement form validation in `src/ts/form.ts`: name required non-empty after trim; phone required matching /^[\d\s\+\-\(\)]{7,}$/; discountCode required min length ≥ 3 (per data-model.md validation rules)
- [x] T020 [US2] Implement inline field-adjacent error messages without erasing entered values (FR-007)
- [x] T021 [US2] Implement Next button busy state during save to prevent double submission (one entry recorded while in flight)
- [x] T022 [US2] Implement save to `localStorage["halloween_001_registration"]` in `src/ts/storage.ts`: `saveStatus = "saved"` and `savedAt = Date.now()` on success; `saveStatus = "failed"` on quota/unavailable error with input preserved (FR-009)
- [x] T023 [US2] Implement themed confirmation on successful save and themed error on failure (FR-010, FR-009); no silent data loss (SC-005)
- [x] T024 [US2] Implement duplicate submission allowed: repeat save replaces prior values for this browser (FR-008)
- [x] T025 [US2] Wire save success → set `VisitorProgress.currentStep = "confirmation"`, `formSubmitted = true` via `src/ts/storage.ts`
## Phase 5: User Story 3 - Return to the current step without re-solving (Priority: P3)

**Goal**: Returning visitor who solved puzzle sees form (or confirmation) immediately on page open in same browser; unsolved visitors see puzzle gate; different browser/device shows puzzle again

**Independent Test**: Solve puzzle and reload main page in same browser; verify form appears immediately with no puzzle. Repeat in fresh browser; verify puzzle gate appears

- [x] T026 [US3] Implement page-load step resolution in `src/ts/main.ts`: read `VisitorProgress.currentStep` from storage; show puzzle / form / confirmation accordingly; no data → fresh puzzle
- [x] T027 [US3] Verify same-browser resume at current step vs different browser shows puzzle gate (per assumptions in spec.md)

## Final Phase: Polish & Cross-Cutting Concerns

**Purpose**: Improvements that affect multiple user stories

- [x] T028 [P] Code cleanup and refactoring across `src/ts/` modules
- [x] T029 [P] Verify Halloween theming consistency across all views (gate, form, confirmation, errors) per constitution Principle I and FR-014
- [ ] T030 [P] Run `quickstart.md` validation scenarios (manual browser checks: Scenarios 1–7)
- [x] T031 [P] Production build with Vite (`npm run build`) and verify output
## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies — can start immediately
- **Foundational (Phase 2)**: Depends on Setup completion — BLOCKS all user stories (types, storage, theming, CSS are shared prerequisites)
- **User Stories (Phase 3–5)**: All depend on Foundational phase completion
  - User Story 1 (P1): No dependencies on other stories — can start after Foundational
  - User Story 2 (P2): Depends on User Story 1 only for how the form is revealed (story independence maintained via test bypass)
  - User Story 3 (P3): Depends on User Story 1 (puzzle solved state) and User Story 2 (form submitted state) for step-resolution logic
- **Polish (Final Phase)**: Depends on all desired user stories being complete

### User Story Dependencies

- **US1 (P1)**: Can start after Foundational (Phase 2) — no dependencies on other stories
- **US2 (P2)**: Can start after Foundational (Phase 2) — independently testable via form test bypass
- **US3 (P3)**: Can start after Foundational (Phase 2) — integrates puzzle state from US1 and form state from US2

### Within Each User Story

- Models/types before services
- Services before UI wiring
- Core implementation before integration
- Story complete before moving to next priority

### Parallel Opportunities

- All Setup tasks marked [P] can run in parallel (T003, T004, T005)
- All Foundational tasks marked [P] can run in parallel within Phase 2 (T008, T009)
- Once Foundational completes, US1, US2, US3 can start in parallel if staffed
- All [P] tasks within a user story phase can run in parallel

### Parallel Example: User Story 1

```bash
# Launch board logic and start generation together:
Task: "Implement PuzzleState board logic in src/ts/puzzle.ts"
Task: "Implement solvable start generation ≥25 legal moves from targetBoard in src/ts/puzzle.ts"

# Launch animation and shuffle offer together:
Task: "Implement solved detection → key assemble animation → reveal form in src/ts/puzzle.ts"
Task: "Implement 3-minute inactivity shuffle offer in src/ts/puzzle.ts"
```

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Phase 1: Setup
2. Complete Phase 2: Foundational (CRITICAL — blocks all stories)
3. Complete Phase 3: User Story 1
4. **STOP and VALIDATE**: Test User Story 1 independently per quickstart.md Scenario 1
5. Deploy/demo if ready

### Incremental Delivery

1. Complete Setup + Foundational → Foundation ready
2. Add User Story 1 → Test independently → Deploy/Demo (MVP!)
3. Add User Story 2 → Test independently → Deploy/Demo
4. Add User Story 3 → Test independently → Deploy/Demo
5. Each story adds value without breaking previous stories

### Parallel Team Strategy

With multiple developers:

1. Team completes Setup + Foundational together
2. Once Foundational is done:
   - Developer A: User Story 1 (P1)
   - Developer B: User Story 2 (P2)
   - Developer C: User Story 3 (P3)
3. Stories complete and integrate independently

## Notes

- [P] tasks = different files, no dependencies on incomplete tasks
- [Story] label maps task to specific user story for traceability
- Each user story should be independently completable and testable
- No test framework tasks included — tests are optional per spec.md; manual validation via quickstart.md
- Commit after each task or logical group
- Stop at any checkpoint to validate story independently
- Avoid: vague tasks, same-file conflicts, cross-story dependencies that break independence
