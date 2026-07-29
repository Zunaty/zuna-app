import type { Metadata } from "next";
import { DM_Sans, Geist, Geist_Mono, Pixelify_Sans, Source_Serif_4 } from "next/font/google";
import { SpeedInsights } from "@vercel/speed-insights/next";
import { Analytics } from "@vercel/analytics/next";

import { AchievementProvider } from "@/components/achievements/achievement-provider";
import { MotionProvider } from "@/components/motion/motion-provider";
import { SiteFooter } from "@/components/layout/site-footer";
import { SiteHeader } from "@/components/layout/site-header";
import { SkipToContent } from "@/components/layout/skip-to-content";
import { StyleLabProvider } from "@/components/style-lab-provider";
import { ThemeProvider } from "@/components/theme-provider";
import { getServerStyleLabHtmlStyle, getServerStyleLabPreference } from "@/lib/style-lab/server";
import { getServerResolvedThemeClass, getServerThemePreference } from "@/lib/theme/server";
import { site } from "@/lib/data/site";
import { getSiteUrl } from "@/lib/utils";

import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const dmSans = DM_Sans({
  variable: "--font-dm-sans",
  subsets: ["latin"],
});

const sourceSerif = Source_Serif_4({
  variable: "--font-source-serif",
  subsets: ["latin"],
});

const pixelifySans = Pixelify_Sans({
  variable: "--font-pixel",
  subsets: ["latin"],
});

const fontVariables = [
  geistSans.variable,
  geistMono.variable,
  dmSans.variable,
  sourceSerif.variable,
  pixelifySans.variable,
].join(" ");

export const metadata: Metadata = {
  metadataBase: new URL(getSiteUrl()),
  title: {
    default: site.name,
    template: `%s | ${site.name}`,
  },
  description: `Portfolio, playground, and interactive demos by ${site.name}.`,
  openGraph: {
    siteName: site.name,
    type: "website",
    locale: "en_US",
  },
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const [initialTheme, themeClass, initialStylePreference, styleLabHtmlStyle] = await Promise.all([
    getServerThemePreference(),
    getServerResolvedThemeClass(),
    getServerStyleLabPreference(),
    getServerStyleLabHtmlStyle(),
  ]);

  return (
    <html
      lang="en"
      className={[fontVariables, themeClass].filter(Boolean).join(" ")}
      style={styleLabHtmlStyle}
      suppressHydrationWarning
    >
      <body className="min-h-screen font-sans">
        <ThemeProvider initialTheme={initialTheme}>
          <StyleLabProvider initialPreference={initialStylePreference}>
            <MotionProvider>
              <AchievementProvider>
                <div className="flex min-h-screen flex-col">
                  <SkipToContent />
                  <SiteHeader />
                  <main id="main-content" className="flex-1" tabIndex={-1}>
                    {children}
                  </main>
                  <SiteFooter />
                </div>
              </AchievementProvider>
            </MotionProvider>
          </StyleLabProvider>
        </ThemeProvider>
        {process.env.NODE_ENV === "production" ? (
          <>
            <SpeedInsights />
            <Analytics />
          </>
        ) : null}
      </body>
    </html>
  );
}
