"use client";

import Image from "next/image";
import Link from "next/link";

import { getPokemonArtworkUrl } from "@/lib/pokemon/api";
import { usePokemonFavorites } from "@/lib/pokemon/use-pokemon-favorites";

export function PokemonFavoritesSection() {
  const favorites = usePokemonFavorites();

  if (favorites.length === 0) {
    return (
      <p className="rounded-xl border border-dashed border-border bg-muted/30 px-4 py-6 text-sm text-muted-foreground">
        No favorites yet. Open a Pokémon and tap Favorite — saved in this browser for now.
      </p>
    );
  }

  return (
    <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6">
      {favorites.map((favorite) => (
        <Link
          key={favorite.id}
          href={`/explore/pokemon/${favorite.id}`}
          className="group flex flex-col items-center rounded-xl border border-border bg-card p-4 shadow-sm transition-colors hover:border-primary/30"
        >
          <div className="relative size-28">
            <Image
              src={getPokemonArtworkUrl(favorite.id)}
              alt=""
              fill
              sizes="112px"
              className="object-contain transition-transform group-hover:scale-105"
            />
          </div>
          <p className="mt-3 text-sm font-medium">{favorite.name}</p>
          <p className="text-xs text-muted-foreground">#{String(favorite.id).padStart(3, "0")}</p>
        </Link>
      ))}
    </div>
  );
}
