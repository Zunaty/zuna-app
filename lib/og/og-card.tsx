import { ogBackground, ogFont } from "@/lib/og/shared";

type OgCardProps = {
  eyebrow: string;
  title: string;
  description: string;
  /** Optional line between title and description (e.g. role on the home OG). */
  subtitle?: string;
  titleSize?: number;
};

export function OgCard({ eyebrow, title, description, subtitle, titleSize = 72 }: OgCardProps) {
  return (
    <div
      style={{
        height: "100%",
        width: "100%",
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        padding: "80px",
        background: ogBackground,
        color: "white",
        fontFamily: ogFont,
      }}
    >
      <div style={{ fontSize: 28, opacity: 0.8, letterSpacing: "0.2em", textTransform: "uppercase" }}>{eyebrow}</div>
      <div style={{ fontSize: titleSize, fontWeight: 700, marginTop: 16, lineHeight: 1.05 }}>{title}</div>
      {subtitle ? <div style={{ fontSize: 32, marginTop: 24, opacity: 0.85, maxWidth: 800 }}>{subtitle}</div> : null}
      <div
        style={{
          fontSize: subtitle ? 22 : 30,
          marginTop: subtitle ? 16 : 24,
          opacity: subtitle ? 0.65 : 0.85,
          maxWidth: subtitle ? 720 : 900,
        }}
      >
        {description}
      </div>
    </div>
  );
}
