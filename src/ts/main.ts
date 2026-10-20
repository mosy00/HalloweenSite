// App bootstrap — step management (puzzle / form / payment / confirmation)
// Covers US3 tasks T026–T027

import { initPuzzle } from "./puzzle";
import { initForm, applyServerErrors } from "./form";
import { initAura } from "./aura";
import { readProgress, readRegistrationData, writeProgress } from "./storage";
import { goToStep } from "./step";
import type { JourneyStep } from "./types";
import {
  basicAuthHeader,
  submissionsUrl,
  GF_CONFIG,
  PAYMENT_CONFIG,
  isDiscountCode,
  priceForCode,
  validateReceipt,
} from "./payment-config";

const puzzleEl = document.getElementById("puzzle");
const formEl = document.getElementById("form");
const paymentEl = document.getElementById("payment");
const confirmationEl = document.getElementById("confirmation");

// Payment step elements
const discountInput = document.getElementById("payment-discount") as HTMLInputElement | null;
const applyDiscountBtn = document.getElementById("apply-discount") as HTMLButtonElement | null;
const discountError = document.getElementById("discount-error") as HTMLElement | null;
const cardDisplay = document.getElementById("card-display") as HTMLElement | null;
const cardNumberEl = document.getElementById("card-number") as HTMLElement | null;
const cardHolderEl = document.getElementById("card-holder") as HTMLElement | null;
const priceEl = document.getElementById("payment-price") as HTMLElement | null;
const receiptInput = document.getElementById("receipt-file") as HTMLInputElement | null;
const receiptError = document.getElementById("receipt-error") as HTMLElement | null;
const submitBtn = document.getElementById("payment-submit-btn") as HTMLButtonElement | null;
const backBtn = document.getElementById("payment-back-btn") as HTMLButtonElement | null;

// Track whether a discount code has been applied on this payment visit
let discountApplied = false;
let currentDiscountCode = "";

export function initApp(): void {
  const progress = readProgress();
  initAura();

  // Smooth-scroll the anchor cue (progressive enhancement; the href
  // still works natively if this fails)
  document.querySelectorAll('a.scroll-cue[href^="#"]').forEach((anchor) => {
    anchor.addEventListener("click", (event) => {
      const target = document.querySelector(
        (anchor as HTMLAnchorElement).getAttribute("href") || ""
      );
      if (!target) return;
      event.preventDefault();
      const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
      target.scrollIntoView({ behavior: reduce ? "auto" : "smooth", block: "start" });
    });
  });

  if (progress) {
    if (progress.currentStep === "form") {
      showStep("form");
      initForm();
      return;
    }
    if (progress.currentStep === "payment") {
      showStep("payment");
      initPayment();
      return;
    }
    if (progress.currentStep === "confirmation") {
      showStep("confirmation");
      return;
    }
  }

  // Default: show puzzle gate
  showStep("puzzle");
  initPuzzle();
}

// Show/hide the four sections of the trial gate
export function showStep(step: JourneyStep): void {
  if (puzzleEl) puzzleEl.hidden = step !== "puzzle";
  if (formEl) formEl.hidden = step !== "form";
  if (paymentEl) paymentEl.hidden = step !== "payment";
  if (confirmationEl) confirmationEl.hidden = step !== "confirmation";
}

// Initialize the payment step UI (card reveal from stored secret code, receipt upload, GF submission)
export function initPayment(): void {
  // Read the secret code from the stored registration and reveal the card with the right price
  const registration = readRegistrationData();
  const secretCode = registration?.discountCode || "";
  const priceInfo = priceForCode(secretCode);

  if (priceEl) priceEl.textContent = priceInfo.label;
  if (cardNumberEl) cardNumberEl.textContent = PAYMENT_CONFIG.CARD_NUMBER;
  if (cardHolderEl) cardHolderEl.textContent = PAYMENT_CONFIG.CARD_OWNER;
  if (cardDisplay) cardDisplay.hidden = false;

  if (receiptInput) receiptInput.value = "";
  if (receiptError) receiptError.textContent = "";

  // Back → return to the form step
  if (backBtn) {
    backBtn.addEventListener("click", () => {
      goToStep("form");
      initForm();
    });
  }

  // Submit → validate receipt, build FormData, POST to Gravity Forms v2
  if (submitBtn) {
    submitBtn.addEventListener("click", async () => {
      if (!receiptInput || !receiptError) return;

      if (!receiptInput.files || receiptInput.files.length === 0) {
        receiptError.textContent = "Please upload a receipt image.";
        return;
      }

      const file = receiptInput.files[0];
      const fileErr = validateReceipt(file);
      if (fileErr) {
        receiptError.textContent = fileErr;
        return;
      }
      receiptError.textContent = "";

      const reg = readRegistrationData();
      const name = reg?.name || "";
      const phone = reg?.phone || "";

      const formData = new FormData();
      formData.append(GF_CONFIG.FIELD_NAME_KEY, name);
      formData.append(GF_CONFIG.FIELD_PHONE_KEY, phone);
      formData.append(GF_CONFIG.FIELD_FILE_KEY, file, file.name);

      if (submitBtn) {
        submitBtn.disabled = true;
        submitBtn.textContent = "Submitting…";
      }

      try {
        const url = submissionsUrl();
        const auth = basicAuthHeader();

        const response = await fetch(url, {
          method: "POST",
          headers: {
            Authorization: auth,
          },
          body: formData,
        });

        const data = (await response.json()) as {
          is_valid?: boolean;
          validation_messages?: { [key: string]: string };
        };

        if (!response.ok || data.is_valid === false) {
          const messages = data.validation_messages || { generic: "The submission could not be processed." };
          const status = response.status;

          // Reset the button first so the visitor can act immediately.
          if (submitBtn) {
            submitBtn.disabled = false;
            submitBtn.textContent = "Confirm & Submit";
          }

          // Map Gravity Forms field IDs to the step/field that owns them:
          // field 1 (Name) + field 3 (Phone) live on the registration form;
          // field 4 (File) lives on the payment step. Route the visitor back
          // to the matching step and surface the message next to the field.
          const formErrors: { name?: string; phone?: string } = {};
          const keyFor = (key: string): string => {
            const m = key.match(/^(\d+)/);
            return m ? m[1] : key;
          };
          for (const [rawKey, msg] of Object.entries(messages)) {
            const fieldId = keyFor(rawKey);
            if (fieldId === "1" || rawKey === "1") formErrors.name = msg;
            else if (fieldId === "3") formErrors.phone = msg;
            else if (fieldId === "4" && receiptError) {
              receiptError.textContent = `Receipt: ${msg}`;
            }
          }

          if (formErrors.name || formErrors.phone) {
            // Name/phone live on the registration form: go back there so the
            // visitor can correct them, and show each message next to its field.
            writeProgress({ currentStep: "form", puzzleSolved: true, formSubmitted: false });
            showStep("form");
            initForm();
            applyServerErrors(formErrors);
            document.getElementById("form")?.scrollIntoView({ behavior: "smooth", block: "start" });
            if (receiptError) receiptError.textContent = "";
            const parts: string[] = [];
            if (formErrors.name) parts.push(`Name: ${formErrors.name}`);
            if (formErrors.phone) parts.push(`Phone: ${formErrors.phone}`);
            // Keep the original message on payment too in case they return.
            if (receiptError && receiptError.textContent === "") {
              receiptError.textContent = `Please review your details: ${parts.join(" | ")}`;
            }
            return;
          }

          // Receipt/file (or other) errors stay on the payment step.
          if (receiptError) {
            if (messages["4"]) {
              receiptError.textContent = `Receipt: ${messages["4"]}`;
            } else if (!receiptError.textContent) {
              const messageParts = Object.entries(messages).map(([fieldId, msg]) => `${fieldId}: ${msg}`);
              receiptError.textContent = messageParts.join(" | ");
            }
          }
          writeProgress({ currentStep: "payment", puzzleSolved: true, formSubmitted: true });
          showStep("payment");
          document.getElementById("payment")?.scrollIntoView({ behavior: "smooth", block: "start" });

          if (status === 400) {
            // Keep the message inline only — the field text above names the fix.
          } else {
            const generic = Object.entries(messages).map(([fieldId, msg]) => `${fieldId}: ${msg}`).join(" | ");
            alert(`Please fix the following: ${generic}`);
          }
          return;
        }

        // Success: persist and move to confirmation
        writeProgress({ currentStep: "confirmation", puzzleSolved: true, formSubmitted: true });
        showStep("confirmation");
      } catch (err) {
        const message = err instanceof Error ? err.message : "Submission failed. Please try again.";
        alert(message);
        if (submitBtn) {
          submitBtn.disabled = false;
          submitBtn.textContent = "Confirm & Submit";
        }
      }
    });
  }
}

document.addEventListener("DOMContentLoaded", initApp);
