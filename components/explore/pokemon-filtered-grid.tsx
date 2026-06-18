"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";

import { PokemonCard } from "@/components/explore/pokemon-card";
import { usePokemonCollectionContext } from "@/components/explore/pokemon-collection-provider";
import { StaggerChildren, StaggerItem } from "@/components/motion/stagger-children";
import type { PokedexFilters } from "@/components/explore/pokemon-search-filters";
import { countCollected, filterCollection, filterPokemonByName } from "@/lib/pokemon/collection";
import { POKEMON_PAGE_SIZE } from "@/lib/pokemon/api";
import type { PokedexView } from "@/lib/pokemon/constants";
import { usePokemonFavorites } from "@/lib/pokemon/use-pokemon-favorites";
import type { PokemonListItem, PokemonListResponse } from "@/lib/pokemon/types";

type PokemonFilteredGridProps = {
  view: PokedexView;
  initialPokemon: PokemonListItem[];
  totalCount: number;
  filters: PokedexFilters;
  debouncedSearch: string;
  resetKey: string;
};

type BrowseGridMode = "all" | "type" | "search";

function getBrowseGridMode(filters: PokedexFilters, debouncedSearch: string): BrowseGridMode {
  if (debouncedSearch.trim()) {
    return "search";
  }
  if (filters.type) {
    return "type";
  }
  return "all";
}

export function PokemonFilteredGrid({
  view,
  initialPokemon,
  totalCount,
  filters,
  debouncedSearch,
  resetKey,
}: PokemonFilteredGridProps) {
  const { collection, isAuthenticated } = usePokemonCollectionContext();
  const localFavorites = usePokemonFavorites();
  const browseMode = getBrowseGridMode(filters, debouncedSearch);

  const [pokemon, setPokemon] = useState(initialPokemon);
  const [hasMore, setHasMore] = useState(initialPokemon.length < totalCount);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [displayCount, setDisplayCount] = useState(totalCount);

  const offsetRef = useRef(initialPokemon.length);
  const loadingRef = useRef(false);
  const sentinelRef = useRef<HTMLDivElement>(null);

  const totalCollected = isAuthenticated ? countCollected(collection) : localFavorites.length;

  const collectionItems = useMemo(() => {
    if (!isAuthenticated) {
      const entries = localFavorites.map((favorite) => ({
        pokemonId: favorite.id,
        pokemonSlug: favorite.name.toLowerCase().replace(/\s+/g, "-"),
        isFavorite: true,
        caughtInGame: false,
        hasCard: false,
      }));

      if (filters.collection === "caught" || filters.collection === "card") {
        return [];
      }

      return filterCollection(entries, filters.collection);
    }

    return filterCollection(collection, filters.collection);
  }, [collection, filters.collection, isAuthenticated, localFavorites]);

  const collectionResults = useMemo(
    () => filterPokemonByName(collectionItems, debouncedSearch),
    [collectionItems, debouncedSearch],
  );

  useEffect(() => {
    if (view === "collection") {
      return;
    }

    let cancelled = false;

    async function loadBrowseResults() {
      setError(null);
      setIsLoading(true);
      loadingRef.current = true;
      offsetRef.current = 0;

      try {
        if (browseMode === "search") {
          const response = await fetch(`/api/explore/pokemon/search?q=${encodeURIComponent(debouncedSearch.trim())}`);
          if (!response.ok) {
            throw new Error("Search failed");
          }
          const data = (await response.json()) as { results: PokemonListItem[]; count: number };
          if (!cancelled) {
            setPokemon(data.results);
            setDisplayCount(data.count);
            setHasMore(false);
          }
          return;
        }

        if (browseMode === "type") {
          const response = await fetch(
            `/api/explore/pokemon/by-type?type=${encodeURIComponent(filters.type)}&offset=0&limit=${POKEMON_PAGE_SIZE}`,
          );
          if (!response.ok) {
            throw new Error("Type filter failed");
          }
          const data = (await response.json()) as PokemonListResponse;
          if (!cancelled) {
            offsetRef.current = data.results.length;
            setPokemon(data.results);
            setDisplayCount(data.count);
            setHasMore(offsetRef.current < data.count);
          }
          return;
        }

        if (!cancelled) {
          setPokemon(initialPokemon);
          offsetRef.current = initialPokemon.length;
          setDisplayCount(totalCount);
          setHasMore(initialPokemon.length < totalCount);
        }
      } catch {
        if (!cancelled) {
          setError("Could not load Pokémon. Try adjusting your filters.");
          setPokemon([]);
          setHasMore(false);
        }
      } finally {
        if (!cancelled) {
          loadingRef.current = false;
          setIsLoading(false);
        }
      }
    }

    void loadBrowseResults();

    return () => {
      cancelled = true;
    };
  }, [browseMode, debouncedSearch, filters.type, initialPokemon, resetKey, totalCount, view]);

  const loadMore = useCallback(async () => {
    if (view === "collection" || loadingRef.current || !hasMore || browseMode === "search") {
      return;
    }

    loadingRef.current = true;
    setIsLoading(true);
    setError(null);

    try {
      const url =
        browseMode === "type"
          ? `/api/explore/pokemon/by-type?type=${encodeURIComponent(filters.type)}&offset=${offsetRef.current}&limit=${POKEMON_PAGE_SIZE}`
          : `/api/explore/pokemon?offset=${offsetRef.current}&limit=${POKEMON_PAGE_SIZE}`;

      const response = await fetch(url);
      if (!response.ok) {
        throw new Error("Failed to load more");
      }

      const data = (await response.json()) as PokemonListResponse;
      offsetRef.current += data.results.length;
      setPokemon((current) => [...current, ...data.results]);
      setHasMore(offsetRef.current < data.count);
    } catch {
      setError("Could not load more Pokémon. Scroll again to retry.");
    } finally {
      loadingRef.current = false;
      setIsLoading(false);
    }
  }, [browseMode, filters.type, hasMore, view]);

  useEffect(() => {
    if (view === "collection" || browseMode === "search") {
      return;
    }

    const sentinel = sentinelRef.current;
    if (!sentinel) {
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting) {
          void loadMore();
        }
      },
      { rootMargin: "240px" },
    );

    observer.observe(sentinel);
    return () => observer.disconnect();
  }, [browseMode, loadMore, view]);

  const displayedPokemon = view === "collection" ? collectionResults : pokemon;

  const statusText =
    view === "collection"
      ? getCollectionStatusText({
          shown: displayedPokemon.length,
          totalCollected,
          totalSpecies: totalCount,
          hasSearch: debouncedSearch.trim().length > 0,
          hasSubFilter: filters.collection !== "all",
        })
      : isLoading && displayedPokemon.length === 0
        ? "Loading…"
        : `${displayedPokemon.length.toLocaleString()} of ${displayCount.toLocaleString()} shown`;

  const emptyMessage =
    view === "collection"
      ? totalCollected === 0
        ? isAuthenticated
          ? "Your collection is empty. Browse Pokémon and mark favorites, in-game catches, or TCG cards."
          : "No favorites yet. Browse Pokémon and tap the heart — sign in to also track catches and cards."
        : "No Pokémon match your filters."
      : "No Pokémon match your filters.";

  const staggerKey = `${view}-${resetKey}-${debouncedSearch}-${filters.type}-${filters.collection}`;

  return (
    <>
      <p className="mb-4 text-sm text-muted-foreground">{statusText}</p>

      {displayedPokemon.length === 0 && !isLoading ? (
        <p className="rounded-xl border border-dashed border-border bg-muted/30 px-4 py-8 text-center text-sm text-muted-foreground">
          {emptyMessage}
        </p>
      ) : (
        <StaggerChildren
          className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6"
          staggerKey={staggerKey}
        >
          {displayedPokemon.map((entry) => (
            <StaggerItem key={entry.url}>
              <PokemonCard pokemon={entry} />
            </StaggerItem>
          ))}
        </StaggerChildren>
      )}

      <div ref={sentinelRef} className="mt-8 flex min-h-12 flex-col items-center justify-center gap-2">
        {error ? <p className="text-sm text-destructive">{error}</p> : null}
        {isLoading ? (
          <div className="flex items-center gap-2 text-sm text-muted-foreground" aria-live="polite">
            <span className="size-4 animate-spin rounded-full border-2 border-muted-foreground/30 border-t-muted-foreground" />
            Loading…
          </div>
        ) : null}
        {view === "browse" && !hasMore && displayedPokemon.length > 0 && browseMode === "all" ? (
          <p className="text-sm text-muted-foreground">All {displayCount.toLocaleString()} Pokémon loaded.</p>
        ) : null}
      </div>
    </>
  );
}

function getCollectionStatusText({
  shown,
  totalCollected,
  totalSpecies,
  hasSearch,
  hasSubFilter,
}: {
  shown: number;
  totalCollected: number;
  totalSpecies: number;
  hasSearch: boolean;
  hasSubFilter: boolean;
}) {
  const collectedLabel = `${totalCollected.toLocaleString()} of ${totalSpecies.toLocaleString()} collected`;

  if (hasSearch || hasSubFilter) {
    return `${shown.toLocaleString()} shown · ${collectedLabel}`;
  }

  return collectedLabel;
}
