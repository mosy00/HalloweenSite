# Browser Storage Contract: Key Puzzle Registration Gate

## Purpose

This document defines the browser-side data contract for the key-puzzle registration gate. All data is stored in `localStorage` under feature-scoped keys. A later feature (WordPress/Gravity Forms integration) will consume these values and send them to an API. This feature performs no server transmission.

## Storage Keys

| Key | Value Type | Description |
|---|---|---|
| `halloween_001_puzzle` | `PuzzleState` (JSON) | Current puzzle board, solved flag, move count, inactivity timer |
| `halloween_001_progress` | `VisitorProgress` (JSON) | Current journey step (puzzle / form / confirmation) |
| `halloween_001_registration` | `RegistrationData` (JSON) | Form data (name, phone, discount code, save status) |

## Type Definitions (TypeScript)

```typescript
// PuzzleState — stored under halloween_001_puzzle
export interface PuzzleState {
  board: number[];              // 9 elements, 0 = empty space, 1-8 = tile IDs
  targetBoard: number[];        // Fixed solved key arrangement
  moveCount: number;            // Legal moves made this session
  solved: boolean;              // board === targetBoard
  lastMoveAt: number;           // Timestamp (ms) of last tile move
  shuffleOffered: boolean;      // Whether 3-min shuffle offer was shown
}

// VisitorProgress — stored under halloween_001_progress
export type JourneyStep = "puzzle" | "form" | "confirmation";

export interface VisitorProgress {
  currentStep: JourneyStep;
  puzzleSolved: boolean;
  formSubmitted: boolean;
}

// RegistrationData — stored under halloween_001_registration
export type SaveStatus = "saved" | "failed" | null;

export interface RegistrationData {
  name: string;                 // Required, non-empty after trim
  phone: string;                // Required, basic phone pattern
  discountCode: string;         // Required, min length 3 (presence/min-length only)
  saveStatus: SaveStatus;       // Last save outcome
  savedAt: number | null;       // Timestamp of last successful save
}
```

## Read/Write Contract

### Write (save registration data)

**Trigger**: Visitor presses Next with valid input (FR-008).

**Preconditions**:
- `name` is non-empty after trim
- `phone` matches `/^[\d\s\+\-\(\)]{7,}$/`
- `discountCode` length ≥ 3

**Effects**:
1. Serialize `RegistrationData` to JSON
2. Write to `localStorage["halloween_001_registration"]`
3. Set `saveStatus = "saved"` and `savedAt = Date.now()`
4. Set `VisitorProgress.currentStep = "confirmation"`, `formSubmitted = true`; write to `localStorage["halloween_001_progress"]`
5. Show themed confirmation (FR-010)

**Failure path** (storage unavailable/full):
1. Catch `QuotaExceededError` or `SecurityError`
2. Set `saveStatus = "failed"`, preserve entered values in form
3. Show themed error (FR-009); allow retry

### Write (puzzle state)

**Trigger**: On every legal tile move and on solve.

**Effects**:
1. Update `PuzzleState.board`, `moveCount`, `solved`, `lastMoveAt`
2. Write to `localStorage["halloween_001_puzzle"]`
3. If `solved` becomes true, set `VisitorProgress.currentStep = "form"`, `puzzleSolved = true`; write progress

### Write (shuffle offer)

**Trigger**: After ≥3 minutes with no tile move (FR-017).

**Effects**:
1. Set `PuzzleState.shuffleOffered = true`
2. On accept: generate new board ≥25 moves from `targetBoard`, reset `moveCount = 0`, `lastMoveAt = Date.now()`, `shuffleOffered = false`; write puzzle state
3. On decline: leave board unchanged; `shuffleOffered` may reset on next activity

### Read (on page load)

**Trigger**: Page initialization.

**Behavior**:
1. Read all three keys from `localStorage`
2. If `progress.currentStep === "form"` or `"confirmation"` → skip puzzle, show corresponding step
3. If `progress.currentStep === "puzzle"` → show puzzle with saved board state
4. If no data exists → show fresh puzzle with a generated start ≥25 moves from solved

### Duplicate submission handling

A repeat submission (Next pressed again with valid data) replaces the prior `RegistrationData` values for this browser. `saveStatus` and `savedAt` are updated. Duplicates are allowed (spec clarification Q1).

## Constraints

- **No server transmission**: This contract is browser-only. No HTTP endpoints, no cookies, no fetch/XHR calls.
- **Same-origin only**: `localStorage` is scoped to the origin; data is not accessible cross-origin.
- **Size limit**: `localStorage` typically allows ~5MB per origin; this feature uses well under 1KB.
- **Privacy**: Data persists on the visitor's device. No PII is transmitted in this feature.