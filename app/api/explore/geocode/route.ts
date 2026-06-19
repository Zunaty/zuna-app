import { NextRequest, NextResponse } from "next/server";

import { geocodePlace } from "@/lib/mapbox/geocode";
import { getServerMapboxToken } from "@/lib/mapbox/env";

export async function GET(request: NextRequest) {
  const query = request.nextUrl.searchParams.get("q")?.trim() ?? "";

  if (!query) {
    return NextResponse.json({ error: "Missing search query." }, { status: 400 });
  }

  if (query.length > 120) {
    return NextResponse.json({ error: "Search query is too long." }, { status: 400 });
  }

  const token = getServerMapboxToken();

  if (!token) {
    return NextResponse.json({ error: "Geocoding is not configured." }, { status: 503 });
  }

  try {
    const result = await geocodePlace(query, token);

    if (!result) {
      return NextResponse.json({ result: null, message: "No matching places found." });
    }

    return NextResponse.json({ result });
  } catch {
    return NextResponse.json({ error: "Failed to geocode place." }, { status: 502 });
  }
}
