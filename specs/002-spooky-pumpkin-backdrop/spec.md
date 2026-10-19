# Feature Specification: Spooky Pumpkin Backdrop

**Feature Branch**: `002-spooky-pumpkin-backdrop`

**Created**: 2026-10-18

**Status**: Draft

**Input**: User description: "The background of the website should be dark with
some grainy texture and a mysterious spooky pumpkin in the background which is
hard to see at first glance. There is a faint light in its eyes which gets a
little lighter and then off. There should be a generous amount of free space in
the design of the site."

## Clarifications

### Session 2026-10-18

- Q: Should the pumpkin's eye-light repeat as a breathing loop throughout the
  visit, or brighten only once per page load? → A: Repeating loop with a rest:
  brightens slightly, fades fully off, rests dark briefly, then repeats
  (slow, multi-second cycle).
- Q: Should the hidden pumpkin appear as a single lone pumpkin in the scene,
  or should there be several pumpkins scattered across the backdrop? → A: One
  lone pumpkin in the scene (matches the original singular description).
- Q: At the eye-light's brightest moment, must the pumpkin still be hard to
  spot — or is it fine if the glow's movement draws the visitor's eye and
  reveals the pumpkin? → A: Peak must stay faint — the glow must not act as a
  beacon; discovery stays deliberate, and SC-001's "hard to see" test stands
  unchanged.
- Q: While the puzzle-solve success animation plays (tiles assembling into the
  key, rotation, "The door is open now", fade), should the backdrop's
  eye-light keep running normally, hold its current state, or fade out until
  the form appears? → A: Keep running its normal breathing cycle, undisturbed.
- Q: Should the grainy texture be completely still, or is a subtle animated
  shimmer (like living film grain) allowed? → A: Completely static grain —
  the texture never moves or shimmers.

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Dark grainy backdrop with a hidden pumpkin (Priority: P1)

A visitor opens the site and sees a deep dark background with a fine grainy
texture, like old film or dust in moonlight. Lurking within that darkness is
a single lonely spooky pumpkin, painted so faintly into the scene that it is
hard to see at first glance — it only reveals itself to a careful, lingering
look. The
atmosphere feels mysterious and Halloween-like from the very first frame, and
foreground content (headings, puzzle, form) stays perfectly readable on top of
it.

**Why this priority**: The backdrop is the site's atmospheric foundation and
the defining first impression; without it the experience is generic. It works
standalone as a complete visual layer behind any foreground content.

**Independent Test**: Open any page of the site in a fresh browser; verify the
background is dark with a grainy texture, that a pumpkin is discoverable in
the background but not obvious at a quick glance, and that all foreground text
and controls remain clearly legible.

**Acceptance Scenarios**:

1. **Given** a first-time visitor, **When** any page of the site loads,
   **Then** the background is a dark color carrying a fine, still grainy
   texture (no shimmer or movement), and no bright or flat-white background
   areas are shown.
2. **Given** the loaded page, **When** the visitor glances at it briefly
   (a second or two), **Then** the pumpkin is not immediately obvious; **When**
   the visitor looks carefully at the background, **Then** a spooky pumpkin
   becomes visible within the scene.
3. **Given** the backdrop with the hidden pumpkin, **When** the visitor reads
   or uses the foreground content, **Then** every text element and control
   meets legibility and contrast expectations against the dark background.
4. **Given** the same site opened on a phone-sized screen, **When** the page
   loads, **Then** the dark grainy backdrop and hidden pumpkin are still
   present (scaled or repositioned to fit) with no horizontal scrolling.

---

### User Story 2 - Faint breathing light in the pumpkin's eyes (Priority: P2)

The hidden pumpkin's eyes hold a faint light. Over a slow repeating cycle the
eye-light grows a little lighter (brighter), fades out entirely, rests dark
briefly, then returns — like something breathing in the dark. The effect stays
subtle so it rewards
attention without distracting from the foreground content or breaking the
"hard to see at first glance" character of the pumpkin.

**Why this priority**: The living eye-light is the signature detail that makes
the backdrop feel supernatural rather than static, but the site's atmosphere
still stands without it (Story 1 alone delivers the full static scene).

**Independent Test**: Load a page and watch the pumpkin's eyes for at least
two full light/dark cycles; verify the light gradually brightens then fades
off and repeats, and that the foreground remains unaffected. Re-test with the
system reduced-motion preference enabled and verify no animated pulsing occurs.

**Acceptance Scenarios**:

1. **Given** a page with the hidden pumpkin visible, **When** the visitor
   watches the eyes over time, **Then** the faint eye-light gradually becomes
   a little lighter (brighter), fades completely off, rests dark briefly, and
   then the slow cycle repeats.
2. **Given** the eye-light cycle running, **When** the visitor interacts with
   foreground content, **Then** the pulsing light never draws attention away
   from or impairs reading of the foreground.
3. **Given** a visitor who enabled reduced-motion preferences, **When** the
   page loads, **Then** the eye-light does not animate (a steady faint
   glow or fully static eyes is shown instead).
4. **Given** a visitor on a phone-sized screen, **When** the eye-light cycle
   runs, **Then** it behaves identically in character (subtle, slow) and
   causes no interaction lag or excessive battery-draining animation.

---

### User Story 3 - Generous free space in the layout (Priority: P3)

Every view of the site breathes: content blocks are separated by wide
margins, the page is never crowded edge-to-edge, and large areas of the dark
grainy backdrop remain visible between and around elements. The emptiness
amplifies the mystery — the visitor feels alone with the pumpkin in the dark.

**Why this priority**: The breathing room is a design-quality requirement that
elevates the atmosphere and readability, but the core experience is already
deliverable with Stories 1-2 plus a plain layout.

**Independent Test**: View the gate, form, and confirmation views on desktop
and phone widths; verify wide empty margins around content blocks, no
edge-to-edge crowding, and visible backdrop area around the main content on
every screen.

**Acceptance Scenarios**:

1. **Given** any view of the site, **When** it is displayed, **Then** the
   main content does not stretch edge-to-edge and substantial dark backdrop
   remains visible around and between content blocks.
2. **Given** the gate view (heading, line, puzzle) or the form view, **When**
   it is displayed on a narrow phone screen, **Then** the layout still keeps
   clear vertical breathing room between elements rather than compressing
   them tightly together.
3. **Given** a visitor viewing any step of the journey, **When** they look at
   the page, **Then** no more than one primary content block dominates the
   immediate view at a time (e.g., heading and puzzle are visually grouped;
   the form is its own calm centered block).

---

### Edge Cases

- What happens when a visitor cannot perceive the pumpkin at all (low-contrast
  display, visual impairment)? → The backdrop remains a valid dark grainy
  background; the pumpkin is atmosphere, never required information.
- What happens under very bright ambient light or on a dim/low-quality
  screen? → The pumpkin may become effectively invisible; this is acceptable
  because it must be hard to see at first glance by design.
- What happens if the eye-light animation would overlap in time with the
  puzzle-solve key animation? → The backdrop eye-light keeps running its
  normal breathing cycle, undisturbed; it MUST never visually conflict with
  or outshine the foreground success sequence (guaranteed by its mandated
  beacon-faint brightness).
- How does the system handle a device where animations are disabled or
  throttled (reduced motion, battery saver)? → The eye-light renders as a
  steady faint glow or static eyes; the backdrop remains fully intact.
- What happens on very tall or very wide viewports (ultrawide monitors,
  landscape phones)? → The pumpkin stays positioned within the visible
  backdrop area without being cropped into obviousness or pushed off-screen
  entirely.
- What happens when the foreground shows an error or busy state? → The
  backdrop dims or stays as-is but MUST NOT compete with or obscure the
  error/busy messaging.
- How does the system avoid the grain texture reducing text legibility? →
  Grain intensity stays low enough that all text passes contrast checks over
  it.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: Every view of the site MUST render a dark background carrying a
  fine, completely static grainy texture (the grain never moves, shifts, or
  shimmers); no flat white or bright background areas are permitted.
- **FR-002**: Exactly one lone spooky pumpkin MUST be composed into the
  background — no additional pumpkins anywhere in the scene — so that it is
  hard to see at a first glance yet discoverable on careful inspection
  (e.g., via low contrast against the dark scene), consistent with the
  project's Halloween theme.
- **FR-003**: The pumpkin's eyes MUST carry a faint light in a repeating
  breathing loop: the light grows a little lighter (brighter), then fades
  completely off, rests dark briefly, then repeats — one slow, multi-second
  cycle.
- **FR-004**: The eye-light cycle MUST be subtle enough that it never distracts
  from, obscures, or reduces the legibility of foreground content; even at its
  brightest point the glow MUST stay faint enough that it does not act as a
  beacon revealing the pumpkin's location — discovery of the pumpkin stays a
  deliberate act of looking.
- **FR-005**: The backdrop (texture, pumpkin, eye-light) MUST NOT reduce text
  or control contrast below legibility requirements anywhere on the site.
- **FR-006**: Every view MUST provide generous free space: wide margins
  around and between content blocks, no edge-to-edge crowding, and visible
  backdrop area around the primary content on both desktop and phone widths.
- **FR-007**: The backdrop MUST adapt to phone-sized screens (scaled or
  repositioned pumpkin and texture) with no horizontal scrolling and no
  interaction lag.
- **FR-008**: The eye-light animation MUST honor reduced-motion preferences
  by rendering a steady faint glow (or static eyes) instead of the pulsing
  cycle.
- **FR-009**: The backdrop MUST remain purely atmospheric: it MUST NOT
  require interaction, convey required information, or block interaction with
  foreground content.
- **FR-010**: The grain texture and pumpkin MUST be produced without
  unacceptable load-time or battery cost; pages MUST still meet the
  project's performance expectations for mobile connections.

### Key Entities *(include if feature involves data)*

- **Backdrop Scene**: The composed atmospheric layer — dark base color,
  grain texture, hidden pumpkin, and eye-light state (cycling, steady, or
  static) — shared across all views of the site.
- **Motion Preference**: The visitor's stated preference (from their device
  or browser settings) that determines whether the eye-light animates or
  renders statically.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: In spot-check testing, at least 80% of first-time viewers do
  NOT notice the pumpkin within the first 3 seconds of page load, while at
  least 80% DO discover it within 30 seconds of deliberate looking —
  confirming "hard to see at first glance" yet discoverable.
- **SC-002**: 100% of text and interactive elements across all views pass
  contrast/legibility checks against the dark grainy background.
- **SC-003**: The eye-light repeats its brighten → fade-off → brief-dark-rest
  cycle at a slow, steady rhythm (a full cycle on the order of several
  seconds), perceived as subtle rather than attention-grabbing in informal
  review — including at the cycle's brightest moment, where the glow must not
  act as a beacon that reveals the pumpkin.
- **SC-004**: On every view at both desktop and 320 px phone widths, at least
  roughly a third of the visible page area is empty backdrop (free-space
  measure), and no view shows content stretched edge-to-edge.
- **SC-005**: With reduced-motion enabled, zero animated eye-light pulsing is
  observed anywhere on the site while the faint glow remains visible.
- **SC-006**: The backdrop adds no noticeable delay to content becoming
  readable and interactive on a typical mobile connection.

## Assumptions

- The backdrop applies site-wide (gate, form, confirmation, and any future
  views), not to a single page only.
- The pumpkin is part of the background art itself (one scene behind the
  content), not a foreground element that moves with scrolling or layout.
- "Hard to see at first glance" is achieved through low contrast/subtle
  placement against the dark scene rather than by hiding it behind an
  interaction; it must never be the only way to obtain needed information.
- The eye-light follows a repeating breathing loop with a brief rest in
  darkness between cycles; exact duration and brightness are design-time
  choices within the "faint" and "a little lighter" guidance, with the peak
  brightness capped below the level that would reveal the pumpkin's location
  at a glance.
- Reduced-motion fallback is a steady faint glow (or static eyes) rather
  than removing the pumpkin entirely.
- Grain texture stays subtle enough to never impair text legibility; the
  texture is decorative, not information-bearing, and is completely static
  (it never animates or shimmers).
- This feature layers on top of the existing "Key Puzzle Registration Gate"
  feature (specs/001-key-puzzle-registration) and its views; it introduces
  no new user data collection and does not change the registration flow.
- The dark base color and pumpkin artwork will be chosen within the
  Halloween palette already governed by the project constitution.
