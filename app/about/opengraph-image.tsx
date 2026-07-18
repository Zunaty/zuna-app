import { ImageResponse } from "next/og";

import { site } from "@/lib/data/site";
import { OgCard } from "@/lib/og/og-card";
import { ogContentType, ogSize } from "@/lib/og/shared";

export const runtime = "edge";
export const alt = `About — ${site.name}`;
export const size = ogSize;
export const contentType = ogContentType;

export default function AboutOpenGraphImage() {
  return new ImageResponse(
    <OgCard
      eyebrow="Portfolio"
      title="About"
      description={`${site.name} — ${site.title}. Background, approach, and what I'm building here.`}
    />,
    { ...size },
  );
}
