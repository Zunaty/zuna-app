"use client";

import { createContext, useContext, useMemo, type ReactNode } from "react";

import { useAuthUser } from "@/lib/auth/use-auth-user";
import type { PokemonCollectionEntry, PokemonCollectionMap } from "@/lib/pokemon/collection";
import { usePokemonCollection } from "@/lib/pokemon/use-pokemon-collection";

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
  const { collection, collectionMap, updateEntry } = usePokemonCollection({
    initialCollection,
    isAuthenticated: !isLoading && isAuthenticated,
  });

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
