export function getPublicMapboxToken(): string | undefined {
  const token = process.env.NEXT_PUBLIC_MAPBOX_TOKEN?.trim();
  return token || undefined;
}

export function getServerMapboxToken(): string | undefined {
  const token = process.env.MAPBOX_ACCESS_TOKEN?.trim();
  return token || undefined;
}

export function hasPublicMapboxToken(): boolean {
  return Boolean(getPublicMapboxToken());
}
