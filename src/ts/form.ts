// Registration form — validation, save, confirmation/error
// Covers US2 tasks T019–T025

import type { RegistrationData } from "./types";
import { writeRegistrationData, readRegistrationData, writeProgress } from "./storage";
import { THEME } from "./theme";
import { gsap } from "gsap";

const formEl = document.getElementById("registration-form");
const nextBtn = document.getElementById("next-btn") as HTMLButtonElement;
const nameInput = document.getElementById("name") as HTMLInputElement;
const phoneInput = document.getElementById("phone") as HTMLInputElement;
const discountCodeInput = document.getElementById("discountCode") as HTMLInputElement;
const nameError = document.getElementById("name-error");
const phoneError = document.getElementById("phone-error");
const discountCodeError = document.getElementById("discountCode-error");
const confirmationEl = document.getElementById("confirmation");
const doorMessageEl = document.getElementById("door-message");

// Validation patterns per data-model.md (FR-007, FR-015)
const PHONE_PATTERN = /^[\d\s\+\-\(\)]{7,}$/;
const MIN_DISCOUNT_LENGTH = 3;

let isSubmitting = false;

function clearErrors(): void {
  [nameError, phoneError, discountCodeError].forEach((el) => {
    if (el) el.textContent = "";
  });
  [nameInput, phoneInput, discountCodeInput].forEach((el) => {
    el.setAttribute("aria-invalid", "false");
  });
}

function showError(field: HTMLElement | null, message: string): void {
  if (!field) return;
  field.textContent = message;
}

function setInputError(input: HTMLInputElement, hasError: boolean): void {
  input.setAttribute("aria-invalid", hasError ? "true" : "false");
}

function validateForm(): boolean {
  clearErrors();
  let valid = true;

  const name = nameInput.value.trim();
  if (!name) {
    showError(nameError, "Name is required.");
    setInputError(nameInput, true);
    valid = false;
  }

  const phone = phoneInput.value.trim();
  if (!phone || !PHONE_PATTERN.test(phone)) {
    showError(phoneError, "Enter a valid phone number (at least 7 digits).");
    setInputError(phoneInput, true);
    valid = false;
  }

  const discountCode = discountCodeInput.value.trim();
  if (!discountCode || discountCode.length < MIN_DISCOUNT_LENGTH) {
    showError(
      discountCodeError,
      `Discount code must be at least ${MIN_DISCOUNT_LENGTH} characters.`
    );
    setInputError(discountCodeInput, true);
    valid = false;
  }

  return valid;
}

function setBusy(busy: boolean): void {
  isSubmitting = busy;
  if (nextBtn) {
    nextBtn.disabled = busy;
    nextBtn.classList.toggle("busy", busy);
    nextBtn.textContent = busy ? THEME.copy.busy : "Next";
  }
}

function showThemedError(message: string): void {
  const errEl = document.createElement("div");
  errEl.className = "themed-error";
  errEl.textContent = message;
  errEl.style.cssText = `
    background: rgba(255, 68, 68, 0.15);
    border: 2px solid ${THEME.colors.error};
    color: ${THEME.colors.text};
    padding: 1rem;
    border-radius: 8px;
    margin-bottom: 1rem;
    text-align: center;
  `;
  formEl?.insertBefore(errEl, formEl.firstChild);
}

function showThemedConfirmation(): void {
  if (doorMessageEl) {
    doorMessageEl.textContent = "The door is open now";
    doorMessageEl.hidden = false;
  }
  if (formEl) formEl.hidden = true;
  if (confirmationEl) confirmationEl.hidden = false;
  gsapConfirm();
}

function gsapConfirm(): void {
  // GSAP entrance animation for the confirmation panel
  if (confirmationEl) {
    gsap.from(confirmationEl, {
      opacity: 0,
      y: 20,
      duration: 0.5,
      ease: "power2.out",
    });
  }
}

async function onSubmit(event: Event): Promise<void> {
  event.preventDefault();

  if (!validateForm()) {
    showThemedError(THEME.copy.errorValidation);
    return;
  }

  setBusy(true);

  const data: RegistrationData = {
    name: nameInput.value.trim(),
    phone: phoneInput.value.trim(),
    discountCode: discountCodeInput.value.trim(),
    saveStatus: null,
    savedAt: null,
  };

  try {
    const saved = writeRegistrationData(data);
    if (saved) {
      data.saveStatus = "saved";
      data.savedAt = Date.now();
      writeRegistrationData(data);

      // Update progress to confirmation
      const progress = {
        currentStep: "confirmation" as const,
        puzzleSolved: true,
        formSubmitted: true,
      };
      writeProgress(progress);

      showThemedConfirmation();
    } else {
      // FR-009: storage unavailable or full
      data.saveStatus = "failed";
      writeRegistrationData(data);
      showThemedError(THEME.copy.errorSaveFailed);
    }
  } catch {
    showThemedError(THEME.copy.errorSaveFailed);
  } finally {
    setBusy(false);
  }
}

let isInitialized = false;

export function initForm(): void {
  if (!formEl || isInitialized) return;
  isInitialized = true;

  // Restore saved data if returning visitor
  const saved = readRegistrationData();
  if (saved) {
    nameInput.value = saved.name || "";
    phoneInput.value = saved.phone || "";
    discountCodeInput.value = saved.discountCode || "";
  }

  formEl.addEventListener("submit", onSubmit);

  // Clear errors on input
  [nameInput, phoneInput, discountCodeInput].forEach((input) => {
    input.addEventListener("input", () => {
      setInputError(input, false);
      const errorMap: Record<string, HTMLElement | null> = {
        name: nameError,
        phone: phoneError,
        discountCode: discountCodeError,
      };
      if (errorMap[input.id]) errorMap[input.id]!.textContent = "";
    });
  });
}