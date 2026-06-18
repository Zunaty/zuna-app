import { NextRequest, NextResponse } from "next/server";

import { POKEMON_SEARCH_LIMIT, searchPokemon } from "@/lib/pokemon/api";

export async function GET(request: NextRequest) {
  const query = request.nextUrl.searchParams.get("q")?.trim() ?? "";

  if (!query) {
    return NextResponse.json({ results: [], count: 0 });
  }

  if (query.length > 50) {
    return NextResponse.json({ error: "Search query is too long." }, { status: 400 });
  }

  try {
    const results = await searchPokemon(query, POKEMON_SEARCH_LIMIT);
    return NextResponse.json({ results, count: results.length });
  } catch {
    return NextResponse.json({ error: "Failed to search Pokémon." }, { status: 502 });
  }
}
