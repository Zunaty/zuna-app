"use client";

import { useCallback, useEffect, useRef, useState } from "react";

import { PokemonCard } from "@/components/explore/pokemon-card";
import { POKEMON_PAGE_SIZE } from "@/lib/pokemon/api";
import type { PokemonListItem, PokemonListResponse } from "@/lib/pokemon/types";

type PokemonInfiniteGridProps = {
  initialPokemon: PokemonListItem[];
  totalCount: number;
};

export function PokemonInfiniteGrid({ initialPokemon, totalCount }: PokemonInfiniteGridProps) {
  const [pokemon, setPokemon] = useState(initialPokemon);
  const [hasMore, setHasMore] = useState(initialPokemon.length < totalCount);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const offsetRef = useRef(initialPokemon.length);
  const loadingRef = useRef(false);
  const sentinelRef = useRef<HTMLDivElement>(null);

  const loadMore = useCallback(async () => {
    if (loadingRef.current || !hasMore) {
      return;
    }

    loadingRef.current = true;
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch(`/api/explore/pokemon?offset=${offsetRef.current}&limit=${POKEMON_PAGE_SIZE}`);

      if (!response.ok) {
        throw new Error("Failed to load more Pokémon.");
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
  }, [hasMore]);

  useEffect(() => {
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
  }, [loadMore]);

  return (
    <>
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6">
        {pokemon.map((entry) => (
          <PokemonCard key={entry.url} pokemon={entry} />
        ))}
      </div>

      <div ref={sentinelRef} className="mt-8 flex min-h-12 flex-col items-center justify-center gap-2">
        {error ? <p className="text-sm text-destructive">{error}</p> : null}
        {isLoading ? (
          <div className="flex items-center gap-2 text-sm text-muted-foreground" aria-live="polite">
            <span className="size-4 animate-spin rounded-full border-2 border-muted-foreground/30 border-t-muted-foreground" />
            Loading more…
          </div>
        ) : null}
        {!hasMore ? (
          <p className="text-sm text-muted-foreground">All {totalCount.toLocaleString()} Pokémon loaded.</p>
        ) : null}
      </div>
    </>
  );
}
