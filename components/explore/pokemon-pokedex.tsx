"use client";

import { useState } from "react";

import {
  PokemonCollectionProvider,
  usePokemonCollectionContext,
} from "@/components/explore/pokemon-collection-provider";
import { PokemonFilteredGrid } from "@/components/explore/pokemon-filtered-grid";
import { PokemonSearchFilters, usePokedexFilters } from "@/components/explore/pokemon-search-filters";
import { PokemonViewToggle } from "@/components/explore/pokemon-view-toggle";
import { countCollected } from "@/lib/pokemon/collection";
import type { PokedexView } from "@/lib/pokemon/constants";
import type { PokemonCollectionEntry } from "@/lib/pokemon/collection";
import { usePokemonFavorites } from "@/lib/pokemon/use-pokemon-favorites";
import type { PokemonListItem } from "@/lib/pokemon/types";

type PokemonPokedexProps = {
  initialPokemon: PokemonListItem[];
  totalCount: number;
  initialCollection: PokemonCollectionEntry[];
};

export function PokemonPokedex({ initialPokemon, totalCount, initialCollection }: PokemonPokedexProps) {
  return (
    <PokemonCollectionProvider initialCollection={initialCollection}>
      <PokemonPokedexContent initialPokemon={initialPokemon} totalCount={totalCount} />
    </PokemonCollectionProvider>
  );
}

function PokemonPokedexContent({
  initialPokemon,
  totalCount,
}: {
  initialPokemon: PokemonListItem[];
  totalCount: number;
}) {
  const [view, setView] = useState<PokedexView>("browse");
  const { filters, setFilters, debouncedSearch, resetKey, resetFilters } = usePokedexFilters();
  const { collection, isAuthenticated } = usePokemonCollectionContext();
  const localFavorites = usePokemonFavorites();

  const collectionCount = isAuthenticated ? countCollected(collection) : localFavorites.length;

  function handleViewChange(next: PokedexView) {
    setView(next);
    resetFilters();
  }

  return (
    <>
      <div className="mb-6">
        <PokemonViewToggle view={view} collectionCount={collectionCount} onChange={handleViewChange} />
      </div>

      <div className="mb-6">
        <PokemonSearchFilters view={view} filters={filters} onChange={setFilters} />
      </div>

      <PokemonFilteredGrid
        view={view}
        initialPokemon={initialPokemon}
        totalCount={totalCount}
        filters={filters}
        debouncedSearch={debouncedSearch}
        resetKey={`${view}|${resetKey()}`}
      />
    </>
  );
}
