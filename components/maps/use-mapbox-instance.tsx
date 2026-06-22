"use client";

import { useEffect, useRef } from "react";
import mapboxgl, { type Map } from "mapbox-gl";
import { useTheme } from "@/lib/theme/theme-provider";

import { getPublicMapboxToken } from "@/lib/mapbox/env";
import { getMapboxStyleUrl, resolveMapboxTheme, type MapboxTheme } from "@/lib/mapbox/styles";

import "mapbox-gl/dist/mapbox-gl.css";

type UseMapboxInstanceOptions = {
  center: [number, number];
  zoom: number;
  onReady?: (map: Map) => void | (() => void);
};

export function useMapboxInstance({ center, zoom, onReady }: UseMapboxInstanceOptions) {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<Map | null>(null);
  const onReadyRef = useRef(onReady);
  const themeRef = useRef<MapboxTheme>("light");
  const { resolvedTheme } = useTheme();

  useEffect(() => {
    onReadyRef.current = onReady;
  }, [onReady]);

  useEffect(() => {
    const container = containerRef.current;
    const token = getPublicMapboxToken();

    if (!container || !token || mapRef.current) {
      return;
    }

    mapboxgl.accessToken = token;
    themeRef.current = resolveMapboxTheme(resolvedTheme);

    const map = new mapboxgl.Map({
      container,
      style: getMapboxStyleUrl(themeRef.current),
      center,
      zoom,
      attributionControl: true,
    });

    map.addControl(new mapboxgl.NavigationControl({ showCompass: false }), "top-right");
    mapRef.current = map;

    let cleanupReady: (() => void) | void;

    const runReady = () => {
      cleanupReady?.();
      cleanupReady = onReadyRef.current?.(map);
    };

    map.on("load", runReady);
    map.on("style.load", runReady);

    return () => {
      cleanupReady?.();
      map.remove();
      mapRef.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps -- map is created once per mount
  }, []);

  useEffect(() => {
    const map = mapRef.current;
    if (!map) {
      return;
    }

    const nextTheme = resolveMapboxTheme(resolvedTheme);
    if (themeRef.current === nextTheme) {
      return;
    }

    themeRef.current = nextTheme;
    map.setStyle(getMapboxStyleUrl(nextTheme));
  }, [resolvedTheme]);

  return { containerRef, mapRef };
}

type MapboxMapCanvasProps = {
  ariaLabel: string;
  className?: string;
  center: [number, number];
  zoom: number;
  onReady?: (map: Map) => void | (() => void);
};

export function MapboxMapCanvas({ ariaLabel, className, center, zoom, onReady }: MapboxMapCanvasProps) {
  const { containerRef } = useMapboxInstance({ center, zoom, onReady });

  return <div ref={containerRef} className={className} role="application" aria-label={ariaLabel} tabIndex={0} />;
}

export function moveMapToResult(
  map: Map,
  result: { lng: number; lat: number; bbox?: [number, number, number, number] },
  reduceMotion: boolean,
): void {
  if (result.bbox) {
    const bounds: [[number, number], [number, number]] = [
      [result.bbox[0], result.bbox[1]],
      [result.bbox[2], result.bbox[3]],
    ];

    map.fitBounds(bounds, { padding: 48, maxZoom: 12, duration: reduceMotion ? 0 : 1200 });
    return;
  }

  const camera = {
    center: [result.lng, result.lat] as [number, number],
    zoom: 10,
    speed: 1.2,
    curve: 1.4,
  };

  if (reduceMotion) {
    map.jumpTo(camera);
    return;
  }

  map.flyTo(camera);
}
