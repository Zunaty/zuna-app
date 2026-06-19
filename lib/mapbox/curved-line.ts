import type { Feature, FeatureCollection, LineString } from "geojson";

import { getFlightWaypoint, type FlightRoute } from "@/lib/data/flight-routes";

export const ROUTE_COLORS = ["#2563eb", "#059669", "#d97706", "#7c3aed"] as const;

type RouteLineProperties = {
  routeId: string;
  label: string;
  color: string;
  segmentIndex: number;
};

export type RouteLineFeature = Feature<LineString, RouteLineProperties>;

type ArcOptions = {
  points?: number;
  /** Fraction of chord length used to offset the control point — higher = more visible bow. */
  curvature?: number;
};

/**
 * Quadratic bezier arc between two lng/lat points. Great-circle arcs are nearly
 * straight at regional scale on Mercator; this produces the visible flight-path
 * bow common on aviation maps.
 */
export function sampleQuadraticArc(
  from: [number, number],
  to: [number, number],
  options?: ArcOptions,
): [number, number][] {
  const pointCount = options?.points ?? 64;
  const curvature = options?.curvature ?? 0.22;

  const [x1, y1] = from;
  const [x2, y2] = to;

  const midX = (x1 + x2) / 2;
  const midY = (y1 + y2) / 2;

  const deltaX = x2 - x1;
  const deltaY = y2 - y1;
  const chord = Math.hypot(deltaX, deltaY) || 1;

  const perpX = -deltaY / chord;
  const perpY = deltaX / chord;
  const offset = chord * curvature;

  const controlX = midX + perpX * offset;
  const controlY = midY + perpY * offset;

  const coordinates: [number, number][] = [];

  for (let index = 0; index <= pointCount; index += 1) {
    const t = index / pointCount;
    const inverse = 1 - t;

    coordinates.push([
      inverse * inverse * x1 + 2 * inverse * t * controlX + t * t * x2,
      inverse * inverse * y1 + 2 * inverse * t * controlY + t * t * y2,
    ]);
  }

  return coordinates;
}

export function buildRouteSegment(
  route: FlightRoute,
  fromId: string,
  toId: string,
  segmentIndex: number,
  color: string,
): RouteLineFeature | null {
  const from = getFlightWaypoint(fromId);
  const to = getFlightWaypoint(toId);

  if (!from || !to) {
    return null;
  }

  const coordinates = sampleQuadraticArc([from.lng, from.lat], [to.lng, to.lat]);

  return {
    type: "Feature",
    properties: {
      routeId: route.id,
      label: route.label,
      color,
      segmentIndex,
    },
    geometry: {
      type: "LineString",
      coordinates,
    },
  };
}

export function buildRouteLineFeatures(route: FlightRoute, color: string): RouteLineFeature[] {
  const features: RouteLineFeature[] = [];

  for (let index = 0; index < route.legs.length - 1; index += 1) {
    const segment = buildRouteSegment(route, route.legs[index], route.legs[index + 1], index, color);

    if (segment) {
      features.push(segment);
    }
  }

  return features;
}

export function buildAllRouteLines(routes: FlightRoute[]): FeatureCollection<LineString, RouteLineProperties> {
  const features = routes.flatMap((route, index) =>
    buildRouteLineFeatures(route, ROUTE_COLORS[index % ROUTE_COLORS.length]),
  );

  return {
    type: "FeatureCollection",
    features,
  };
}
