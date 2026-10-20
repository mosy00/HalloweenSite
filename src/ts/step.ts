// Step management helpers for the Halloween trial app.
// Provides showStep / goToStep used by main.ts and form.ts.

import { readProgress, writeProgress } from "./storage";
import type { JourneyStep } from "./types";

const puzzleEl = document.getElementById("puzzle");
const formEl = document.getElementById("form");
const paymentEl = document.getElementById("payment");
const confirmationEl = document.getElementById("confirmation");

export function showStep(step: JourneyStep): void {
  if (puzzleEl) puzzleEl.hidden = step !== "puzzle";
  if (formEl) formEl.hidden = step !== "form";
  if (paymentEl) paymentEl.hidden = step !== "payment";
  if (confirmationEl) confirmationEl.hidden = step !== "confirmation";
}

export function goToStep(step: JourneyStep): void {
  const progress = readProgress();
  if (progress) {
    progress.currentStep = step;
    writeProgress(progress);
  } else {
    writeProgress({ currentStep: step, puzzleSolved: false, formSubmitted: false });
  }
  showStep(step);
}
