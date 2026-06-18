import { fetchJson } from "@/lib/explore/fetch";

import type { PokemonDetail, PokemonListItem, PokemonListResponse } from "./types";

export const POKEAPI_BASE = "https://pokeapi.co/api/v2";
export const POKEMON_PAGE_SIZE = 24;
export const POKEMON_SEARCH_LIMIT = 48;

type PokemonTypeResponse = {
  pokemon: Array<{ pokemon: PokemonListItem }>;
};

let cachedAllPokemon: PokemonListItem[] | null = null;

export function getPokemonIdFromUrl(url: string): number {
  const match = url.match(/\/pokemon\/(\d+)\//);
  if (!match) {
    throw new Error(`Invalid pokemon URL: ${url}`);
  }
  return Number.parseInt(match[1], 10);
}

export function getPokemonArtworkUrl(id: number): string {
  return `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/${id}.png`;
}

export function getPokemonSprite(pokemon: PokemonDetail): string | null {
  return (
    pokemon.sprites.other?.["official-artwork"]?.front_default ??
    pokemon.sprites.front_default ??
    getPokemonArtworkUrl(pokemon.id)
  );
}

export function formatPokemonName(name: string): string {
  return name
    .split("-")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

export async function fetchPokemonList(offset: number, limit = POKEMON_PAGE_SIZE): Promise<PokemonListResponse> {
  return fetchJson<PokemonListResponse>(`${POKEAPI_BASE}/pokemon?offset=${offset}&limit=${limit}`);
}

export async function fetchPokemon(idOrName: string): Promise<PokemonDetail | null> {
  try {
    return await fetchJson<PokemonDetail>(`${POKEAPI_BASE}/pokemon/${idOrName.toLowerCase()}`);
  } catch {
    return null;
  }
}

export async function fetchAllPokemon(): Promise<PokemonListItem[]> {
  if (cachedAllPokemon) {
    return cachedAllPokemon;
  }

  const firstPage = await fetchPokemonList(0, 1);
  const data = await fetchPokemonList(0, firstPage.count);
  cachedAllPokemon = data.results;
  return data.results;
}

export async function searchPokemon(query: string, limit = POKEMON_SEARCH_LIMIT): Promise<PokemonListItem[]> {
  const normalized = query.trim().toLowerCase();
  if (!normalized) {
    return [];
  }

  const allPokemon = await fetchAllPokemon();
  return allPokemon.filter((pokemon) => pokemon.name.includes(normalized)).slice(0, limit);
}

export async function fetchPokemonByType(
  typeName: string,
  offset: number,
  limit = POKEMON_PAGE_SIZE,
): Promise<PokemonListResponse> {
  const data = await fetchJson<PokemonTypeResponse>(`${POKEAPI_BASE}/type/${typeName.toLowerCase()}`);
  const results = data.pokemon.map(({ pokemon }) => pokemon);
  const count = results.length;

  return {
    count,
    next: offset + limit < count ? "paginated" : null,
    previous: offset > 0 ? "paginated" : null,
    results: results.slice(offset, offset + limit),
  };
}
