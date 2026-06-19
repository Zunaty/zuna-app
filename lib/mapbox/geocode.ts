export type GeocodeResult = {
  lng: number;
  lat: number;
  placeName: string;
  bbox?: [number, number, number, number];
};

type MapboxGeocodeFeature = {
  center: [number, number];
  place_name: string;
  bbox?: [number, number, number, number];
};

type MapboxGeocodeResponse = {
  features: MapboxGeocodeFeature[];
};

export async function geocodePlace(query: string, accessToken: string): Promise<GeocodeResult | null> {
  const url = new URL(`https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(query)}.json`);
  url.searchParams.set("access_token", accessToken);
  url.searchParams.set("limit", "1");
  url.searchParams.set("language", "en");

  const response = await fetch(url, { cache: "no-store" });

  if (!response.ok) {
    throw new Error(`Mapbox geocoding failed: ${response.status}`);
  }

  const data = (await response.json()) as MapboxGeocodeResponse;
  const feature = data.features[0];

  if (!feature) {
    return null;
  }

  const [lng, lat] = feature.center;

  return {
    lng,
    lat,
    placeName: feature.place_name,
    bbox: feature.bbox,
  };
}
