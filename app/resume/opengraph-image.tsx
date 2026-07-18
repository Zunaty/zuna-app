import { ImageResponse } from "next/og";

import { site } from "@/lib/data/site";
import { OgCard } from "@/lib/og/og-card";
import { ogContentType, ogSize } from "@/lib/og/shared";

export const runtime = "edge";
export const alt = `Resume — ${site.name}`;
export const size = ogSize;
export const contentType = ogContentType;

export default function ResumeOpenGraphImage() {
  return new ImageResponse(
    <OgCard eyebrow="Portfolio" title="Resume" description={`${site.name} · ${site.title} · ${site.location}`} />,
    { ...size },
  );
}
