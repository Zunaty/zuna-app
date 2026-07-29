import { ImageResponse } from "next/og";

import { site } from "@/lib/data/site";
import {
  playgroundOgBackground,
  playgroundOgContentType,
  playgroundOgFont,
  playgroundOgSize,
} from "@/lib/og/playground";

export const runtime = "edge";
export const alt = `Style Lab — ${site.name}`;
export const size = playgroundOgSize;
export const contentType = playgroundOgContentType;

export default function StyleLabOpenGraphImage() {
  return new ImageResponse(
    <div
      style={{
        height: "100%",
        width: "100%",
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        padding: "80px",
        background: playgroundOgBackground,
        color: "white",
        fontFamily: playgroundOgFont,
      }}
    >
      <div style={{ fontSize: 28, opacity: 0.8, letterSpacing: "0.2em", textTransform: "uppercase" }}>Playground</div>
      <div style={{ fontSize: 72, fontWeight: 700, marginTop: 16, lineHeight: 1.05 }}>Style Lab</div>
      <div style={{ fontSize: 30, marginTop: 24, opacity: 0.85, maxWidth: 900 }}>
        Presets and live controls for radius, accents, and fonts — restyle the whole site.
      </div>
    </div>,
    { ...size },
  );
}
