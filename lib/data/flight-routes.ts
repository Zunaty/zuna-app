/**
 * Flight map data — edit this file to add routes over time.
 *
 * Routes use waypoint `id` values (left column below), not ICAO codes.
 * Don't remember the code? Search the city on AirNav or SkyVector:
 *   https://airnav.com   https://skyvector.com
 *
 * Quick reference (id → city → code shown on map popups):
 *   kslc  Salt Lake City   KSLC
 *   u14   Nephi            U14
 *   kfom  Fillmore         KFOM
 *   ksgu  St. George       KSGU
 *   kogd  Ogden            KOGD  (Hinckley)
 *   ktvy  Tooele           KTVY  (Bolinder / Tooele Valley)
 *   kmld  Malad City ID    KMLD
 *   khcr  Heber City       KHCR  (Russ McDonald Field)
 *   kbce  Bryce Canyon     KBCE
 *   kmlf  Milford          KMLF  (Briscoe Field)
 *   skull-valley  Skull Valley   Area  (practice — not an airport)
 *   ksvr  West Jordan      KSVR  (South Valley / old Airport 2)
 */

export type FlightWaypoint = {
  id: string;
  icao: string;
  name: string;
  lng: number;
  lat: number;
};

export type FlightRoute = {
  id: string;
  label: string;
  legs: string[];
  notes?: string;
};

export const FLIGHT_WAYPOINTS: FlightWaypoint[] = [
  {
    id: "kslc",
    icao: "KSLC",
    name: "Salt Lake City International",
    lng: -111.977773,
    lat: 40.788389,
  },
  {
    id: "u14",
    icao: "U14",
    name: "Nephi Municipal",
    lng: -111.862539,
    lat: 39.738289,
  },
  {
    id: "kfom",
    icao: "KFOM",
    name: "Fillmore Municipal",
    lng: -112.362778,
    lat: 38.958556,
  },
  {
    id: "ksgu",
    icao: "KSGU",
    name: "St. George Regional",
    lng: -113.593056,
    lat: 37.090583,
  },
  {
    id: "kogd",
    icao: "KOGD",
    name: "Ogden-Hinckley",
    lng: -112.012195,
    lat: 41.19507,
  },
  {
    id: "ktvy",
    icao: "KTVY",
    name: "Tooele Valley (Bolinder Field)",
    lng: -112.350778,
    lat: 40.612556,
  },
  {
    id: "kmld",
    icao: "KMLD",
    name: "Malad City",
    lng: -112.292679,
    lat: 42.170126,
  },
  {
    id: "khcr",
    icao: "KHCR",
    name: "Heber City (Russ McDonald Field)",
    lng: -111.428889,
    lat: 40.481667,
  },
  {
    id: "kbce",
    icao: "KBCE",
    name: "Bryce Canyon",
    lng: -112.1458,
    lat: 37.706447,
  },
  {
    id: "kmlf",
    icao: "KMLF",
    name: "Milford (Briscoe Field)",
    lng: -113.013274,
    lat: 38.426636,
  },
  {
    id: "skull-valley",
    icao: "Area",
    name: "Skull Valley (spin training)",
    lng: -112.74444,
    lat: 40.53722,
  },
  {
    id: "ksvr",
    icao: "KSVR",
    name: "South Valley Regional (Airport 2)",
    lng: -111.992889,
    lat: 40.619547,
  },
];

export const FLIGHT_ROUTES: FlightRoute[] = [
  {
    id: "kslc-nephi",
    label: "Salt Lake ↔ Nephi",
    legs: ["kslc", "u14", "kslc"],
    notes: "Simple out-and-back",
  },
  {
    id: "kslc-fillmore",
    label: "Salt Lake ↔ Fillmore",
    legs: ["kslc", "kfom", "kslc"],
    notes: "Simple out-and-back",
  },
  {
    id: "kslc-st-george",
    label: "Salt Lake ↔ St. George",
    legs: ["kslc", "ksgu", "kslc"],
    notes: "Longer cross-country",
  },
  {
    id: "kslc-ogden",
    label: "Salt Lake ↔ Ogden",
    legs: ["kslc", "kogd", "kslc"],
    notes: "Simple out-and-back",
  },
  {
    id: "kslc-tooele",
    label: "Salt Lake ↔ Tooele",
    legs: ["kslc", "ktvy", "kslc"],
    notes: "Simple out-and-back",
  },
  {
    id: "kslc-malad",
    label: "Salt Lake ↔ Malad",
    legs: ["kslc", "kmld", "kslc"],
    notes: "Simple out-and-back",
  },
  {
    id: "kslc-heber",
    label: "Salt Lake ↔ Heber",
    legs: ["kslc", "khcr", "kslc"],
    notes: "Simple out-and-back",
  },
  {
    id: "kslc-fillmore-nephi",
    label: "Salt Lake round-robin",
    legs: ["kslc", "kfom", "u14", "kslc"],
    notes: "Compound route — Fillmore then Nephi",
  },
  {
    id: "ksgu-bryce",
    label: "St. George ↔ Bryce Canyon",
    legs: ["ksgu", "kbce", "ksgu"],
    notes: "Southern Utah cross-country",
  },
  {
    id: "kslc-fillmore-milford",
    label: "Salt Lake → Fillmore → Milford",
    legs: ["kslc", "kfom", "kmlf", "kslc"],
    notes: "Compound cross-country — I-15 corridor south",
  },
  {
    id: "kslc-skull-valley-spin",
    label: "Spin flight — Skull Valley",
    legs: ["kslc", "skull-valley", "kslc"],
    notes: "Training area west of the valley — not a specific airport",
  },
  {
    id: "kslc-airport-2",
    label: "Salt Lake ↔ Airport 2",
    legs: ["kslc", "ksvr", "kslc"],
    notes: "South Valley Regional (formerly Municipal Airport No. 2)",
  },
];

const waypointById = new Map(FLIGHT_WAYPOINTS.map((waypoint) => [waypoint.id, waypoint]));

export function getFlightWaypoint(id: string): FlightWaypoint | undefined {
  return waypointById.get(id);
}
