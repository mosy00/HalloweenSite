// Registration form — validation, save, then hand off to payment step
// Covers US2 tasks T019–T025

import type { RegistrationData } from "./types";
import { writeRegistrationData, readRegistrationData, writeProgress } from "./storage";
import { THEME } from "./theme";
import { goToStep } from "./step";
import { initPayment } from "./main";

const formEl = document.getElementById("registration-form");
const nextBtn = document.getElementById("next-btn") as HTMLButtonElement;
const nameInput = document.getElementById("name") as HTMLInputElement;
const phoneInput = document.getElementById("phone") as HTMLInputElement;
const secretCodeInput = document.getElementById("secretCode") as HTMLInputElement;
const nameError = document.getElementById("name-error");
const phoneError = document.getElementById("phone-error");
const secretCodeError = document.getElementById("secretCode-error");

// Validation patterns per data-model.md (FR-007, FR-015)
const PHONE_PATTERN = /^[\d\s\+\-\(\)]{7,}$/;

let isSubmitting = false;

function clearErrors(): void {
  [nameError, phoneError, secretCodeError].forEach((el) => {
    if (el) el.textContent = "";
  });
  [nameInput, phoneInput, secretCodeInput].forEach((el) => {
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

  // Secret code is optional — wrong/blank code just means full price.
  const secretCode = secretCodeInput.value.trim();
  if (secretCode && secretCode.length < 3) {
    showError(secretCodeError, "Secret code must be at least 3 characters.");
    setInputError(secretCodeInput, true);
    valid = false;
  }

  return valid;
}

// Show server-side (Gravity Forms) validation messages on the matching
// registration fields. Called from the payment step when a 400 response
// contains errors for the Name (field 1) or Phone (field 3) inputs, so the
// visitor is routed back to the form step that owns those fields.
export function applyServerErrors(errors: { name?: string; phone?: string }): void {
  clearErrors();
  let firstInvalid: HTMLInputElement | null = null;
  if (errors.name) {
    showError(nameError, errors.name);
    setInputError(nameInput, true);
    firstInvalid = nameInput;
  }
  if (errors.phone) {
    showError(phoneError, errors.phone);
    setInputError(phoneInput, true);
    if (!firstInvalid) firstInvalid = phoneInput;
  }
  if (firstInvalid) firstInvalid.focus({ preventScroll: true });
}

function setBusy(busy: boolean): void {
  isSubmitting = busy;
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
    discountCode: secretCodeInput.value.trim(),
    saveStatus: null,
    savedAt: null,
  };

  try {
    const saved = writeRegistrationData(data);
    if (saved) {
      data.saveStatus = "saved";
      data.savedAt = Date.now();
      writeRegistrationData(data);

      // Hand off to the payment step and wire up its buttons
      const progress = {
        currentStep: "payment" as const,
        puzzleSolved: true,
        formSubmitted: true,
      };
      writeProgress(progress);
      goToStep("payment");
      initPayment();
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
    secretCodeInput.value = saved.discountCode || "";
  }

  formEl.addEventListener("submit", onSubmit);

  // Clear errors on input
  [nameInput, phoneInput, secretCodeInput].forEach((input) => {
    input.addEventListener("input", () => {
      setInputError(input, false);
      const errorMap: Record<string, HTMLElement | null> = {
        name: nameError,
        phone: phoneError,
        secretCode: secretCodeError,
      };
      if (errorMap[input.id]) errorMap[input.id]!.textContent = "";
    });
  });
}