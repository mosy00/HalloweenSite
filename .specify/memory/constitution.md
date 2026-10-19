<!--
Sync Impact Report
==================
- Version change: (unversioned scaffold) → 1.0.0
  Rationale: initial ratification of a previously unfilled constitution scaffold.
- Modified principles: none (scaffold had placeholders only)
  - [PRINCIPLE_1_NAME] → I. Halloween Theme Fidelity (NON-NEGOTIABLE)
  - [PRINCIPLE_2_NAME] → II. Mobile-First Responsiveness (NON-NEGOTIABLE)
  - [PRINCIPLE_3_NAME] → III. Registration Integrity
  - [PRINCIPLE_4_NAME] → IV. Accessible & Performant Experience
- Added sections:
  - Additional Constraints (from template [SECTION_2_NAME] slot)
  - Development Workflow (from template [SECTION_3_NAME] slot)
  - Governance (filled from template [GOVERNANCE_RULES] slot)
- Removed sections: none
- Template slots intentionally unused: the template's fifth principle slot
  ([PRINCIPLE_5_NAME]) was left unused; the project adopted four principles
  grounded in stated requirements. No unexplained bracket tokens remain.
- Follow-up TODOs: none
- NOTE: This report is temporary scratch material for review and MUST be
  removed before the amended constitution is committed.
-->

# HalloweenSite Constitution

## Core Principles

### I. Halloween Theme Fidelity (NON-NEGOTIABLE)

All user-facing elements — visuals, copy, imagery, color palette,
iconography, typography, sounds, and micro-interactions — MUST reflect the
Halloween ceremony theme (playful-spooky atmosphere: e.g., pumpkins, ghosts,
witches, night skies, orange/purple/black palettes).

- No screen, component, empty state, error message, email, or metadata
  (page titles, favicons) may present a generic or off-theme design.
- Themed elements MUST remain consistent with each other; mixing unrelated
  visual themes (e.g., corporate-minimal alongside haunt styling) is
  prohibited unless explicitly approved as an amendment.
- Rationale: the site's identity is the Halloween event itself; off-theme
  elements break the experience the project exists to deliver.

### II. Mobile-First Responsiveness (NON-NEGOTIABLE)

Every feature, layout, and interaction MUST work on mobile devices — either
fully responsive or shipping a deliberate mobile alternative.

- Design starts at the narrow viewport and scales up; desktop-only layouts
  are not acceptable as the primary implementation.
- Touch targets MUST be comfortably tappable (adequate size and spacing);
  hover-only interactions MUST have touch equivalents.
- Critical flows — especially event registration — MUST be completable end
  to end on a phone-sized screen without horizontal scrolling, clipped
  content, or unusable controls.
- Rationale: mobile visitors are a primary audience for event registration;
  a broken mobile experience directly loses registrations.

### III. Registration Integrity

The site exists to register attendees for the Halloween event, so the
registration flow is the highest-priority functionality.

- Registration forms MUST validate input clearly, present errors close to
  the field, and never silently lose submitted data.
- Success, failure, and loading states MUST be explicit, themed, and
  understandable without relying on color alone.
- Collected personal data MUST be handled with care: only fields needed for
  the event are collected, and submission endpoints MUST use appropriate
  transport security and basic abuse protections (e.g., rate limiting or
  bot mitigation) as the scale of the project requires.
- Rationale: a visually impressive site that fails at registration fails
  its sole purpose.

### IV. Accessible & Performant Experience

Theming and responsiveness MUST NOT come at the cost of accessibility or
performance.

- Text over themed backgrounds MUST meet contrast requirements; decorative
  effects MUST NOT obscure content or block interaction.
- Animations and ambient effects (flicker, floating ghosts, parallax, sound)
  MUST respect `prefers-reduced-motion` and user mute expectations, and
  MUST NOT delay access to registration content.
- The site MUST remain usable with keyboard navigation and assistive
  technology; interactive elements MUST have accessible names.
- Themed assets (images, fonts, animations) MUST be optimized so pages load
  acceptably on typical mobile connections.
- Rationale: spooky atmosphere is the wrapper, not the product;
  inaccessible or sluggish pages exclude users and reduce signups.

## Additional Constraints

- Copy and microcopy (buttons, confirmations, errors) SHOULD reinforce the
  Halloween voice while remaining unambiguous about actions and outcomes.
- External dependencies MUST be justified; prefer a small, maintainable
  stack over heavyweight tooling for a single-event site.

## Development Workflow

- Every UI change MUST be reviewed against three gates before merge:
  theme fidelity, mobile responsiveness, and accessibility.
- Responsive verification MUST include a narrow-viewport check
  (≤ 480 px width, real device or browser emulation) of every changed
  screen — not only desktop review.
- Registration-flow changes MUST be tested through success, validation-
  error, and submission-failure paths on both mobile and desktop.
- New themed effects MUST be checked against `prefers-reduced-motion` and
  load-performance impact before adoption.
- Specs and plans MUST reference this constitution; identified violations
  MUST be either fixed or explicitly justified and approved as exceptions.

## Governance

- This constitution is the supreme authority for all specs, plans, tasks,
  and implementation work on this project; conflicting practices are void.
- Amendments MUST be made via a documented change to this file that states
  the rationale, lists affected principles/sections, and includes a
  migration plan for in-flight work where applicable.
- Versioning follows semantic versioning:
  - MAJOR: removing or redefining a principle/section incompatibly.
  - MINOR: adding a principle/section or materially expanding guidance.
  - PATCH: clarifications, wording, and non-semantic refinements.
- All specification and plan reviews MUST include a compliance check
  against this constitution; unchecked violations block approval.
- Intentional exceptions MUST be recorded in the relevant spec/plan with
  justification and explicit approver sign-off.

**Version**: 1.0.0 | **Ratified**: 2026-10-18 | **Last Amended**: 2026-10-18

