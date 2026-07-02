"use client";

import { createContext, useContext, useEffect, useMemo, type ReactNode } from "react";

import { useAchievements } from "@/components/achievements/achievement-provider";
import { POKEDEX_COLLECTOR_TARGET } from "@/lib/achievements/definitions";
import { useAuthUser } from "@/lib/auth/use-auth-user";
import { countCollected, type PokemonCollectionEntry, type PokemonCollectionMap } from "@/lib/pokemon/collection";
import { usePokemonCollection } from "@/lib/pokemon/use-pokemon-collection";
import { usePokemonFavorites } from "@/lib/pokemon/use-pokemon-favorites";

type PokemonCollectionContextValue = {
  isAuthenticated: boolean;
  collection: PokemonCollectionEntry[];
  collectionMap: PokemonCollectionMap;
  updateEntry: (entry: PokemonCollectionEntry | null, pokemonId: number) => void;
};

const PokemonCollectionContext = createContext<PokemonCollectionContextValue | null>(null);

type PokemonCollectionProviderProps = {
  initialCollection: PokemonCollectionEntry[];
  children: ReactNode;
};

export function PokemonCollectionProvider({ initialCollection, children }: PokemonCollectionProviderProps) {
  const { isAuthenticated, isLoading } = useAuthUser();
  const { unlock } = useAchievements();
  const localFavorites = usePokemonFavorites();
  const { collection, collectionMap, updateEntry } = usePokemonCollection({
    initialCollection,
    isAuthenticated: !isLoading && isAuthenticated,
  });

  const collectedCount = !isLoading && isAuthenticated ? countCollected(collection) : localFavorites.length;

  useEffect(() => {
    if (collectedCount >= POKEDEX_COLLECTOR_TARGET) {
      unlock("pokedex-collector");
    }
  }, [collectedCount, unlock]);

  const value = useMemo(
    () => ({
      isAuthenticated: !isLoading && isAuthenticated,
      collection,
      collectionMap,
      updateEntry,
    }),
    [collection, collectionMap, isAuthenticated, isLoading, updateEntry],
  );

  return <PokemonCollectionContext.Provider value={value}>{children}</PokemonCollectionContext.Provider>;
}

export function usePokemonCollectionContext() {
  const context = useContext(PokemonCollectionContext);
  if (!context) {
    throw new Error("usePokemonCollectionContext must be used within PokemonCollectionProvider");
  }
  return context;
}
