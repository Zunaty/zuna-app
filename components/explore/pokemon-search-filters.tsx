"use client";

import { Search, X } from "lucide-react";
import Link from "next/link";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { formatPokemonName } from "@/lib/pokemon/api";
import type { CollectionFilter, PokedexView } from "@/lib/pokemon/constants";
import { POKEMON_TYPES } from "@/lib/pokemon/constants";
import { countCollected } from "@/lib/pokemon/collection";
import { usePokemonFavorites } from "@/lib/pokemon/use-pokemon-favorites";
import { cn } from "@/lib/utils";

import { usePokemonCollectionContext } from "./pokemon-collection-provider";

export type PokedexFilters = {
  search: string;
  type: string;
  collection: CollectionFilter;
};

type PokemonSearchFiltersProps = {
  view: PokedexView;
  filters: PokedexFilters;
  onChange: (filters: PokedexFilters) => void;
};

export function PokemonSearchFilters({ view, filters, onChange }: PokemonSearchFiltersProps) {
  const { isAuthenticated, collection } = usePokemonCollectionContext();
  const localFavorites = usePokemonFavorites();

  const totalCollected = isAuthenticated ? countCollected(collection) : localFavorites.length;
  const favoriteCount = isAuthenticated ? collection.filter((entry) => entry.isFavorite).length : localFavorites.length;
  const caughtCount = collection.filter((entry) => entry.caughtInGame).length;
  const cardCount = collection.filter((entry) => entry.hasCard).length;

  const hasActiveFilters =
    view === "browse"
      ? filters.search.length > 0 || filters.type.length > 0
      : filters.search.length > 0 || filters.collection !== "all";

  function clearFilters() {
    onChange({ search: "", type: "", collection: "all" });
  }

  return (
    <div className="space-y-4 rounded-xl border border-border bg-card p-4 shadow-sm">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-end">
        <div className="flex-1 space-y-2">
          <Label htmlFor="pokemon-search">{view === "browse" ? "Search by name" : "Search your collection"}</Label>
          <div className="relative">
            <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              id="pokemon-search"
              type="search"
              placeholder={view === "browse" ? "e.g. charizard, pika…" : "Filter by name…"}
              value={filters.search}
              onChange={(event) => onChange({ ...filters, search: event.target.value })}
              className="pl-9"
            />
          </div>
        </div>

        {view === "browse" ? (
          <div className="w-full space-y-2 lg:w-48">
            <Label htmlFor="pokemon-type">Type</Label>
            <select
              id="pokemon-type"
              value={filters.type}
              onChange={(event) => onChange({ ...filters, type: event.target.value })}
              className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
            >
              <option value="">All types</option>
              {POKEMON_TYPES.map((type) => (
                <option key={type} value={type}>
                  {formatPokemonName(type)}
                </option>
              ))}
            </select>
          </div>
        ) : null}
      </div>

      {view === "collection" ? (
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex flex-wrap gap-2">
            <FilterChip
              active={filters.collection === "all"}
              onClick={() => onChange({ ...filters, collection: "all" })}
            >
              All ({totalCollected})
            </FilterChip>
            <FilterChip
              active={filters.collection === "favorite"}
              onClick={() => onChange({ ...filters, collection: "favorite" })}
              disabled={favoriteCount === 0}
            >
              Favorites ({favoriteCount})
            </FilterChip>
            <FilterChip
              active={filters.collection === "caught"}
              onClick={() => onChange({ ...filters, collection: "caught" })}
              disabled={!isAuthenticated || caughtCount === 0}
              title={!isAuthenticated ? "Sign in to track in-game catches" : undefined}
            >
              Caught ({caughtCount})
            </FilterChip>
            <FilterChip
              active={filters.collection === "card"}
              onClick={() => onChange({ ...filters, collection: "card" })}
              disabled={!isAuthenticated || cardCount === 0}
              title={!isAuthenticated ? "Sign in to track TCG cards" : undefined}
            >
              Cards ({cardCount})
            </FilterChip>
          </div>

          {hasActiveFilters ? (
            <button
              type="button"
              onClick={clearFilters}
              className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
            >
              <X className="size-4" />
              Clear filters
            </button>
          ) : null}
        </div>
      ) : hasActiveFilters ? (
        <div className="flex justify-end">
          <button
            type="button"
            onClick={clearFilters}
            className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
          >
            <X className="size-4" />
            Clear filters
          </button>
        </div>
      ) : null}

      {!isAuthenticated ? (
        <p className="text-sm text-muted-foreground">
          <Link href="/auth/login?next=/explore/pokemon" className="underline underline-offset-2">
            Sign in
          </Link>{" "}
          to track in-game catches and TCG cards across devices.
        </p>
      ) : null}
    </div>
  );
}

function FilterChip({
  children,
  active,
  onClick,
  disabled,
  title,
}: {
  children: React.ReactNode;
  active: boolean;
  onClick: () => void;
  disabled?: boolean;
  title?: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      title={title}
      className={cn(
        "rounded-full border px-3 py-1 text-sm transition-colors",
        active
          ? "border-primary bg-primary/10 font-medium text-primary"
          : "border-border text-muted-foreground hover:border-primary/30 hover:text-foreground",
        disabled && "cursor-not-allowed opacity-50",
      )}
    >
      {children}
    </button>
  );
}

export { useDebouncedValue, usePokedexFilters } from "./pokemon-pokedex-filters";
