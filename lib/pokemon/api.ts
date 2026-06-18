import { fetchJson } from "@/lib/explore/fetch";

import type { PokemonDetail, PokemonListResponse } from "./types";

export const POKEAPI_BASE = "https://pokeapi.co/api/v2";
export const POKEMON_PAGE_SIZE = 24;

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
