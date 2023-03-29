import { PointsProvider } from "@/context/points";
import { ThemeProvider } from "@/context/theme";
import "@/styles/globals.css";
import type { AppProps } from "next/app";

export default function App({ Component, pageProps }: AppProps) {
  return (
    <ThemeProvider>
      <PointsProvider>
        <Component {...pageProps} />
      </PointsProvider>
    </ThemeProvider>
  );
}
