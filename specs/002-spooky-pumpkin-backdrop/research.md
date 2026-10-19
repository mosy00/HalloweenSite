# Research: Spooky Pumpkin Backdrop

## Unknowns Resolved

### 1. Backdrop + pumpkin rendering without hurting load / battery

**Decision**: Pure CSS + inline SVG artwork. Dark base on `body`,
a fixed full-viewport grain overlay from a tiny SVG `feTurbulence`
data-URI (static, low opacity), and one inline SVG pumpkin scene
fixed behind content.

**Rationale**: FR-001 needs completely static grain and FR-010 needs
no heavy load/battery cost on mobile. Static CSS noise is <2KB,
GPU-cheap (zero per-frame work), resolution-independent, no JS, no
canvas loop, no extra fetch. Inline SVG scales to 320px phones and
ultrawide desktops; its eye-glow animates via one cheap CSS opacity
keyframe.

**Alternatives considered**:
- **Canvas 2D animated grain + painted pumpkin**: rejected — needs a
  rAF loop for shimmer (forbidden: grain must be fully static),
  costs battery, adds JS for zero gain.
- **three.js backdrop scene**: rejected — heavyweight overkill for a
  static scene; hurts load on low-end phones (FR-010 / SC-006).
- **Animated CSS grain (shifting position)**: rejected — the
  clarification mandates completely static grain (FR-001).

### 2. Breathing eye-light loop (brighten -> off -> dark rest -> repeat)

**Decision**: CSS `@keyframes` opacity on SVG eye-glow shapes
(ellipses + soft halo), one slow ~7s cycle: ramp to a faint peak,
fade fully off, rest dark, repeat infinitely. Peak opacity capped
low (e.g. <=0.28, dim amber) so it never acts as a beacon (FR-004,
SC-003). No JS timers.

**Rationale**: Opacity-only animation is compositor-friendly, runs
undisturbed during the puzzle success sequence (clarified edge case),
costs negligible battery, degrades cleanly under reduced motion.

**Alternatives considered**:
- **GSAP / JS interval toggling opacity**: rejected — extra wakeups,
  competes with the GSAP success sequence; CSS stays independent.
- **SMIL `<animate>`**: rejected — weaker control of the dark-rest
  segment, harder reduced-motion override; CSS centralizes timing.
- **Brighten once per load**: rejected — clarification chose a
  repeating loop with rest.

### 3. Reduced-motion fallback

**Decision**: `@media (prefers-reduced-motion: reduce)` sets
`animation: none` on eye-glow and pins a steady faint glow (same dim
amber, low static opacity). Pumpkin stays visible; zero pulsing
(FR-008, SC-005). Grain/layout already static.

**Rationale**: Matches the spec assumption and constitution section IV.
Pure-CSS query applies before first paint; no JS detection needed.

**Alternatives considered**:
- **Removing the pumpkin**: rejected — backdrop must stay intact.
- **JS `matchMedia` class swap**: rejected — unnecessary complexity.

### 4. Hard to see yet discoverable, exactly one pumpkin

**Decision**: Exactly one pumpkin group in the SVG, painted in
near-background tones at low opacity, placed off-center in a
negative-space zone so content never overlaps it. No second pumpkin.

**Rationale**: Low contrast + peripheral placement meets SC-001
(80% miss at 3s, 80% find within 30s) without gating discovery
behind interaction. Single instance is directly countable (FR-002).

**Alternatives considered**:
- **Several pumpkins**: rejected — clarification chose one lone one.
- **Hover-to-reveal hiding**: rejected — discovery must not depend
  on interaction.
- **High-contrast hero pumpkin**: rejected — fails SC-001 / SC-003.

### 5. Generous free space that still fits 320px

**Decision**: Narrow centered foreground column (max-width ~520px),
wide vertical rhythm (gaps >= 2.5rem, page padding >= 1.5rem mobile /
3rem desktop); backdrop visible on all sides of every view (SC-004).

**Rationale**: Standard airy-layout pattern; layers onto the existing
001 gate/form/confirmation views without restructuring them.

## Dependency Best Practices

| Technology | Role | Best Practice Applied |
|---|---|---|
| CSS custom properties | Palette/timing tokens | `--backdrop-*` tokens in `:root`; peak opacity + duration tunable |
| Inline SVG feTurbulence URI | Static grain | Tiled noise, low opacity, `pointer-events: none`, fixed inset 0 |
| CSS keyframes opacity | Eye-light | Opacity only; reduced-motion override to static |
| Fixed backdrop layers | Scene stability | Never scrolls, never intercepts clicks, `aria-hidden="true"` |

## Integration Patterns

- Backdrop = two fixed siblings before `.gate-container`; 001 step
  logic in `main.ts` untouched; eye-light independent of GSAP flow.
- No new storage keys, no network calls; `halloween_001_*` unchanged.

