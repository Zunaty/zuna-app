import { POKEAPI_BASE } from "@/lib/pokemon/api";
import type { PokemonListItem } from "@/lib/pokemon/types";

export type PokemonCollectionEntry = {
  pokemonId: number;
  pokemonSlug: string;
  isFavorite: boolean;
  caughtInGame: boolean;
  hasCard: boolean;
};

export type PokemonCollectionMap = Map<number, PokemonCollectionEntry>;

export function collectionEntryToListItem(entry: PokemonCollectionEntry): PokemonListItem {
  return {
    name: entry.pokemonSlug,
    url: `${POKEAPI_BASE}/pokemon/${entry.pokemonId}/`,
  };
}

export function filterCollection(
  collection: PokemonCollectionEntry[],
  filter: "all" | "favorite" | "caught" | "card",
): PokemonListItem[] {
  return collection
    .filter((entry) => {
      if (filter === "all") return hasAnyCollectionFlag(entry);
      if (filter === "favorite") return entry.isFavorite;
      if (filter === "caught") return entry.caughtInGame;
      return entry.hasCard;
    })
    .map(collectionEntryToListItem);
}

export function filterPokemonByName(items: PokemonListItem[], query: string): PokemonListItem[] {
  const normalized = query.trim().toLowerCase();
  if (!normalized) {
    return items;
  }

  return items.filter((item) => item.name.includes(normalized));
}

export function countCollected(collection: PokemonCollectionEntry[]): number {
  return collection.filter(hasAnyCollectionFlag).length;
}

export function hasAnyCollectionFlag(entry: PokemonCollectionEntry): boolean {
  return entry.isFavorite || entry.caughtInGame || entry.hasCard;
}

export function entriesToMap(entries: PokemonCollectionEntry[]): PokemonCollectionMap {
  return new Map(entries.map((entry) => [entry.pokemonId, entry]));
}
