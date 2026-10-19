# Data Model: Spooky Pumpkin Backdrop

This feature introduces no persisted data. All state is presentational
(CSS/DOM) and derived from the visitor's OS setting. No localStorage
keys, no network calls. The `halloween_001_*` contract is unchanged.

## Entities

### 1. Backdrop Scene (presentational, not stored)

The composed atmospheric layer shared across all views.

| Field | Type | Description | Validation |
|---|---|---|---|
| `baseColor` | string | Dark background color token | Must be dark; no bright/flat-white areas (FR-001) |
| `grainOpacity` | number | Static noise overlay opacity | Low (0.05-0.10); never animated (FR-001) |
| `pumpkinCount` | number | Pumpkin groups in scene | Exactly 1 (FR-002) |
| `eyeState` | `"cycling" \| "steady" \| "static"` | Eye-light mode | `cycling` default; `steady` under reduced motion (FR-008) |
| `peakGlow` | number | Max eye-glow opacity | Faint cap, e.g. <= 0.28; never a beacon (FR-004) |
| `cycleMs` | number | Full breathe cycle length | Slow, multi-second, e.g. ~7000ms (FR-003) |

**State transitions** (CSS-driven, no JS):
- `cycling`: glow ramps faint -> off -> dark rest -> repeats.
- `cycling` -> `steady`: `prefers-reduced-motion` matches.
- `steady` -> `cycling`: preference no longer matches.
- Pumpkin/grain never transition; always present (FR-009).

### 2. Motion Preference (read-only, from platform)

| Field | Type | Description | Validation |
|---|---|---|---|
| `prefersReducedMotion` | boolean | `matchMedia('(prefers-reduced-motion: reduce)').matches` via CSS | Boolean; CSS media query is the consumer |

## Relationships

- One Backdrop Scene per page load, shared by gate/form/confirmation.
- Motion Preference determines Backdrop Scene `eyeState`.
- No relation to PuzzleState / VisitorProgress / RegistrationData.
