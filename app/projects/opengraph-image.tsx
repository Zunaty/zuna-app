import { ImageResponse } from "next/og";

import { site } from "@/lib/data/site";
import { OgCard } from "@/lib/og/og-card";
import { ogContentType, ogSize } from "@/lib/og/shared";

export const runtime = "edge";
export const alt = `Projects — ${site.name}`;
export const size = ogSize;
export const contentType = ogContentType;

export default function ProjectsOpenGraphImage() {
  return new ImageResponse(
    <OgCard
      eyebrow="Portfolio"
      title="Projects"
      description={`Selected work by ${site.name} — marketing sites, platforms, and interactive experiences.`}
    />,
    { ...size },
  );
}
