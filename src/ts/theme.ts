// Halloween theming constants per FR-014 (constitution Principle I)
// Playful-spooky theme: orange, purple, black palette

export const THEME = {
  colors: {
    background: "#1a0a1a",        // deep purple-black
    surface: "#2d1b2d",           // slightly lighter purple
    accent: "#ff6b00",            // Halloween orange
    accentDark: "#e85d00",        // darker orange for hover
    text: "#f4e1d2",              // off-white cream
    textMuted: "#b8a0a0",         // muted text
    error: "#ff4444",             // themed error red
    success: "#00cc66",           // themed success green
    key: "#d4a017",               // key gold
    keyShadow: "#8b6a14",         // key shadow
  },
  copy: {
    heading: "The key is worthy only of intelligent people",
    journeyLine: "Find it to continue the journey",
    doorOpen: "The door is open now",
    confirmation: "Thank you for registering. Your details are saved for the next step.",
    errorSaveFailed: "The spirits could not save your details. Please try again.",
    errorValidation: "Please check the marked fields and try again.",
    shuffleOffer: "The key resists. Shuffle again?",
    shuffleAccept: "Shuffle",
    shuffleDecline: "Keep trying",
    busy: "Conjuring...",
  },
  animation: {
    duration: 0.6,
    ease: "power2.out",
  },
} as const;

export type Theme = typeof THEME;