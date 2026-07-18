import { ImageResponse } from "next/og";

import { site } from "@/lib/data/site";
import { OgCard } from "@/lib/og/og-card";
import { ogContentType, ogSize } from "@/lib/og/shared";

export const runtime = "edge";
export const alt = `Geocoding — ${site.name}`;
export const size = ogSize;
export const contentType = ogContentType;

export default function GeoOpenGraphImage() {
  return new ImageResponse(
    <OgCard
      eyebrow="Explore · Mapbox"
      title="Geocoding"
      description="Search a place and watch the map fly to the result — Mapbox geocoding demo."
      titleSize={64}
    />,
    { ...size },
  );
}
