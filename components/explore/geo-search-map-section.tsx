"use client";

import dynamic from "next/dynamic";

import { MapboxUnavailableNotice } from "@/components/maps/mapbox-unavailable-notice";

const GeoSearchMap = dynamic(
  () => import("@/components/explore/geo-search-map").then((module) => module.GeoSearchMap),
  {
    ssr: false,
    loading: () => <MapboxUnavailableNotice message="Loading map…" className="min-h-[420px]" />,
  },
);

export function GeoSearchMapSection() {
  return <GeoSearchMap />;
}
