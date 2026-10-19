# Research: Key Puzzle Registration Gate

## Unknowns Resolved

### 1. Testing framework

**Decision**: Vitest for unit testing (puzzle logic, validation rules, storage wrapper), with manual browser-based validation scenarios in `quickstart.md` covering the end-to-end flow.

**Rationale**: Vitest is lightweight, Vite-native, TypeScript-friendly, and uses a Jest-compatible API. It runs in Node (fast, no browser required for unit tests) and fits a small static site with <10 TS modules without the heaviness of Jest or the complexity of E2E tools. Unit tests cover pure logic (board solvability, move validation, form field rules, storage read/write); end-to-end interactions (tile dragging, animations, form submission, return-visit resume) are validated manually per `quickstart.md`.

**Alternatives considered**:
- **Jest**: Heavier, requires more configuration for ESM/TypeScript; overkill for this scope.
- **Playwright/Cypress**: Valuable for E2E browser automation but out of scope for Phase 1; can be added when the WordPress integration step consumes browser-saved data.
- **No test framework**: Would leave puzzle solvability and validation logic untested automatically; manual-only validation is more error-prone.

### 2. Build tooling / TypeScript compilation

**Decision**: Vite as the dev server and build tool, compiling TypeScript (ES2020) and bundling ES modules. No webpack/esbuild needed.

**Rationale**: Vite gives a fast dev server, hot module replacement, and production bundling with minimal configuration. It works natively with TypeScript and ES modules (three.js, GSAP). This is simpler than maintaining a raw `tsc` + manual bundling setup, and it aligns with Vitest (same Vite ecosystem, shared config).

**Alternatives considered**:
- **tsc directly**: Simpler conceptually but requires a separate bundling step for production and a manual dev server; less ergonomic than Vite.
- **No compilation (plain JS)**: Would abandon the user's explicit TypeScript requirement.

### 3. three.js vs. lighter rendering for the puzzle

**Decision**: Use three.js for the 3D tile scene as the user suggested, with GSAP for animations.

**Rationale**: The user specifically mentioned three.js and GSAP as "nice choices" for smooth drag-and-slide. Both are well-suited: three.js handles the 3D tile mesh and scene, GSAP handles the slide/rotate/fade transitions with precise easing. Both can be loaded as ES modules without a bundler.

**Alternatives considered**:
- **Pure CSS + DOM tiles**: Simpler, no 3D dependency, but less impressive for a "key silhouette" reveal and harder to do smooth 3D assembly/rotation.
- **HTML5 Canvas 2D**: Lighter than three.js but loses the 3D depth that makes the key reveal compelling.

### 4. Browser storage mechanism

**Decision**: `localStorage` with JSON serialization, keyed by a feature-specific prefix (e.g., `halloween_001_`).

**Rationale**: The user wants form data saved "in the best way you can" in the browser, to be consumed by a later step that sends it to an API. `localStorage` is synchronous, simple, universally supported, and persists across sessions — exactly what is needed for name, phone, discount code, puzzle state, and visitor progress. IndexedDB is overkill for <1KB of data; cookies are inappropriate (sent with every request, size-limited).

**Alternatives considered**:
- **IndexedDB**: Asynchronous, larger capacity, but more complex API; unnecessary for a few small fields.
- **sessionStorage**: Does not persist across browser restarts; the spec requires return visits to resume at the current step.
- **Cookies**: Sent to server on every request (violates "MUST NOT transmit"), size-limited (~4KB).

## Dependency Best Practices

| Technology | Role | Best Practice Applied |
|---|---|---|
| three.js | 3D puzzle scene & tile rendering | Load as ES module via Vite; respect `prefers-reduced-motion` by disabling animations; dispose geometries/materials on teardown |
| GSAP | Slide/rotate/fade animations | Use `gsap.to()` with `ease: "power2.out"`; respect `prefers-reduced-motion` by setting `duration: 0`; use `gsap.registerPlugin()` only if needed |
| TypeScript | Type safety | Compiled by Vite to ES2020; strict mode enabled; `vitest` type-checks test files |
| Vite | Dev server & build | Dev server with HMR; production build to `dist/`; ES module bundling for three.js/GSAP |
| Vitest | Unit testing | Vite-native; Jest-compatible API; tests puzzle logic, validation, storage wrapper in Node |
| localStorage | Browser persistence | Wrapper with try/catch for quota errors; JSON serialize/deserialize; feature-scoped keys to avoid collisions |

## Integration Patterns

- **Next step consumption**: The browser-saved registration data (`name`, `phone`, `discountCode`) is keyed so a later feature can read it via `localStorage` and POST it to the WordPress/Gravity Forms API. No server code exists in this feature.
- **Puzzle-to-form transition**: A single `index.html` manages three steps (gate/puzzle, form, confirmation) by toggling CSS classes, avoiding multi-page navigation complexity.