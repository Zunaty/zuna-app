"use client";

import { useCallback, useRef } from "react";
import mapboxgl, { type GeoJSONSource, type Map, type MapLayerMouseEvent, type Popup } from "mapbox-gl";

import { MapboxMapCanvas } from "@/components/maps/use-mapbox-instance";
import { MapboxProvider } from "@/components/maps/mapbox-provider";
import { FLIGHT_ROUTES, FLIGHT_WAYPOINTS } from "@/lib/data/flight-routes";
import { buildAllRouteLines } from "@/lib/mapbox/curved-line";
import { useReducedMotion } from "@/lib/motion/use-reduced-motion";

const ROUTES_SOURCE_ID = "flight-routes";
const ROUTES_LAYER_ID = "flight-routes-lines";
const WAYPOINTS_SOURCE_ID = "flight-waypoints";
const WAYPOINTS_LAYER_ID = "flight-waypoints-circles";
const HUB_WAYPOINT_ID = "kslc";

const UTAH_CENTER: [number, number] = [-112.1, 39.2];
const INITIAL_ZOOM = 6.2;

function upsertGeoJsonSource(map: Map, id: string, data: GeoJSON.FeatureCollection): void {
  const existing = map.getSource(id) as GeoJSONSource | undefined;

  if (existing) {
    existing.setData(data);
    return;
  }

  map.addSource(id, { type: "geojson", data, generateId: true });
}

function ensureRouteLayers(map: Map): void {
  if (!map.getLayer(ROUTES_LAYER_ID)) {
    map.addLayer({
      id: ROUTES_LAYER_ID,
      type: "line",
      source: ROUTES_SOURCE_ID,
      layout: {
        "line-cap": "round",
        "line-join": "round",
      },
      paint: {
        "line-color": ["get", "color"],
        "line-width": ["case", ["boolean", ["feature-state", "active"], false], 4, 2.5],
        "line-opacity": ["case", ["boolean", ["feature-state", "dimmed"], false], 0.2, 0.9],
      },
    });
  }

  if (!map.getLayer(WAYPOINTS_LAYER_ID)) {
    map.addLayer({
      id: WAYPOINTS_LAYER_ID,
      type: "circle",
      source: WAYPOINTS_SOURCE_ID,
      paint: {
        "circle-color": ["case", ["==", ["get", "id"], HUB_WAYPOINT_ID], "#7c3aed", "#475569"],
        "circle-radius": ["case", ["==", ["get", "id"], HUB_WAYPOINT_ID], 7, 5],
        "circle-stroke-color": "#ffffff",
        "circle-stroke-width": 2,
      },
    });
  }
}

function fitUtahBounds(map: Map): void {
  const bounds = new mapboxgl.LngLatBounds();

  for (const waypoint of FLIGHT_WAYPOINTS) {
    bounds.extend([waypoint.lng, waypoint.lat]);
  }

  map.fitBounds(bounds, { padding: 56, maxZoom: 8, duration: 0 });
}

function animateRouteOpacity(map: Map, reduceMotion: boolean): void {
  if (reduceMotion) {
    map.setPaintProperty(ROUTES_LAYER_ID, "line-opacity", 0.9);
    return;
  }

  const durationMs = 900;
  const start = performance.now();

  const tick = (now: number) => {
    const progress = Math.min((now - start) / durationMs, 1);
    map.setPaintProperty(ROUTES_LAYER_ID, "line-opacity", 0.15 + progress * 0.75);

    if (progress < 1) {
      requestAnimationFrame(tick);
    }
  };

  map.setPaintProperty(ROUTES_LAYER_ID, "line-opacity", 0.15);
  requestAnimationFrame(tick);
}

export function AviationFlightMap() {
  const reduceMotion = useReducedMotion();
  const activeRouteRef = useRef<string | null>(null);
  const popupRef = useRef<Popup | null>(null);

  const setActiveRoute = useCallback((map: Map, routeId: string | null) => {
    activeRouteRef.current = routeId;

    const features = map.querySourceFeatures(ROUTES_SOURCE_ID);

    for (const feature of features) {
      const featureRouteId = feature.properties?.routeId;
      if (typeof featureRouteId !== "string" || feature.id === undefined) {
        continue;
      }

      map.setFeatureState(
        { source: ROUTES_SOURCE_ID, id: feature.id },
        {
          active: routeId === featureRouteId,
          dimmed: routeId !== null && routeId !== featureRouteId,
        },
      );
    }
  }, []);

  const handleReady = useCallback(
    (map: Map) => {
      const routeCollection = buildAllRouteLines(FLIGHT_ROUTES);
      const waypointCollection: GeoJSON.FeatureCollection = {
        type: "FeatureCollection",
        features: FLIGHT_WAYPOINTS.map((waypoint) => ({
          type: "Feature",
          properties: {
            id: waypoint.id,
            icao: waypoint.icao,
            name: waypoint.name,
          },
          geometry: {
            type: "Point",
            coordinates: [waypoint.lng, waypoint.lat],
          },
        })),
      };

      upsertGeoJsonSource(map, ROUTES_SOURCE_ID, routeCollection);
      upsertGeoJsonSource(map, WAYPOINTS_SOURCE_ID, waypointCollection);
      ensureRouteLayers(map);
      fitUtahBounds(map);
      animateRouteOpacity(map, reduceMotion ?? false);

      popupRef.current?.remove();
      popupRef.current = new mapboxgl.Popup({
        closeButton: false,
        closeOnClick: false,
        offset: 12,
        className: "mapbox-popup-theme",
      });

      const showRoutePopup = (event: MapLayerMouseEvent) => {
        const feature = event.features?.[0];
        const label = feature?.properties?.label;

        if (!feature || typeof label !== "string" || !popupRef.current) {
          return;
        }

        popupRef.current.setLngLat(event.lngLat).setHTML(`<strong>${label}</strong>`).addTo(map);
      };

      const onRouteMove = (event: MapLayerMouseEvent) => {
        map.getCanvas().style.cursor = "pointer";
        const routeId = event.features?.[0]?.properties?.routeId;
        if (typeof routeId === "string") {
          setActiveRoute(map, routeId);
          showRoutePopup(event);
        }
      };

      const onRouteLeave = () => {
        map.getCanvas().style.cursor = "";
        setActiveRoute(map, null);
        popupRef.current?.remove();
      };

      const onRouteClick = (event: MapLayerMouseEvent) => {
        const routeId = event.features?.[0]?.properties?.routeId;
        if (typeof routeId === "string") {
          setActiveRoute(map, routeId);
        }
      };

      const onWaypointClick = (event: MapLayerMouseEvent) => {
        const feature = event.features?.[0];
        const name = feature?.properties?.name;
        const icao = feature?.properties?.icao;

        if (!feature || typeof name !== "string" || typeof icao !== "string" || !popupRef.current) {
          return;
        }

        popupRef.current
          .setLngLat(event.lngLat)
          .setHTML(`<strong>${name}</strong><br /><span>${icao}</span>`)
          .addTo(map);
      };

      map.on("mousemove", ROUTES_LAYER_ID, onRouteMove);
      map.on("mouseleave", ROUTES_LAYER_ID, onRouteLeave);
      map.on("click", ROUTES_LAYER_ID, onRouteClick);
      map.on("click", WAYPOINTS_LAYER_ID, onWaypointClick);

      return () => {
        map.off("mousemove", ROUTES_LAYER_ID, onRouteMove);
        map.off("mouseleave", ROUTES_LAYER_ID, onRouteLeave);
        map.off("click", ROUTES_LAYER_ID, onRouteClick);
        map.off("click", WAYPOINTS_LAYER_ID, onWaypointClick);
        popupRef.current?.remove();
        popupRef.current = null;
      };
    },
    [reduceMotion, setActiveRoute],
  );

  return (
    <MapboxProvider className="min-h-[320px]">
      <MapboxMapCanvas
        ariaLabel="Utah flight routes map centered on Salt Lake City International"
        className="h-[320px] w-full rounded-xl"
        center={UTAH_CENTER}
        zoom={INITIAL_ZOOM}
        onReady={handleReady}
      />
    </MapboxProvider>
  );
}
