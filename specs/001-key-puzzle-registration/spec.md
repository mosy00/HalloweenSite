# Feature Specification: Key Puzzle Registration Gate

**Feature Branch**: `001-key-puzzle-registration`

**Created**: 2026-10-18

**Status**: Draft

**Input**: User description: "A registration site whose main page shows a large
heading 'The key is worthy only of intelligent people' followed by 'Find it to
continue the journey', next to a sliding 3x3 puzzle (8 tiles, 1 empty space;
clicking a tile slides it into an adjacent empty space). The tiles' solved
arrangement forms the shape of an old key; each user starts from an unsolved
state that is not even near complete. On solve, the tiles smoothly assemble
into the key, the key rotates, 'The door is open now' is displayed, the scene
fades, and a registration form (name, phone number, secret code, Next button)
appears on the same page. The site must remember that the user solved the
puzzle so they resume at the form or their current step. Form data is stored
in the user's existing WordPress backend via the Gravity Forms API."

## Clarifications

### Session 2026-10-18

- Q: If the same phone number submits the registration form a second time —
  whether by accident, a double visit, or someone else reusing it — should
  the site accept another entry, reject it, or update the original entry?
  → A: Allow duplicates — every successful submission creates a new entry.
- Q (scope revision stated with the answer above): Where should the captured
  form data be stored? → A: Not on the server or in files at all — the form
  data is saved in the visitor's browser only, to carry into the next step;
  delivery to WordPress/Gravity Forms is removed from this feature.
- Q: What should the minimum distance between a generated starting
  arrangement and the solved key be — a solid challenge, hard, or light?
  → A: At least ~25 legal moves from solved — a solid challenge that keeps
  the 5-minute solve target realistic (specified as at least 25 legal moves).
- Q: Since a fresh start is now guaranteed to be at least 25 moves from
  solved (and reloading keeps the current arrangement), should there be a
  "shuffle again" control for stuck visitors — or should the board stay as
  loaded? → C: No permanent control; offer a fresh shuffle automatically
  after a few minutes with no progress.
- Q: Should the form itself verify the code's actual value at Next, or leave
  verification to the next step? → A: (Premise corrected) It is not a
  passcode — it is a discount code for close friends, and in the next step it
  sets a discount on the price. So the browser checks only presence/minimum
  length at the form; the code's true verification and its discount effect
  belong to the next step. Terminology normalized: "secret code" →
  "discount code" throughout this spec.

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Solve the key puzzle to open the door (Priority: P1)

A prospective attendee opens the main page and sees a large heading
"The key is worthy only of intelligent people", the line
"Find it to continue the journey", and — next to the text — a sliding puzzle
on a 3x3 board with 8 tiles and one empty space. Nothing else appears on the
page. Clicking or tapping a tile that is adjacent to the empty space slides
that tile into the space; other tiles do not move. When the tiles reach the
predefined arrangement that forms the shape of an old key, the loose tiles
glide smoothly together into the key silhouette, the key rotates, the message
"The door is open now" appears, the scene fades out, and the registration
form (User Story 2) is revealed on the same page.

**Why this priority**: The puzzle gate is the defining experience of the site
and the entry point to registration; without it there is no journey and no
form. It alone delivers a complete, demonstrable interaction.

**Independent Test**: Open the main page in a fresh browser, verify only the
heading block and the puzzle are shown, solve the puzzle (or load a
pre-solved test state), then verify the assemble → rotate → "The door is open
now" → fade sequence ends with the registration form visible on the same page.

**Acceptance Scenarios**:

1. **Given** a first-time visitor, **When** the main page loads, **Then** the
   heading, the line "Find it to continue the journey", and a 3x3 board with
   exactly 8 tiles and 1 empty space are visible, and no other content
   follows below them.
2. **Given** the board with an empty space, **When** the visitor clicks or
   taps a tile adjacent to the empty space, **Then** the tile slides into the
   empty space; **When** the visitor clicks or taps a non-adjacent tile,
   **Then** no tile moves.
3. **Given** the tiles are one legal move away from the key arrangement,
   **When** the visitor makes that move, **Then** the tiles animate together
   into the old-key shape, the key rotates, "The door is open now" appears,
   the scene fades, and the registration form becomes visible on the same
   page.
4. **Given** a returning puzzle state, **When** the main page loads for a
   visitor who has not yet solved the puzzle, **Then** the board is shown in
   an unsolved arrangement that is not trivially close to the solved state.
5. **Given** a visitor who enabled reduced-motion preferences, **When** the
   puzzle is solved, **Then** the key assembly, rotation, and transition to
   the form occur without animated motion and the form is still revealed.
6. **Given** a visitor who has not moved any tile for at least 3 minutes,
   **When** that inactivity threshold is reached, **Then** a themed offer to
   deal a fresh shuffle appears within the puzzle area; accepting replaces
   the board with a new solvable start at least 25 legal moves from solved,
   and declining leaves the current arrangement unchanged.

---

### User Story 2 - Submit registration through the revealed form (Priority: P2)

After the door opens, the visitor sees a registration form with exactly three
fields — name, phone number, discount code — and a Next button. The visitor
fills in the fields and presses Next. Incomplete or malformed input produces
clear, field-adjacent error messages without erasing what was typed. Valid
input is saved in the visitor's own browser so it carries into the next step
of the journey; nothing is stored on a server in this feature. A successful
save shows a themed confirmation; a failed save shows a themed error, keeps
the entered data, and allows a retry.

**Why this priority**: The site exists to register attendees; the puzzle
without the form captures nobody. It depends on Story 1 only for how the form
is revealed.

**Independent Test**: Reach the form (fresh solve or test bypass of the gate),
submit invalid then valid data, and verify inline validation, the entered
data saved in the browser per successful submission, confirmation on
success, and preserved input plus an error message on failure.

**Acceptance Scenarios**:

1. **Given** the visible form, **When** a required field is empty, the phone
   number cannot be recognized as a phone number, or the discount code is
   shorter than the required minimum, **Then** an inline error appears next to
   the offending field and no entered value is lost.
2. **Given** valid input in all three fields, **When** the visitor presses
   Next once, **Then** the three entered values are saved in the browser for
   the next step and a themed success confirmation is shown; a later repeat
   submission simply replaces the saved values (duplicates are allowed).
3. **Given** a slow or repeated activation of Next (double-click), **When**
   the submission is in flight, **Then** the button shows a busy state and
   only one registration entry is recorded.
4. **Given** the browser cannot save the entered data (for example, storage
   is unavailable or full), **When** the failure is known, **Then** a clear
   themed error is shown, the entered values remain in the form, and the
   visitor can retry.

---

### User Story 3 - Return to the current step without re-solving (Priority: P3)

A visitor who already solved the puzzle in this browser returns to the main
page later. Instead of the puzzle, the page opens directly at the registration
form — or, if they had already submitted, at the confirmation — so they never
repeat a completed step. Visitors who have not solved the puzzle yet still
see the puzzle gate.

**Why this priority**: Required by the feature description for continuity of
the journey, but the site is still usable as a first-visit experience without
it, so it trails the two core stories.

**Independent Test**: Solve the puzzle and reload the main page in the same
browser; verify the form appears immediately with no puzzle. Repeat in a
fresh browser and verify the puzzle gate appears.

**Acceptance Scenarios**:

1. **Given** a visitor who solved the puzzle in this browser, **When** they
   open the main page again, **Then** the puzzle is not shown and the
   registration form (or the later step they are on) is shown immediately.
2. **Given** a visitor who has not solved the puzzle, **When** they open the
   main page again, **Then** the puzzle is shown in an unsolved state.
3. **Given** a visitor who solved the puzzle on one device or browser,
   **When** they open the main page on a different device or browser,
   **Then** the puzzle gate is shown again.

### Edge Cases

- A tile that is not adjacent to the empty space is clicked or tapped →
  nothing moves (optionally a subtle themed nudge); the board is unchanged.
- The page is reloaded in the middle of solving → the visitor is still
  gated; the puzzle reappears unsolved (the in-progress arrangement is kept
  for the session so progress is not silently discarded).
- A generated starting arrangement equals, or is within a trivial number of
  moves of, the solved arrangement → prevented: every generated start is
  solvable yet separated from the solved state by at least 25 legal moves.
- The entered data cannot be saved in the browser (storage unavailable or
  full) → no silent data loss: the visitor sees a clear themed error, keeps
  their input, and may retry.
- The same values (including the same phone number) are submitted again
  later → allowed; the newest saved values simply replace the earlier ones
  for this browser.
- The visitor presses Next repeatedly or double-taps → exactly one entry is
  recorded; the button reflects a busy state while in flight.
- A visitor cannot solve the puzzle → registration is intentionally gated;
  no bypass is offered (this is the designed challenge, not an error); after
  several minutes without progress a fresh shuffle is offered (FR-017), which
  re-challenges the visitor rather than solving for them.
- Keyboard-only or screen-reader visitor → the puzzle and the form remain
  operable (tiles are reachable and activable; errors are announced).
- Very narrow screens (down to phone width) and landscape orientation →
  the heading block and puzzle stack/resize so both remain fully usable
  with no horizontal scrolling.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: The main gate view MUST show the heading
  "The key is worthy only of intelligent people", the line
  "Find it to continue the journey", and the puzzle next to the text, with
  no additional page content following them.
- **FR-002**: The puzzle MUST be a 3x3 sliding board with exactly 8 tiles and
  one empty space; clicking or tapping a tile adjacent to the empty space
  MUST slide that tile into the space, and non-adjacent tiles MUST NOT move.
- **FR-003**: The solved state MUST be a single predefined tile arrangement
  whose combined silhouette forms the shape of an old key, and the system
  MUST detect when that arrangement is reached.
- **FR-004**: Each new visitor MUST start from an arrangement that is
  unsolved and not trivially close to the solved state (separated from it by
  at least 25 legal moves), and every generated start MUST be solvable.
- **FR-005**: When the puzzle is solved, the tiles MUST animate smoothly
  together into the old-key shape, the key MUST rotate, the message
  "The door is open now" MUST appear, the scene MUST fade, and the
  registration form MUST be revealed on the same page.
- **FR-006**: The registration form MUST consist of exactly: a name field, a
  phone number field, a discount code field, and a Next button.
- **FR-007**: Pressing Next MUST validate the fields before submission
  (required name and discount code, recognizable phone number, discount code
  at least the defined minimum length) and MUST show errors adjacent to the
  offending field without clearing any entered value.
- **FR-008**: Pressing Next with valid input MUST save the three entered
  values in the visitor's browser so they persist for the next step of the
  journey; this feature MUST NOT transmit or store the form data on any
  server.
- **FR-009**: A failed save (browser storage unavailable or full) MUST
  produce a clear themed error, MUST preserve the entered values, and MUST
  allow retrying.
- **FR-010**: A successful save MUST show a themed confirmation and mark
  the visitor's step as completed for the return-visit logic.
- **FR-011**: The site MUST remember, per browser, whether the visitor
  already solved the puzzle (and any later step reached) so that a returning
  visitor opens directly at the form or their current step instead of the
  puzzle.
- **FR-012**: The puzzle MUST be operable by keyboard alone (tiles reachable
  and activatable) and by touch, and MUST honor reduced-motion preferences by
  replacing animated transitions with instant state changes.
- **FR-013**: Every view (gate, form, confirmation, error states) MUST be
  fully usable on phone-sized screens; on narrow screens the heading block
  and puzzle MUST reflow (for example, stacked) so both remain usable with
  no horizontal scrolling, and touch targets MUST be comfortably tappable.
- **FR-014**: All views, states, copy, and feedback MUST follow the project
  constitution: consistent playful-spooky Halloween theming, all-ages tone,
  and clear unambiguous action/error wording.
- **FR-015**: Verification of the discount code's value MUST NOT occur in
  this feature; it is deferred to the next step that consumes the
  browser-saved data, where the code sets a discount on the price. Only
  presence and minimum-length checks apply at the form.
- **FR-016**: While a save is in flight the Next button MUST show a busy
  state and further activations MUST NOT create additional saved records.
- **FR-017**: After at least 3 minutes without any tile move, the system
  MUST present a themed offer (within the puzzle area) to deal a fresh
  shuffle; accepting MUST replace the current arrangement with a new solvable
  start at least 25 legal moves from solved, and declining MUST leave the
  board unchanged. The offer MUST NOT appear on initial page load — the gate
  view still shows only the heading block and the puzzle.

### Key Entities *(include if feature involves data)*

- **Puzzle State**: The visitor's board — the ordered positions of the 8
  tiles plus the empty space — with a single fixed target arrangement (the
  old-key shape), a solvability guarantee, and a minimum distance of 25
  legal moves from the target for generated starts.
- **Visitor Progress**: Per-visitor journey position (at the puzzle gate, at
  the form, or registered/confirmed) and whether the puzzle has been solved,
  remembered per browser for return visits.
- **Registration Submission**: The captured entry — name, phone number,
  discount code, and save status (saved, failed) — held in the visitor's
  browser to carry into the next step; not stored on any server in this
  feature.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: At least 80% of first-time users who start the puzzle can
  solve it and see the registration form within 5 minutes, without
  assistance, in usability testing.
- **SC-002**: The complete journey — arrival, puzzle solve, form fill, and
  confirmation — is completable in under 5 minutes on a phone-sized screen.
- **SC-003**: 100% of generated starting arrangements are solvable and differ
  from the solved state by at least 25 legal moves; zero visitors ever
  receive an already-solved or trivially-solved board.
- **SC-004**: A returning visitor who already solved the puzzle sees the
  registration form (or their current step) immediately on page open, without
  re-solving the puzzle, in the same browser.
- **SC-005**: 100% of successful saves persist all three entered values in
  the browser for the next step, and 100% of failed saves show an explicit
  error to the visitor with their input preserved — no silent data loss.
- **SC-006**: All views work on screens as narrow as 320 px with no
  horizontal scrolling, and the registration flow is completable end to end
  on such a screen.
- **SC-007**: With reduced-motion enabled, the whole journey completes with
  no animated transitions while still showing the key shape, the
  "The door is open now" message, and the form.

## Assumptions

- The "old key" solved state is one fixed, pre-designed arrangement of the
  8 tiles (artwork composed across the tiles); the empty cell is part of the
  key composition and does not move.
- The puzzle follows standard 8-puzzle sliding rules; solvability is
  guaranteed by generating starts from the solved state via legal shuffling
  plus a minimum-distance threshold, so no start is unsolvable or near-solved.
- "Not even near complete" is interpreted as at least 25 legal moves away
  from the solved arrangement.
- The puzzle is a themed gate and challenge, not authentication; the code
  field is a discount code shared with close friends (formerly referred to
  as a "secret code" / passcode). In this feature the browser checks only
  its presence and a modest minimum length; the code's true verification and
  its discount effect belong to the next step, where it sets a discount on
  the price.
- Progress persistence uses browser-side storage; the same device and
  browser resume at the current step, while a different device or browser
  starts from the puzzle again — acceptable for an event-registration site.
- The phone number field accepts common formats with basic sanity checking
  in the browser; full validation and normalization are deferred to whatever
  consumes the browser-saved data in a later step.
- The Next button submits this single-step form; a themed confirmation is
  the end of this feature, and any further steps beyond registration are out
  of scope here.
- Per the clarified scope, this feature performs no server-side storage or
  transmission of the form data; any later delivery to a backend (e.g., the
  WordPress site's Gravity Forms) happens in a subsequent step that consumes
  the browser-saved values and is out of scope here.
- Reloading mid-puzzle keeps the visitor gated with their in-progress
  arrangement for the session; only solving (or a prior solve) opens the door.

