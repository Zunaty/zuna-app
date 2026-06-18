import { NextRequest, NextResponse } from "next/server";

import { fetchPokemonList, POKEMON_PAGE_SIZE } from "@/lib/pokemon/api";

export async function GET(request: NextRequest) {
  const offsetParam = request.nextUrl.searchParams.get("offset");
  const limitParam = request.nextUrl.searchParams.get("limit");

  const offset = Number.parseInt(offsetParam ?? "0", 10);
  const limit = Number.parseInt(limitParam ?? String(POKEMON_PAGE_SIZE), 10);

  if (!Number.isFinite(offset) || offset < 0 || !Number.isFinite(limit) || limit < 1 || limit > 100) {
    return NextResponse.json({ error: "Invalid query parameters." }, { status: 400 });
  }

  try {
    const data = await fetchPokemonList(offset, limit);
    return NextResponse.json(data);
  } catch {
    return NextResponse.json({ error: "Failed to fetch Pokémon." }, { status: 502 });
  }
}
