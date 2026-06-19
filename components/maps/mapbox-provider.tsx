"use client";

import type { ReactNode } from "react";

import { MapboxUnavailableNotice } from "@/components/maps/mapbox-unavailable-notice";
import { hasPublicMapboxToken } from "@/lib/mapbox/env";

type MapboxProviderProps = {
  children: ReactNode;
  fallbackMessage?: string;
  className?: string;
};

export function MapboxProvider({ children, fallbackMessage, className }: MapboxProviderProps) {
  if (!hasPublicMapboxToken()) {
    return <MapboxUnavailableNotice className={className} message={fallbackMessage} />;
  }

  return children;
}
