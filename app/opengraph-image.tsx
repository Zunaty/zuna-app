import { ImageResponse } from "next/og";

import { site } from "@/lib/data/site";

export const runtime = "edge";
export const alt = `${site.name} — ${site.title}`;
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OpenGraphImage() {
  return new ImageResponse(
    <div
      style={{
        height: "100%",
        width: "100%",
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        padding: "80px",
        background: "linear-gradient(135deg, #0f0a1a 0%, #1a1033 50%, #2d1b69 100%)",
        color: "white",
        fontFamily: "system-ui, sans-serif",
      }}
    >
      <div style={{ fontSize: 28, opacity: 0.8, letterSpacing: "0.2em", textTransform: "uppercase" }}>Zuna</div>
      <div style={{ fontSize: 72, fontWeight: 700, marginTop: 16, lineHeight: 1.1 }}>{site.name}</div>
      <div style={{ fontSize: 32, marginTop: 24, opacity: 0.85, maxWidth: 800 }}>{site.title}</div>
      <div style={{ fontSize: 22, marginTop: 16, opacity: 0.65, maxWidth: 720 }}>{site.tagline}</div>
    </div>,
    { ...size },
  );
}
