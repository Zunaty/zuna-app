import { useSyncExternalStore } from "react";

import { POKEMON_FAVORITES_STORAGE_KEY, parseFavorites, type PokemonFavorite } from "@/lib/pokemon/favorites";

const EMPTY_FAVORITES: PokemonFavorite[] = [];

let cachedRaw: string | null | undefined;
let cachedFavorites: PokemonFavorite[] = EMPTY_FAVORITES;

function subscribe(callback: () => void) {
  window.addEventListener("pokemon-favorites-updated", callback);
  window.addEventListener("storage", callback);
  return () => {
    window.removeEventListener("pokemon-favorites-updated", callback);
    window.removeEventListener("storage", callback);
  };
}

function getFavoritesSnapshot() {
  const raw = localStorage.getItem(POKEMON_FAVORITES_STORAGE_KEY);
  if (raw === cachedRaw) {
    return cachedFavorites;
  }

  cachedRaw = raw;
  const parsed = parseFavorites(raw);
  cachedFavorites = parsed.length === 0 ? EMPTY_FAVORITES : parsed;
  return cachedFavorites;
}

function getFavoritesServerSnapshot() {
  return EMPTY_FAVORITES;
}

export function usePokemonFavorites() {
  return useSyncExternalStore(subscribe, getFavoritesSnapshot, getFavoritesServerSnapshot);
}
