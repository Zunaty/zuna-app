"use client";

import { useTransition } from "react";

import { updatePokemonCollection } from "@/app/explore/pokemon/actions";
import { useAuthUser } from "@/lib/auth/use-auth-user";
import type { PokemonCollectionEntry } from "@/lib/pokemon/collection";
import { POKEMON_FAVORITES_STORAGE_KEY } from "@/lib/pokemon/favorites";
import { usePokemonFavorites } from "@/lib/pokemon/use-pokemon-favorites";

export type CollectionToggleField = "isFavorite" | "caughtInGame" | "hasCard";

type UsePokemonCollectionToggleOptions = {
  pokemonId: number;
  pokemonSlug: string;
  entry: PokemonCollectionEntry | null;
  onUpdate?: (entry: PokemonCollectionEntry | null) => void;
};

export function usePokemonCollectionToggle({
  pokemonId,
  pokemonSlug,
  entry,
  onUpdate,
}: UsePokemonCollectionToggleOptions) {
  const { isAuthenticated, isLoading } = useAuthUser();
  const localFavorites = usePokemonFavorites();
  const [isPending, startTransition] = useTransition();

  const isLocalFavorite = localFavorites.some((favorite) => favorite.id === pokemonId);
  const isFavorite = isAuthenticated ? (entry?.isFavorite ?? false) : isLocalFavorite;
  const caughtInGame = entry?.caughtInGame ?? false;
  const hasCard = entry?.hasCard ?? false;

  function toggleLocalFavorite() {
    const exists = localFavorites.some((favorite) => favorite.id === pokemonId);
    const displayName = pokemonSlug
      .split("-")
      .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
      .join(" ");
    const next = exists
      ? localFavorites.filter((favorite) => favorite.id !== pokemonId)
      : [...localFavorites, { id: pokemonId, name: displayName }];

    localStorage.setItem(POKEMON_FAVORITES_STORAGE_KEY, JSON.stringify(next));
    window.dispatchEvent(new Event("pokemon-favorites-updated"));
  }

  function buildNextEntry(field: CollectionToggleField): PokemonCollectionEntry | null {
    const next: PokemonCollectionEntry = {
      pokemonId,
      pokemonSlug,
      isFavorite: field === "isFavorite" ? !isFavorite : isFavorite,
      caughtInGame: field === "caughtInGame" ? !caughtInGame : caughtInGame,
      hasCard: field === "hasCard" ? !hasCard : hasCard,
    };

    if (!next.isFavorite && !next.caughtInGame && !next.hasCard) {
      return null;
    }

    return next;
  }

  function toggleField(field: CollectionToggleField) {
    if (!isAuthenticated) {
      if (field === "isFavorite") {
        toggleLocalFavorite();
      }
      return;
    }

    const optimisticEntry = buildNextEntry(field);
    onUpdate?.(optimisticEntry);

    startTransition(async () => {
      const result = await updatePokemonCollection(pokemonId, pokemonSlug, {
        isFavorite: optimisticEntry?.isFavorite ?? false,
        caughtInGame: optimisticEntry?.caughtInGame ?? false,
        hasCard: optimisticEntry?.hasCard ?? false,
      });

      if (result.error) {
        onUpdate?.(entry);
      } else {
        onUpdate?.(result.entry);
      }
    });
  }

  return {
    isFavorite,
    caughtInGame,
    hasCard,
    isAuthenticated,
    isLoading,
    isPending,
    toggleField,
  };
}
