"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";

import { syncLocalFavoritesToAccount } from "@/app/explore/pokemon/actions";
import { entriesToMap, type PokemonCollectionEntry } from "@/lib/pokemon/collection";
import { POKEMON_FAVORITES_STORAGE_KEY, parseFavorites } from "@/lib/pokemon/favorites";

type UsePokemonCollectionOptions = {
  initialCollection: PokemonCollectionEntry[];
  isAuthenticated: boolean;
};

export function usePokemonCollection({ initialCollection, isAuthenticated }: UsePokemonCollectionOptions) {
  const [collection, setCollection] = useState(initialCollection);
  const hasSyncedLocalRef = useRef(false);

  useEffect(() => {
    if (!isAuthenticated || hasSyncedLocalRef.current) {
      return;
    }

    const raw = localStorage.getItem(POKEMON_FAVORITES_STORAGE_KEY);
    const localFavorites = parseFavorites(raw);

    if (localFavorites.length === 0) {
      hasSyncedLocalRef.current = true;
      return;
    }

    void syncLocalFavoritesToAccount(localFavorites).then((result) => {
      hasSyncedLocalRef.current = true;

      if (!result.error) {
        localStorage.removeItem(POKEMON_FAVORITES_STORAGE_KEY);
        window.dispatchEvent(new Event("pokemon-favorites-updated"));

        setCollection((current) => {
          const byId = new Map(current.map((entry) => [entry.pokemonId, entry]));

          for (const favorite of localFavorites) {
            const existing = byId.get(favorite.id);
            byId.set(favorite.id, {
              pokemonId: favorite.id,
              pokemonSlug: favorite.name.toLowerCase().replace(/\s+/g, "-"),
              isFavorite: true,
              caughtInGame: existing?.caughtInGame ?? false,
              hasCard: existing?.hasCard ?? false,
            });
          }

          return [...byId.values()].sort((a, b) => a.pokemonId - b.pokemonId);
        });
      }
    });
  }, [isAuthenticated]);

  const updateEntry = useCallback((entry: PokemonCollectionEntry | null, pokemonId: number) => {
    setCollection((current) => {
      const next = entry
        ? [...current.filter((item) => item.pokemonId !== pokemonId), entry]
        : current.filter((item) => item.pokemonId !== pokemonId);

      return next.sort((a, b) => a.pokemonId - b.pokemonId);
    });
  }, []);

  const collectionMap = useMemo(() => entriesToMap(collection), [collection]);

  return { collection, collectionMap, updateEntry };
}
