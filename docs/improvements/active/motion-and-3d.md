Status: `active`
Scope: `platform`
Last updated: `2026-06-18`

# Motion & 3D — Framer Motion + Three.js

Ideas and conventions for **Framer Motion** and **Three.js** (via React Three Fiber). Framer Motion is installed and in use; Three.js remains planned for Phase 4+.

## Why these libraries

| Library            | Role on this site                                                                                                                                                                                             |
| ------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Framer Motion**  | UI motion — page transitions, list stagger, micro-interactions, game feedback (Art Roulette spins, achievement toasts). Complements Tailwind + `tailwindcss-animate` for declarative, orchestrated animation. |
| **Three.js (R3F)** | Signature moments — hero backgrounds, 3D game props, collectible reveals. Used sparingly so the portfolio stays fast and accessible.                                                                          |

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
three                  — WebGL engine (planned Phase 4+)
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

components/three/
  canvas-shell.tsx        # dynamic import boundary, resize, fallback
  scenes/
    hero-ambient.tsx      # Home hero background
    roulette-wheel.tsx    # Art Roulette (Phase 4)
    achievement-burst.tsx # Unlock celebration (cross-cutting)

lib/motion/
  variants.ts             # Shared easing, duration, stagger presets
  use-reduced-motion.ts   # Hook wrapping matchMedia
```

Keep scene components small. Heavy logic (game state, API) stays in `lib/` — Three.js only renders state.

## Where to use what

### Framer Motion — high value, lower risk

| Area                   | Idea                                                  | Phase        | Notes                                             |
| ---------------------- | ----------------------------------------------------- | ------------ | ------------------------------------------------- |
| **Home hero**          | Staggered headline + CTA entrance                     | 1 polish / 9 | Subtle; 300–500ms total                           |
| **Project cards**      | Hover lift + shared layout on case study nav          | 1 polish     | Already has CSS hover; motion adds enter stagger  |
| **Explore grid**       | Stagger on filter change / infinite scroll batch      | 3            | `AnimatePresence` + `layout` for card reflow      |
| **Pokémon detail**     | Shared element transition from list card → detail art | 3            | `layoutId` on artwork; fallback if reduced motion |
| **Collection toggles** | Spring on favorite/caught/card toggle                 | 3            | Small delight; keep snappy                        |
| **Route transitions**  | Soft fade/slide between major zones                   | 9            | Template-level; test with App Router layouts      |
| **Art Roulette**       | Spin deceleration, rarity flash, shop item reveal     | 4            | Core game feel — motion is essential here         |
| **Achievements**       | Toast slide-in, badge scale pop                       | 4–5          | Cross-cutting; pair with optional 3D burst        |
| **Profile stats**      | Count-up or bar fill on first view                    | 5            | `useInView` + motion values                       |

### Three.js — signature moments only

| Area                   | Idea                                           | Phase        | Notes                                                                           |
| ---------------------- | ---------------------------------------------- | ------------ | ------------------------------------------------------------------------------- |
| **Home hero**          | Soft particle field or abstract gradient mesh  | 1 polish / 9 | Low poly, muted colors; pointer-none; static fallback gradient (already exists) |
| **Explore hub**        | None required                                  | —            | CSS is enough for zone cards                                                    |
| **Pokémon detail**     | Optional holographic card frame around artwork | 3+           | Nice-to-have; 2D UI must remain primary                                         |
| **Art Roulette**       | 3D wheel / drum / orb for the pull             | 4            | Strong candidate — game centerpiece                                             |
| **Achievement unlock** | Short particle burst (1–2s) then unmount       | 4–5          | Trigger once; don’t loop                                                        |
| **Playground landing** | Teaser loop of roulette wheel                  | 4            | Marketing for the zone                                                          |
| **Star Wars**          | Hyperspace streak transition (detail enter)    | 3            | Fun easter egg; skip if perf budget tight                                       |

## Phasing recommendation

```text
Now (Phase 3)     → Document only (this file). Ship Pokédex UX first.
Phase 3 polish    → Framer Motion: grid stagger, toggle springs, optional layoutId on detail
Phase 4           → Framer Motion: Art Roulette game loop; Three.js: roulette scene
Phase 5           → Achievement celebrations (motion + optional 3D burst)
Phase 9           → Home hero ambient scene, route transitions, perf pass
```

Do **not** block Phase 3 API/collection work on motion. Add motion when the feature UX is stable.

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
| Playground / Roulette       | WebGL allowed; preload on `/playground` hover or idle                                |
| JS chunk                    | Split Three.js into its own dynamic chunk; never import `three` in Server Components |

Run Lighthouse on `/` and `/explore/pokemon` before and after each motion/3D milestone.

## Accessibility

- All motion respects `prefers-reduced-motion: reduce` (instant state changes or opacity-only).
- WebGL canvases: `aria-hidden="true"` on decorative scenes; game controls remain keyboard-accessible outside the canvas.
- No seizure-inducing flashes (Art Roulette rarity effects — cap frequency and contrast).
- Provide static fallbacks (current CSS gradients, images) when WebGL fails or is disabled.

## Open decisions

Track choices here as we implement:

| Question               | Options                                                 | Lean                                                       |
| ---------------------- | ------------------------------------------------------- | ---------------------------------------------------------- |
| Page transitions       | Next.js `template.tsx` vs view-specific wrappers        | Start view-specific; global template at launch polish      |
| Motion provider scope  | Root layout vs zone layouts (`/playground`, `/explore`) | Root for shared presets; heavy scenes zone-scoped          |
| Roulette visual        | 2D CSS wheel vs 3D drum                                 | 3D drum — justifies Three.js adoption                      |
| Pokémon detail 3D      | Holographic shader vs stay 2D                           | 2D first; 3D frame as polish if time                       |
| Package install timing | Phase 3 polish vs later                                 | **Framer Motion installed**; Three.js when a game needs it |

## First implementation checklist

- [x] `yarn add framer-motion`
- [x] Add `MotionProvider` + `useReducedMotion` hook
- [x] Add `lib/motion/variants.ts` with shared tokens (duration, ease)
- [x] Pilot: home hero stagger, featured projects, Pokémon grid + toggle springs
- [ ] Document bundle impact in PR description
- [ ] Phase 4: `yarn add three @react-three/fiber @react-three/drei @types/three`
- [ ] Add `CanvasShell` + first scene (roulette or hero — pick one)
- [ ] CI still passes lint, typecheck, build

## Related docs

- [product/roadmap.md](../../product/roadmap.md) — phase order
- [architecture/overview.md](../../architecture/overview.md) — stack and routes
