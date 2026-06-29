import { ImageResponse } from "next/og";

import { site } from "@/lib/data/site";
import {
  playgroundOgBackground,
  playgroundOgContentType,
  playgroundOgFont,
  playgroundOgSize,
} from "@/lib/og/playground";

export const runtime = "edge";
export const alt = `Playground — ${site.name}`;
export const size = playgroundOgSize;
export const contentType = playgroundOgContentType;

export default function PlaygroundOpenGraphImage() {
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
      <div style={{ fontSize: 64, fontWeight: 700, marginTop: 16, lineHeight: 1.1 }}>Mini-games</div>
      <div style={{ fontSize: 30, marginTop: 24, opacity: 0.85, maxWidth: 900 }}>
        Type Racer and Prompt Run — interactive experiments by {site.name}.
      </div>
    </div>,
    { ...size },
  );
}
