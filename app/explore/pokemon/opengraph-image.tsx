import { ImageResponse } from "next/og";

import { site } from "@/lib/data/site";
import { OgCard } from "@/lib/og/og-card";
import { ogContentType, ogSize } from "@/lib/og/shared";

export const runtime = "edge";
export const alt = `Pokédex — ${site.name}`;
export const size = ogSize;
export const contentType = ogContentType;

export default function PokemonOpenGraphImage() {
  return new ImageResponse(
    <OgCard
      eyebrow="Explore · PokéAPI"
      title="Pokédex"
      description="Browse species, filter by type, and track favorites, catches, and TCG cards."
    />,
    { ...size },
  );
}
