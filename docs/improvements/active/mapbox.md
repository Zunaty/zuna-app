Status: `active`
Scope: `portfolio` + `explore`
Last updated: `2026-06-18`

# Mapbox — aviation map & geocoding explore

Two small Mapbox integrations: a **personal flight-history map** on About, and a **geocoding fly-to demo** in Explore. Shared map shell, theme-aware styles, lazy-loaded client components.

## Why Mapbox here

- **About map** — ties Westminster / IFR background to something visual and personal; not a generic “pin on Contact.”
- **Explore demo** — same pattern as Pokédex and Star Wars: external API, polished UI, recruiter-visible code.
- **Incremental** — flight routes are data you add over time; no need to catalog every leg before shipping v1.

## Features

| Feature             | Zone      | Route                    | Status  |
| ------------------- | --------- | ------------------------ | ------- |
| Aviation flight map | Portfolio | `/about` (section embed) | Planned |
| Geocoding fly-to    | Explore   | `/explore/geo`           | Planned |

See [backlog](../../product/backlog.md) for row-level status.

---

## 1. Aviation map (About)

### Concept

Most flying happened out of **Salt Lake City International (KSLC)** — treat it as the hub. Draw **curved flight paths** (great-circle or bezier arcs) from KSLC to training and cross-country destinations, and back. Paths can be **simple** (KSLC ↔ Nephi) or **compound** multi-leg routes (e.g. KSLC → Fillmore → Nephi → KSLC).

Routes are **curated data**, not live ADS-B or logbook import — you add legs slowly as you remember or verify them.

### Placement

- New section on `/about`, after the bio paragraphs and before **Technical focus** (or directly under the Westminster / aviation education bullet).
- Fixed-height card (~280–360px), rounded border, matches existing card styling.
- Optional one-line caption: e.g. “Most of my PIC time radiated out of Salt Lake — IFR training and cross-countries around Utah.”

### Seed routes (v1)

Start with a handful; expand the data file over time.

| ID                    | Label             | Legs (in order)          | Notes                |
| --------------------- | ----------------- | ------------------------ | -------------------- |
| `kslc-nephi`          | KSLC ↔ Nephi      | KSLC → U14 → KSLC        | Simple out-and-back  |
| `kslc-fillmore`       | KSLC ↔ Fillmore   | KSLC → KFOM → KSLC       | Simple out-and-back  |
| `kslc-st-george`      | KSLC ↔ St. George | KSLC → KSGU → KSLC       | Longer cross-country |
| `kslc-fillmore-nephi` | KSLC round-robin  | KSLC → KFOM → U14 → KSLC | Compound example     |

**Waypoints to define in data** (coordinates + display name + optional ICAO):

| ICAO | Name                         |
| ---- | ---------------------------- |
| KSLC | Salt Lake City International |
| U14  | Nephi Municipal              |
| KFOM | Fillmore Municipal           |
| KSGU | St. George Regional          |

Add more Utah airports over time (Provo, Ogden, Moab, etc.) as you recall routes.

### Interaction (v1)

- Map loads centered on Utah with all routes visible at a comfortable zoom.
- **Hover or click** a route line → highlight that route, dim others; popup with route label.
- **Click waypoint** → popup with airport name + ICAO.
- No route editor in the UI — edits happen in `lib/data/flight-routes.ts` (or similar).

### Visual design

- Curved arcs between legs (not straight rhumb lines) — use Turf `greatCircle` or a small bezier helper.
- Distinct stroke per route; KSLC marker slightly emphasized (hub).
- Map style follows site theme: Mapbox `light-v11` / `dark-v11` (or custom minimal style later).
- Subtle line draw-in on enter (Framer Motion or Mapbox `line-gradient` animation) — **disabled** when `prefers-reduced-motion`.

### Data model (draft)

```ts
type FlightWaypoint = {
  id: string; // e.g. "kslc"
  icao: string;
  name: string;
  lng: number;
  lat: number;
};

type FlightRoute = {
  id: string;
  label: string; // "KSLC → Fillmore → Nephi → KSLC"
  legs: string[]; // ordered waypoint ids — compound routes supported
  notes?: string; // optional logbook-style note
};
```

Renderer expands `legs` into consecutive curved segments (A→B, B→C, …). Closing back to KSLC is explicit in the array, not implicit.

### File layout (when built)

```text
lib/data/flight-routes.ts          # waypoints + routes — grow over time
lib/mapbox/
  styles.ts                        # theme → Mapbox style URL
  curved-line.ts                   # waypoint pairs → GeoJSON LineString
components/maps/
  mapbox-provider.tsx              # token gate, dynamic import wrapper
  aviation-flight-map.tsx          # client — routes, popups, theme sync
app/about/page.tsx                 # embed AviationFlightMap section
```

---

## 2. Geocoding fly-to (Explore)

### Concept

Search for a place → server calls **Mapbox Geocoding API** → map flies (or jumps) camera to the result. Same “API playground” framing as Pokédex and Star Wars.

### Route

```text
/explore/geo
```

Linked from `/explore` hub as a third zone card.

### Core loop

1. User types in search input (debounced ~300ms).
2. Client calls `GET /api/explore/geocode?q=...` (or server action).
3. Server requests Mapbox Geocoding with **server-side token**; returns `{ lng, lat, placeName, bbox? }`.
4. Map animates to result; marker + label at destination.
5. Empty / error / no results — inline message, no throw to UI boundary.

### UX details

- Debounced search; clear button; recent searches in `sessionStorage` (optional v2).
- **Reduced motion** — `jumpTo` instead of `flyTo`.
- Loading spinner on input trailing edge.
- Example placeholder: “Try: Salt Lake City, Nephi UT, St. George”.

### File layout (when built)

```text
app/explore/geo/page.tsx
app/api/explore/geocode/route.ts   # or app/explore/geo/actions.ts
components/explore/geo-search-map.tsx
components/maps/mapbox-provider.tsx  # shared with aviation map
```

---

## Shared infrastructure

### Dependencies (when built)

- `mapbox-gl` + `react-map-gl` (or `mapbox-gl` only if keeping bundle smaller)
- `@turf/great-circle` or `@turf/helpers` — curved aviation legs
- Types: `@types/mapbox-gl` if needed

### Environment

```text
MAPBOX_ACCESS_TOKEN=pk....          # server — geocoding route
NEXT_PUBLIC_MAPBOX_TOKEN=pk....     # client — map render (public token, URL-restricted)
```

Mapbox allows separate tokens per use; restrict by URL on the public token.

### Performance & a11y

- Dynamic `import()` with `ssr: false` for all map components.
- Single shared `MapboxProvider` that no-ops with a friendly fallback when token missing (local dev / CI build without secrets).
- Respect `prefers-reduced-motion` for fly animations and route draw-in.
- Map container needs accessible name (`aria-label`); search input labeled.

### Build order

1. **Shared map shell** + env wiring + theme styles.
2. **Aviation map** on About (static data only).
3. **Explore geocoding** (API route + search UI).
4. **Explore hub card** + architecture/backlog ✅ when both ship.

---

## Adding routes over time

Workflow for the aviation map after v1 ships:

1. Open `lib/data/flight-routes.ts`.
2. Add waypoint if missing (`icao`, `name`, `lng`, `lat`).
3. Append a `FlightRoute` with ordered `legs` array.
4. No component changes unless you want new interaction (e.g. filter by airport).

Compound routes are just longer `legs` arrays — the renderer connects each consecutive pair with a curved segment.

---

## References

- [product/backlog.md](../../product/backlog.md) — feature rows
- [architecture/overview.md](../../architecture/overview.md) — routes and stack
- Mapbox GL JS docs — styles, GeoJSON sources, `flyTo` / `jumpTo`
- Mapbox Geocoding API — forward geocoding, `limit=1`
