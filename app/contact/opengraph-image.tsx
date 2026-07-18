import { ImageResponse } from "next/og";

import { site } from "@/lib/data/site";
import { OgCard } from "@/lib/og/og-card";
import { ogContentType, ogSize } from "@/lib/og/shared";

export const runtime = "edge";
export const alt = `Contact — ${site.name}`;
export const size = ogSize;
export const contentType = ogContentType;

export default function ContactOpenGraphImage() {
  return new ImageResponse(
    <OgCard
      eyebrow="Portfolio"
      title="Contact"
      description={`Get in touch with ${site.name} for roles, collaborations, or questions about this site.`}
    />,
    { ...size },
  );
}
