"use client";

import { Heart } from "lucide-react";

import { Button } from "@/components/ui/button";
import { POKEMON_FAVORITES_STORAGE_KEY } from "@/lib/pokemon/favorites";
import { usePokemonFavorites } from "@/lib/pokemon/use-pokemon-favorites";
import { cn } from "@/lib/utils";

type PokemonFavoriteButtonProps = {
  pokemonId: number;
  pokemonName: string;
};

export function PokemonFavoriteButton({ pokemonId, pokemonName }: PokemonFavoriteButtonProps) {
  const favorites = usePokemonFavorites();
  const isFavorite = favorites.some((favorite) => favorite.id === pokemonId);

  function toggleFavorite() {
    const exists = favorites.some((favorite) => favorite.id === pokemonId);
    const next = exists
      ? favorites.filter((favorite) => favorite.id !== pokemonId)
      : [...favorites, { id: pokemonId, name: pokemonName }];

    localStorage.setItem(POKEMON_FAVORITES_STORAGE_KEY, JSON.stringify(next));
    window.dispatchEvent(new Event("pokemon-favorites-updated"));
  }

  return (
    <Button
      type="button"
      variant={isFavorite ? "default" : "outline"}
      size="sm"
      onClick={toggleFavorite}
      aria-pressed={isFavorite}
      aria-label={isFavorite ? `Remove ${pokemonName} from favorites` : `Add ${pokemonName} to favorites`}
    >
      <Heart className={cn("size-4", isFavorite && "fill-current")} />
      {isFavorite ? "Favorited" : "Favorite"}
    </Button>
  );
}
