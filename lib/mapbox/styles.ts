export type MapboxTheme = "light" | "dark";

const MAPBOX_STYLES: Record<MapboxTheme, string> = {
  light: "mapbox://styles/mapbox/light-v11",
  dark: "mapbox://styles/mapbox/dark-v11",
};

export function getMapboxStyleUrl(theme: MapboxTheme): string {
  return MAPBOX_STYLES[theme];
}

export function resolveMapboxTheme(resolvedTheme: string | undefined): MapboxTheme {
  return resolvedTheme === "dark" ? "dark" : "light";
}
