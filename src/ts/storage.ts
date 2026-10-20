// localStorage wrapper with feature-scoped keys
// Keys: halloween_001_puzzle, halloween_001_progress, halloween_001_registration
// Per FR-009: try/catch for quota errors, no silent data loss

import type { PuzzleState, VisitorProgress, RegistrationData } from "./types";

const PUZZLE_KEY = "halloween_001_puzzle";
const PROGRESS_KEY = "halloween_001_progress";
const REGISTRATION_KEY = "halloween_001_registration";

type StorageKey = typeof PUZZLE_KEY | typeof PROGRESS_KEY | typeof REGISTRATION_KEY;

function isStorageAvailable(): boolean {
  try {
    const test = "__storage_test__";
    localStorage.setItem(test, test);
    localStorage.removeItem(test);
    return true;
  } catch {
    return false;
  }
}

export function readPuzzleState(): PuzzleState | null {
  return readJSON<PuzzleState>(PUZZLE_KEY);
}

export function writePuzzleState(state: PuzzleState): boolean {
  return writeJSON(PUZZLE_KEY, state);
}

export function readProgress(): VisitorProgress | null {
  return readJSON<VisitorProgress>(PROGRESS_KEY);
}

export function writeProgress(progress: VisitorProgress): boolean {
  return writeJSON(PROGRESS_KEY, progress);
}

export function readRegistrationData(): RegistrationData | null {
  return readJSON<RegistrationData>(REGISTRATION_KEY);
}

export function writeRegistrationData(data: RegistrationData): boolean {
  return writeJSON(REGISTRATION_KEY, data);
}

function readJSON<T>(key: StorageKey): T | null {
  if (!isStorageAvailable()) return null;
  try {
    const raw = localStorage.getItem(key);
    if (raw === null) return null;
    return JSON.parse(raw) as T;
  } catch {
    return null;
  }
}

function writeJSON<T>(key: StorageKey, value: T): boolean {
  if (!isStorageAvailable()) return false;
  try {
    localStorage.setItem(key, JSON.stringify(value));
    return true;
  } catch (e) {
    // QuotaExceededError or SecurityError — FR-009: no silent data loss
    return false;
  }
}

// Removes every key this site stored (puzzle, progress, registration).
// Returns true when storage was reachable and cleared.
export function clearAllSiteData(): boolean {
  if (!isStorageAvailable()) return false;
  try {
    localStorage.removeItem(PUZZLE_KEY);
    localStorage.removeItem(PROGRESS_KEY);
    localStorage.removeItem(REGISTRATION_KEY);
    return true;
  } catch {
    return false;
  }
}

export { PUZZLE_KEY, PROGRESS_KEY, REGISTRATION_KEY };