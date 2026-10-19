# Quickstart: Key Puzzle Registration Gate

Validation scenarios that prove the feature works end-to-end. These are manual browser-based checks (no test framework configured — see `research.md` for rationale). Links to `data-model.md` and `contracts/browser-storage.contract.md` are used instead of duplicating type details.

## Prerequisites

- A modern web browser (Chrome, Firefox, Safari, Edge) on desktop or mobile
- The compiled static site served from any static host or opened directly via `file://` (three.js/GSAP loaded from CDN)
- TypeScript compiler (`tsc`) available if rebuilding from `.ts` sources

## Test / Run Commands

| Action | Command | Expected Result |
|---|---|---|
| Type-check TypeScript | `tsc --noEmit` (repo root) | No type errors |
| Open the page | Open `src/index.html` in browser | Heading, "Find it to continue the journey", and 3x3 puzzle visible; nothing below them |
| Narrow viewport check | Resize browser to ≤320px width | Heading and puzzle stack; no horizontal scrolling; all controls tappable |

## Validation Scenarios

### Scenario 1: Solve the puzzle and open the door (FR-001 to FR-005)

1. Open the page in a fresh browser (no `localStorage` data).
2. Verify only the heading block and puzzle are shown.
3. Click/tap tiles adjacent to the empty space; verify they slide into the space. Click non-adjacent tiles; verify nothing moves.
4. Solve the puzzle (reach the key arrangement). Verify:
   - Tiles animate smoothly into the old-key shape
   - The key rotates
   - "The door is open now" appears
   - The scene fades
   - The registration form (name, phone, discount code, Next) appears on the same page
5. Verify the generated start was not trivially close to solved (≥25 legal moves per FR-004).

**Expected**: The journey from arrival to form reveal completes without errors.

### Scenario 2: Submit registration form (FR-006 to FR-011, FR-015, FR-016)

1. With the form visible, leave all fields empty and press Next.
2. Verify inline errors appear next to each offending field; entered values are preserved.
3. Fill in valid name, phone (≥7 digits), and discount code (≥3 chars).
4. Press Next once. Verify:
   - Next button shows a busy state while saving
   - A themed confirmation appears
   - `localStorage["halloween_001_registration"]` contains the three values with `saveStatus: "saved"`
   - `localStorage["halloween_001_progress"]` has `currentStep: "confirmation"`, `formSubmitted: true`
5. Press Next again (duplicate submission). Verify the saved values are replaced (duplicates allowed).
6. Open DevTools → Application → Local Storage. Verify no data is being sent to any server (no network requests).

**Expected**: Form data persists in browser only; no server transmission.

### Scenario 3: Failed save (FR-009)

1. Simulate storage failure (e.g., open browser in private mode with storage disabled, or fill localStorage to quota).
2. Fill valid form data and press Next.
3. Verify: themed error appears, entered values remain in the form, visitor can retry.

**Expected**: No silent data loss.

### Scenario 4: Return visit resumes at current step (FR-011)

1. Solve the puzzle and submit the form (complete Scenarios 1–2).
2. Reload the page in the same browser.
3. Verify: the registration form (or confirmation) appears immediately — no puzzle gate.
4. Open the page in a different browser or incognito window.
5. Verify: the puzzle gate appears (fresh start).

**Expected**: Per-browser step memory works across reloads.

### Scenario 5: 3-minute inactivity shuffle offer (FR-017)

1. Open the page with an unsolved puzzle.
2. Do not move any tile for at least 3 minutes (or reduce the threshold in test build).
3. Verify: a themed offer to deal a fresh shuffle appears within the puzzle area.
4. Accept: verify the board is replaced with a new solvable start ≥25 moves from solved.
5. Decline (in a separate test): verify the current arrangement is unchanged.
6. Verify: the offer does NOT appear on initial page load.

**Expected**: Inactivity offer works as specified; no offer on initial load.

### Scenario 6: Mobile & accessibility (FR-012, FR-013, SC-006, SC-007)

1. Open on a phone-sized screen (≤320px width) or use device emulation.
2. Verify: no horizontal scrolling; heading block and puzzle stack; touch targets comfortably tappable.
3. Enable `prefers-reduced-motion` in OS/browser.
4. Solve the puzzle. Verify: key assembly, rotation, and transitions occur without animation; the form is still revealed.
5. Navigate the puzzle and form using only the keyboard (Tab, Enter, arrow keys).
6. Verify: all interactive elements have accessible names; screen reader can announce errors.

**Expected**: Full journey completable on narrow screens with reduced motion and keyboard-only.

### Scenario 7: Halloween theming (constitution Principle I, FR-014)

1. Review all views (gate, form, confirmation, errors).
2. Verify: copy, colors (orange/purple/black palette), and microcopy reflect the playful-spooky Halloween theme.
3. Verify: no generic or off-theme design elements.

**Expected**: Consistent Halloween theming throughout.

## Expected Outcomes

| Criterion | Pass Condition |
|---|---|
| Puzzle solvability | Every generated start is solvable and ≥25 legal moves from solved |
| Browser persistence | Name, phone, discount code saved in `localStorage`; retrievable on reload |
| No server transmission | Zero network requests for form data in this feature |
| Duplicate submission | Repeat save replaces prior values; allowed |
| Failed save | Themed error + input preserved + retry allowed |
| Return visit | Form/confirmation shown immediately after prior solve/submit |
| 3-minute offer | Themed shuffle offer after inactivity; accept/decline behavior correct |
| Mobile | Journey completable on ≤320px screens with no horizontal scroll |
| Reduced motion | Journey completes without animation when `prefers-reduced-motion` is on |
| Keyboard | Puzzle and form fully operable via keyboard alone |

## References

- Feature spec: `spec.md`
- Data model: `data-model.md`
- Browser storage contract: `contracts/browser-storage.contract.md`
- Implementation plan: `plan.md`
- Research notes: `research.md`