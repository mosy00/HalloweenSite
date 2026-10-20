// Payment configuration — edit these values to change behavior.
export const PAYMENT_CONFIG = {
  // Single valid discount code (case-insensitive). Close friends.
  DISCOUNT_CODE: "SPOOKYFRIEND",

  // Ticket prices in Toman.
  FULL_PRICE: 3800000,
  DISCOUNTED_PRICE: 2900000,
  FULL_PRICE_LABEL: "3.8M Toman",
  DISCOUNTED_PRICE_LABEL: "2.9M Toman",

  // Debit card shown to the visitor for the manual transfer.
  CARD_NUMBER: "6037-9912-5679-5240",
  CARD_OWNER: "Soroush Faghedi",

  // Receipt upload rules (must match the GF File field settings).
  ALLOWED_EXTENSIONS: ["jpg", "jpeg", "png"] as const,
  MAX_FILE_BYTES: 2 * 1024 * 1024, // 2 MB (Gravity Forms server limit)
} as const;

export const GF_CONFIG = {
  // Base URL of the WordPress site (no trailing slash).
  BASE_URL: "https://thisishalloween.ir",

  // Gravity Forms form ID.
  FORM_ID: 1,

  // REST API v2 credentials (Forms > Settings > REST API).
  // Consumer key / secret for OAuth 1.0a signing.
  // NOTE: these are visible in frontend code by design of a
  // browser-direct integration. Rotate if abuse is detected.
  CONSUMER_KEY: "ck_35d511d4bc84ab6267cb9870b8166a556789c48b",
  CONSUMER_SECRET: "cs_9b0ced70e7bdd0c292b4757a5da1f82390db4044",

  // Field input names per GF REST API v2 convention: input_{field_id}.
  // GF docs: "The expected input names are identical to the input names
  // found in the form markup." Field 1 is a Name field; "First" uses
  // input_1_3 per GF's standard sub-field naming.
  FIELD_NAME_KEY: "input_1_3",   // Name (First) — field ID 1, sub-field 3
  FIELD_PHONE_KEY: "input_3",    // Phone — field ID 3
  FIELD_FILE_KEY: "input_4",     // File — field ID 4
} as const;

export function submissionsUrl(): string {
  const base = GF_CONFIG.BASE_URL.replace(/\/+$/, "");
  return `${base}/wp-json/gf/v2/forms/${GF_CONFIG.FORM_ID}/submissions`;
}

// Build a Basic Auth header for Gravity Forms REST API v2.
// The consumer key is the username and the consumer secret is the password.
// This matches what was verified working in Postman.
export function basicAuthHeader(): string {
  const raw = `${GF_CONFIG.CONSUMER_KEY}:${GF_CONFIG.CONSUMER_SECRET}`;
  return `Basic ${btoa(raw)}`;
}



export function isDiscountCode(code: string): boolean {
  return code.trim().toLowerCase() === PAYMENT_CONFIG.DISCOUNT_CODE.trim().toLowerCase();
}

export function priceForCode(code: string): {
  amount: number;
  label: string;
  discounted: boolean;
} {
  const trimmed = code.trim();
  const discounted = isDiscountCode(trimmed);
  return discounted
    ? {
        amount: PAYMENT_CONFIG.DISCOUNTED_PRICE,
        label: PAYMENT_CONFIG.DISCOUNTED_PRICE_LABEL,
        discounted: true,
      }
    : {
        amount: PAYMENT_CONFIG.FULL_PRICE,
        label: PAYMENT_CONFIG.FULL_PRICE_LABEL,
        discounted: false,
      };
}

export function allowedFileExtensions(): string {
  return PAYMENT_CONFIG.ALLOWED_EXTENSIONS.join(", ");
}

export function validateReceipt(file: File): string | null {
  const ext = file.name.split(".").pop()?.toLowerCase();
  if (!ext || !PAYMENT_CONFIG.ALLOWED_EXTENSIONS.includes(ext as (typeof PAYMENT_CONFIG.ALLOWED_EXTENSIONS)[number])) {
    return `Only JPG, JPEG, or PNG images are allowed.`;
  }
  if (file.size > PAYMENT_CONFIG.MAX_FILE_BYTES) {
    return `File is too large. Maximum size is 2 MB.`;
  }
  return null;
}