import { ImageResponse } from "next/og";

import { site } from "@/lib/data/site";
import { OgCard } from "@/lib/og/og-card";
import { ogContentType, ogSize } from "@/lib/og/shared";

export const runtime = "edge";
export const alt = `Explore — ${site.name}`;
export const size = ogSize;
export const contentType = ogContentType;

export default function ExploreOpenGraphImage() {
  return new ImageResponse(
    <OgCard
      eyebrow="Explore"
      title="API playgrounds"
      description="Live demos from public APIs — Pokédex and Mapbox geocoding, wired into polished UI."
      titleSize={64}
    />,
    { ...size },
  );
}
