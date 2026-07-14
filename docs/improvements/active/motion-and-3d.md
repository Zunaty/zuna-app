Status: `active`
Scope: `platform`
Last updated: `2026-07-06`

# Motion & 3D — Framer Motion, tsParticles, Three.js

Ideas and conventions for **Framer Motion**, **tsParticles**, and **Three.js** (via React Three Fiber). Framer Motion is installed and in use; tsParticles and Three.js remain planned.

## Why these libraries

| Library            | Role on this site                                                                                                                                                                                                  |
| ------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| **Framer Motion**  | UI motion — page transitions, list stagger, micro-interactions, game feedback (Prompt Run card reveals, achievement toasts). Complements Tailwind + `tailwindcss-animate` for declarative, orchestrated animation. |
| **tsParticles**    | Lightweight canvas particle effects — hero ambient fields, one-shot celebration bursts, zone-themed backgrounds. Prefer over Three.js when the effect is 2D particles, not 3D geometry.                            |
| **Three.js (R3F)** | Signature moments that need real 3D — optional Prompt Run stage backdrop, holographic card frames, mesh-based scenes. Used sparingly so the portfolio stays fast and accessible.                                   |

**Portfolio angle:** Recruiters see polished interaction design _and_ WebGL literacy in one repo — without turning every page into a GPU demo.

## Principles

1. **Progressive enhancement** — Core content works with zero JS animation. Motion and 3D are additive.
2. **Respect `prefers-reduced-motion`** — Disable or simplify motion; never gate content behind animation.
3. **Lazy by default** — Three.js scenes load via `dynamic(..., { ssr: false })`. Framer Motion uses `LazyMotion` + `domAnimation` where bundle size matters.
4. **One scene per route max** — Avoid stacking multiple WebGL canvases on a single view.
5. **Match existing conventions** — Server Components by default; isolate `"use client"` to motion/3D leaf components.

## Stack additions

```text
framer-motion          — UI animation (installed)
@tsparticles/react     — React wrapper (planned)
@tsparticles/slim      — Core + common presets; tree-shake extra plugins as needed
three                  — WebGL engine (only if a game needs 3D)
@react-three/fiber     — React renderer for Three.js
@react-three/drei      — helpers (OrbitControls, Environment, etc.)
```

Optional later: `@react-three/postprocessing` for glow/bloom on game moments.

## Suggested file layout

```text
components/motion/
  motion-provider.tsx     # LazyMotion wrapper, reduced-motion context
  fade-in.tsx             # Reusable enter variants
  stagger-children.tsx    # List/grid reveal helper
  page-transition.tsx     # Optional layout-level transitions

components/particles/
  particles-shell.tsx     # dynamic import boundary, reduced-motion fallback
  presets/
    hero-ambient.ts       # Home hero — slow drift, muted palette
    achievement-burst.ts  # One-shot confetti / sparkles

components/three/
  canvas-shell.tsx        # dynamic import boundary, resize, fallback
  scenes/
    hero-ambient.tsx      # Home hero background
    prompt-run-stage.tsx  # Prompt Run — optional 3D backdrop (idea)
    achievement-burst.tsx # Unlock celebration (cross-cutting)

lib/motion/
  variants.ts             # Shared easing, duration, stagger presets
  use-reduced-motion.ts   # Hook wrapping matchMedia
```

Keep scene components small. Heavy logic (game state, API) stays in `lib/` — Three.js only renders state.

## Where to use what

### Framer Motion — high value, lower risk

| Area                   | Idea                                                  | Status  | Notes                                             |
| ---------------------- | ----------------------------------------------------- | ------- | ------------------------------------------------- |
| **Home hero**          | Staggered headline + CTA entrance                     | Shipped | Subtle; 300–500ms total                           |
| **Project cards**      | Hover lift + shared layout on case study nav          | Shipped | Enter stagger on featured projects                |
| **Explore grid**       | Stagger on filter change / infinite scroll batch      | Shipped | `AnimatePresence` + `layout` for card reflow      |
| **Pokémon detail**     | Shared element transition from list card → detail art | Ideas   | `layoutId` on artwork; fallback if reduced motion |
| **Collection toggles** | Spring on favorite/caught/card toggle                 | Shipped | Small delight; keep snappy                        |
| **Route transitions**  | Soft fade/slide between major zones                   | Ideas   | Template-level; revisit at launch polish          |
| **Prompt Run**         | Card reveal, rarity flash, shop item pop              | Shipped | Core game feel — motion is essential here         |
| **Achievements**       | Toast slide-in, badge scale pop                       | Shipped | Cross-cutting; optional particle burst still open |
| **Profile stats**      | Count-up or bar fill on first view                    | Ideas   | `useInView` + motion values                       |

### Three.js — signature moments only

| Area                   | Idea                                           | Status  | Notes                                                                                      |
| ---------------------- | ---------------------------------------------- | ------- | ------------------------------------------------------------------------------------------ |
| **Home hero**          | Soft particle field or abstract gradient mesh  | Planned | **tsParticles first** — slow drift, muted colors; pointer-none; keep CSS gradient fallback |
| **Explore hub**        | None required                                  | —       | CSS is enough for zone cards                                                               |
| **Pokémon detail**     | Optional holographic card frame around artwork | Ideas   | Nice-to-have; 2D UI must remain primary                                                    |
| **Prompt Run**         | Optional 3D stage backdrop (cards stay 2D)     | Ideas   | Nice-to-have; 2D card UI is primary                                                        |
| **Achievement unlock** | Short particle burst (1–2s) then unmount       | Planned | **tsParticles** — trigger once; don’t loop                                                 |
| **Playground landing** | Teaser loop or ambient particles               | Ideas   | Marketing for the zone                                                                     |

## Sequencing recommendation

```text
Shipped        → Framer Motion foundation, page enter, grid staggers, toggle springs,
                 Prompt Run game feel, achievement toasts
Next (polish)  → Home hero tsParticles ambient, achievement unlock burst
Launch polish  → Route transitions, prefers-reduced-motion audit, perf pass
Ideas          → Three.js scenes — only if a game clearly benefits from 3D
```

Add motion when the feature UX is stable — never block feature work on motion.

## Next.js integration patterns

### Framer Motion

```tsx
// app/layout.tsx — wrap children once motion is adopted
import { MotionProvider } from "@/components/motion/motion-provider";

// Server layout stays server; MotionProvider is a thin client child
```

```tsx
// LazyMotion reduces bundle vs full motion import
import { LazyMotion, domAnimation, m } from "framer-motion";
```

Use `m.div` instead of `motion.div` inside `LazyMotion`. Reserve full `motion` for components that need layout animations or complex gestures.

### tsParticles

```tsx
// components/particles/particles-shell.tsx
"use client";

import dynamic from "next/dynamic";

const Particles = dynamic(() => import("@tsparticles/react").then((m) => m.Particles), {
  ssr: false,
  loading: () => null,
});
```

- Mount inside an `absolute inset-0` container with `pointer-events-none` and `aria-hidden`.
- Use `@tsparticles/slim` plus only the plugins each preset needs (keeps bundle smaller than full `tsparticles`).
- Respect `prefers-reduced-motion`: render nothing or a static gradient — same rule as Framer Motion.
- One particle layer per route; don’t stack multiple canvases.
- Presets live in `components/particles/presets/` as plain config objects, not inline JSX blobs.

**Candidate surfaces:** home hero background, achievement unlock burst, playground hub teaser.

### Three.js (React Three Fiber)

```tsx
// components/three/canvas-shell.tsx
"use client";

import dynamic from "next/dynamic";

const Canvas = dynamic(() => import("@react-three/fiber").then((m) => m.Canvas), {
  ssr: false,
  loading: () => <div className="absolute inset-0 bg-muted/20" aria-hidden />,
});
```

- Canvas lives inside a sized container (`aspect-ratio` or fixed height).
- `dpr={[1, 1.5]}` cap on mobile.
- `frameloop="demand"` when scene is mostly static; `"always"` only during active game animation.
- Dispose geometries/materials on unmount (R3F handles most of this; avoid leaking custom textures).

### App Router caveat

Layout animations and shared elements work best when the animated node stays mounted across navigations. For Pokémon list → detail, consider:

- **Option A:** `layoutId` across routes (works if both pages render compatible trees).
- **Option B:** Animate only the detail enter (simpler, no cross-route layoutId debugging).

Start with Option B; upgrade to A if the transition feels worth the complexity.

## Performance budget

| Metric                      | Target                                                                               |
| --------------------------- | ------------------------------------------------------------------------------------ |
| LCP routes (home, projects) | No Three.js on first paint unless hero scene is lazy and below fold                  |
| Explore list                | No WebGL; motion stagger only on visible batch                                       |
| Playground / Prompt Run     | WebGL allowed; preload on `/playground` hover or idle                                |
| JS chunk                    | Split Three.js into its own dynamic chunk; never import `three` in Server Components |

Run Lighthouse on `/` and `/explore/pokemon` before and after each motion/3D milestone.

## Accessibility

- All motion respects `prefers-reduced-motion: reduce` (instant state changes or opacity-only).
- WebGL canvases: `aria-hidden="true"` on decorative scenes; game controls remain keyboard-accessible outside the canvas.
- No seizure-inducing flashes (Prompt Run rarity effects — cap frequency and contrast).
- Provide static fallbacks (current CSS gradients, images) when WebGL fails or is disabled.

## Open decisions

Track choices here as we implement:

| Question               | Options                                                 | Lean                                                                                      |
| ---------------------- | ------------------------------------------------------- | ----------------------------------------------------------------------------------------- |
| Page transitions       | Next.js `template.tsx` vs view-specific wrappers        | Start view-specific; global template at launch polish                                     |
| Motion provider scope  | Root layout vs zone layouts (`/playground`, `/explore`) | Root for shared presets; heavy scenes zone-scoped                                         |
| Prompt Run 3D backdrop | Skip vs optional ambient scene                          | **2D cards first** — 3D only if it adds clear value                                       |
| Pokémon detail 3D      | Holographic shader vs stay 2D                           | 2D first; 3D frame as polish if time                                                      |
| Hero particles         | tsParticles vs Three.js gradient mesh                   | **tsParticles** — lighter for 2D ambient; Three.js if we need depth                       |
| Package install timing | Now vs later                                            | **Framer Motion installed**; tsParticles at hero polish; Three.js only if a game needs 3D |

## First implementation checklist

- [x] `yarn add framer-motion`
- [x] Add `MotionProvider` + `useReducedMotion` hook
- [x] Add `lib/motion/variants.ts` with shared tokens (duration, ease)
- [x] Pilot: home hero stagger, featured projects, Pokémon grid + toggle springs
- [x] App-wide page enter (`PageEnter`, `PageHeaderMotion`, card hovers, list staggers)
- [ ] Document bundle impact in PR description
- [ ] `yarn add @tsparticles/react @tsparticles/slim @tsparticles/engine`
- [ ] Add `ParticlesShell` + `hero-ambient` preset (home hero pilot)
- [ ] If a game needs 3D: `yarn add three @react-three/fiber @react-three/drei @types/three`
- [ ] Add `CanvasShell` + first scene (Prompt Run backdrop or hero — pick one)
- [ ] CI still passes lint, typecheck, build

## Related docs

- [product/roadmap.md](../../product/roadmap.md) — priority order
- [architecture/overview.md](../../architecture/overview.md) — stack and routes
