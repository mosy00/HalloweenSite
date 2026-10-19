# Data Model: Key Puzzle Registration Gate

All data lives in the visitor's browser (`localStorage`). Nothing is stored on any server in this feature. Data shapes below are the in-memory TypeScript types and their `localStorage` serialization format.

## Entities

### 1. PuzzleState

Represents the current 3x3 sliding puzzle board.

| Field | Type | Description | Validation |
|---|---|---|---|
| `board` | `number[]` | 9-element array (indices 0–8), where `0` = empty space, values 1–8 = tile IDs | Exactly 9 elements; contains `0` exactly once; values 0–8 each exactly once |
| `targetBoard` | `number[]` | The solved key arrangement (same shape as `board`) | Same constraints as `board`; fixed constant |
| `moveCount` | `number` | Number of legal moves made in this session | Integer ≥ 0 |
| `solved` | `boolean` | Whether `board` equals `targetBoard` | Derived: `board.every((v,i) => v === targetBoard[i])` |
| `lastMoveAt` | `number` | Timestamp (ms) of the last tile move, for the 3-minute inactivity timer | Integer ≥ 0 |
| `shuffleOffered` | `boolean` | Whether the 3-minute shuffle offer has been shown (reset on new activity) | Boolean |

**State transitions**:
- `unsolved` → `solving`: visitor makes first legal move (`moveCount` increments)
- `solving` → `solved`: board matches target → triggers assemble/rotate/fade sequence → reveals form
- `solved` → `solved`: no further puzzle interaction; form is the active step
- `unsolved` → `reshuffled`: visitor accepts FR-017 offer → new random start ≥25 moves from target, `moveCount` reset to 0
- Any state → any state on page reload: `board`, `moveCount`, `solved` persist; `lastMoveAt` persists

**Validation rule (FR-004)**: Generated starting arrangements must be solvable and separated from `targetBoard` by at least 25 legal moves. Solvability is guaranteed by generating from `targetBoard` via legal shuffles; the distance threshold is enforced by counting shuffle moves.

### 2. VisitorProgress

Tracks where the visitor is in the journey, per browser.

| Field | Type | Description | Validation |
|---|---|---|---|
| `currentStep` | `"puzzle" \| "form" \| "confirmation"` | The active step shown to the visitor | One of the three literals |
| `puzzleSolved` | `boolean` | Whether the visitor has ever solved the puzzle in this browser | Boolean |
| `formSubmitted` | `boolean` | Whether the visitor has successfully saved the form | Boolean |

**State transitions**:
- `puzzle` → `form`: puzzle solved (`solved === true`) → `currentStep = "form"`, `puzzleSolved = true`
- `form` → `confirmation`: valid save succeeds → `currentStep = "confirmation"`, `formSubmitted = true`
- On page load: read `currentStep`; if `form` or `confirmation`, skip the puzzle and show the corresponding step; otherwise show the puzzle

### 3. RegistrationData

The form data entered by the visitor, saved to browser only.

| Field | Type | Description | Validation (FR-007, FR-015) |
|---|---|---|---|
| `name` | `string` | Visitor's full name | Required; non-empty after trim |
| `phone` | `string` | Visitor's phone number | Required; must match a basic phone pattern (digits, spaces, `+`, `-`, `(`, `)`) |
| `discountCode` | `string` | Discount code for close friends | Required; min length (e.g., 3 characters) — presence/min-length only; no value verification in this feature |
| `saveStatus` | `"saved" \| "failed" \| null` | Last save outcome | One of the three literals; `null` until first attempt |
| `savedAt` | `number \| null` | Timestamp of last successful save | Integer ≥ 0 or null |

**Validation rules**:
- Name: required, trimmed, non-empty
- Phone: required, must contain at least 7 digits and match `/^[\d\s\+\-\(\)]{7,}$/`
- Discount code: required, length ≥ 3 (configurable minimum)
- Duplicate submissions: allowed; every successful save replaces prior values for this browser (FR-008, User Story 2 acceptance #2)
- No value verification of the discount code occurs here (FR-015) — deferred to the next step

## localStorage Keys

| Key | Value | Purpose |
|---|---|---|
| `halloween_001_puzzle` | JSON-serialized `PuzzleState` | Current board, solved flag, move count, inactivity timer |
| `halloween_001_progress` | JSON-serialized `VisitorProgress` | Current journey step |
| `halloween_001_registration` | JSON-serialized `RegistrationData` | Form data for the next step |

## Storage Behavior

- **Persistence**: All three keys persist across browser restarts (returning visitors resume at their step).
- **Scope**: Same browser + same device only. Different browser/device restarts at the puzzle (documented assumption in spec).
- **Failure handling**: If `localStorage` is unavailable or full (quota exceeded), save attempts catch the error, set `saveStatus = "failed"`, preserve entered values in the form, and show a themed error (FR-009).
- **No server transmission**: This feature never reads from or writes to any network endpoint (FR-008).