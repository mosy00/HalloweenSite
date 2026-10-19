// App bootstrap — step management (puzzle / form / confirmation)
// Covers US3 tasks T026–T027

import { initPuzzle } from "./puzzle";
import { initForm } from "./form";
import { initAura } from "./aura";
import { readProgress } from "./storage";

const puzzleEl = document.getElementById("puzzle");
const formEl = document.getElementById("form");
const confirmationEl = document.getElementById("confirmation");

function showStep(step: "puzzle" | "form" | "confirmation"): void {
  if (puzzleEl) puzzleEl.hidden = step !== "puzzle";
  if (formEl) formEl.hidden = step !== "form";
  if (confirmationEl) confirmationEl.hidden = step !== "confirmation";
}

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
    if (progress.currentStep === "confirmation") {
      showStep("confirmation");
      return;
    }
  }

  // Default: show puzzle gate
  showStep("puzzle");
  initPuzzle();
}

document.addEventListener("DOMContentLoaded", initApp);