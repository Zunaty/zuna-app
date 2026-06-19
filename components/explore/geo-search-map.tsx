"use client";

import { Loader2, X } from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";
import mapboxgl, { type GeoJSONSource, type Map } from "mapbox-gl";

import { MapboxMapCanvas, moveMapToResult } from "@/components/maps/use-mapbox-instance";
import { MapboxProvider } from "@/components/maps/mapbox-provider";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { GeocodeResult } from "@/lib/mapbox/geocode";
import { useReducedMotion } from "@/lib/motion/use-reduced-motion";

const MARKER_SOURCE_ID = "geocode-marker";
const MARKER_LAYER_ID = "geocode-marker-dot";
const DEFAULT_CENTER: [number, number] = [-112.1, 39.2];
const DEFAULT_ZOOM = 5.5;
const DEBOUNCE_MS = 300;

type GeocodeResponse = { result: GeocodeResult } | { error: string } | { result: null; message: string };

function upsertMarker(map: Map, result: GeocodeResult): void {
  const data: GeoJSON.FeatureCollection = {
    type: "FeatureCollection",
    features: [
      {
        type: "Feature",
        properties: { placeName: result.placeName },
        geometry: {
          type: "Point",
          coordinates: [result.lng, result.lat],
        },
      },
    ],
  };

  const existing = map.getSource(MARKER_SOURCE_ID) as GeoJSONSource | undefined;

  if (existing) {
    existing.setData(data);
  } else {
    map.addSource(MARKER_SOURCE_ID, { type: "geojson", data });
    map.addLayer({
      id: MARKER_LAYER_ID,
      type: "circle",
      source: MARKER_SOURCE_ID,
      paint: {
        "circle-color": "#7c3aed",
        "circle-radius": 8,
        "circle-stroke-color": "#ffffff",
        "circle-stroke-width": 2,
      },
    });
  }
}

export function GeoSearchMap() {
  const reduceMotion = useReducedMotion();
  const mapRef = useRef<Map | null>(null);
  const popupRef = useRef<mapboxgl.Popup | null>(null);
  const resultRef = useRef<GeocodeResult | null>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [result, setResult] = useState<GeocodeResult | null>(null);

  const runSearch = useCallback(async (value: string) => {
    const trimmed = value.trim();

    if (!trimmed) {
      setMessage(null);
      setResult(null);
      resultRef.current = null;
      return;
    }

    setLoading(true);
    setMessage(null);

    try {
      const response = await fetch(`/api/explore/geocode?q=${encodeURIComponent(trimmed)}`);
      const data = (await response.json()) as GeocodeResponse;

      if (!response.ok) {
        setMessage("error" in data ? data.error : "Geocoding failed.");
        setResult(null);
        resultRef.current = null;
        return;
      }

      if ("message" in data && data.result === null) {
        setMessage(data.message);
        setResult(null);
        resultRef.current = null;
        return;
      }

      if (!("result" in data) || !data.result) {
        setMessage("No matching places found.");
        setResult(null);
        resultRef.current = null;
        return;
      }

      setResult(data.result);
      resultRef.current = data.result;
      setMessage(null);
    } catch {
      setMessage("Could not reach the geocoding service.");
      setResult(null);
      resultRef.current = null;
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
    }

    debounceRef.current = setTimeout(() => {
      void runSearch(query);
    }, DEBOUNCE_MS);

    return () => {
      if (debounceRef.current) {
        clearTimeout(debounceRef.current);
      }
    };
  }, [query, runSearch]);

  const applyResult = useCallback(
    (map: Map, nextResult: GeocodeResult) => {
      upsertMarker(map, nextResult);
      moveMapToResult(map, nextResult, reduceMotion ?? false);

      popupRef.current?.remove();
      popupRef.current = new mapboxgl.Popup({ closeButton: false, offset: 12, className: "mapbox-popup-theme" })
        .setLngLat([nextResult.lng, nextResult.lat])
        .setHTML(`<strong>${nextResult.placeName}</strong>`)
        .addTo(map);
    },
    [reduceMotion],
  );

  useEffect(() => {
    const map = mapRef.current;
    if (!map || !result) {
      return;
    }

    applyResult(map, result);
  }, [applyResult, result]);

  const handleReady = useCallback(
    (map: Map) => {
      mapRef.current = map;

      if (resultRef.current) {
        applyResult(map, resultRef.current);
      }

      return () => {
        popupRef.current?.remove();
        popupRef.current = null;
        mapRef.current = null;
      };
    },
    [applyResult],
  );

  return (
    <MapboxProvider className="min-h-[420px]">
      <div className="overflow-hidden rounded-xl border bg-card shadow">
        <div className="border-b bg-muted/20 p-4">
          <div className="relative max-w-xl">
            <Label htmlFor="geo-search" className="sr-only">
              Search for a place
            </Label>
            <Input
              id="geo-search"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Try: Salt Lake City, Nephi UT, St. George"
              autoComplete="off"
              spellCheck={false}
              className="pr-16"
            />
            <div className="pointer-events-none absolute inset-y-0 right-3 flex items-center gap-2">
              {loading ? <Loader2 className="size-4 animate-spin text-muted-foreground" aria-hidden /> : null}
              {query ? (
                <button
                  type="button"
                  className="pointer-events-auto rounded-sm p-1 text-muted-foreground hover:text-foreground"
                  onClick={() => setQuery("")}
                  aria-label="Clear search"
                >
                  <X className="size-4" />
                </button>
              ) : null}
            </div>
          </div>
          {message ? (
            <p className="mt-2 text-sm text-muted-foreground" role="status">
              {message}
            </p>
          ) : null}
        </div>

        <MapboxMapCanvas
          ariaLabel="Interactive map showing geocoding search results"
          className="h-[360px] w-full"
          center={DEFAULT_CENTER}
          zoom={DEFAULT_ZOOM}
          onReady={handleReady}
        />
      </div>
    </MapboxProvider>
  );
}
