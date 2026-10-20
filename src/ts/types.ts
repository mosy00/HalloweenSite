// Shared TypeScript types matching contracts/browser-storage.contract.md
// Validation constraints per data-model.md (FR-007, FR-015)

// PuzzleState — stored under halloween_001_puzzle
export interface PuzzleState {
  board: number[];              // 9 elements, 0 = empty space, 1-8 = tile IDs
  targetBoard: number[];        // Fixed solved key arrangement
  moveCount: number;            // Legal moves made this session, integer ≥ 0
  solved: boolean;              // board === targetBoard
  lastMoveAt: number;           // Timestamp (ms) of last tile move, integer ≥ 0
  shuffleOffered: boolean;      // Whether 3-min shuffle offer was shown
}

// VisitorProgress — stored under halloween_001_progress
export type JourneyStep = "puzzle" | "form" | "payment" | "confirmation";

export interface VisitorProgress {
  currentStep: JourneyStep;
  puzzleSolved: boolean;
  formSubmitted: boolean;
}


// RegistrationData — stored under halloween_001_registration
export type SaveStatus = "saved" | "failed" | null;

export interface RegistrationData {
  name: string;                 // Required, non-empty after trim
  phone: string;                // Required, matches /^[\d\s\+\-\(\)]{7,}$/
  discountCode: string;         // Required, min length ≥ 3
  saveStatus: SaveStatus;       // Last save outcome
  savedAt: number | null;       // Timestamp of last successful save, integer ≥ 0 or null
}

// PaymentData — FR-016: discount-gated payment + receipt upload.
export type PriceTier = "full" | "discounted";

export interface PaymentData {
  name: string;                 // input_1_1_3 (Name)
  phone: string;                // input_1_3_visible (Phone)
  discountCode: string;         // Raw code entered by the user
  priceTier: PriceTier;         // "full" or "discounted"
  amount: number;               // 3_800_000 or 2_900_000 (Toman)
  priceLabel: string;           // "3.8M Toman" / "2.9M Toman"
  receiptFile?: File;           // GF file field value
}



