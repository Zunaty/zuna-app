import { NextRequest, NextResponse } from "next/server";

import { fetchPokemonByType, POKEMON_PAGE_SIZE } from "@/lib/pokemon/api";
import { POKEMON_TYPES } from "@/lib/pokemon/constants";

export async function GET(request: NextRequest) {
  const type = request.nextUrl.searchParams.get("type")?.trim().toLowerCase() ?? "";
  const offsetParam = request.nextUrl.searchParams.get("offset");
  const limitParam = request.nextUrl.searchParams.get("limit");

  const offset = Number.parseInt(offsetParam ?? "0", 10);
  const limit = Number.parseInt(limitParam ?? String(POKEMON_PAGE_SIZE), 10);

  if (!type || !POKEMON_TYPES.includes(type as (typeof POKEMON_TYPES)[number])) {
    return NextResponse.json({ error: "Invalid type." }, { status: 400 });
  }

  if (!Number.isFinite(offset) || offset < 0 || !Number.isFinite(limit) || limit < 1 || limit > 100) {
    return NextResponse.json({ error: "Invalid query parameters." }, { status: 400 });
  }

  try {
    const data = await fetchPokemonByType(type, offset, limit);
    return NextResponse.json(data);
  } catch {
    return NextResponse.json({ error: "Failed to fetch Pokémon by type." }, { status: 502 });
  }
}
