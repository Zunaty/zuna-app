"use client";

import Image from "next/image";
import Link from "next/link";

import { PokemonCardToggles } from "@/components/explore/pokemon-card-toggles";
import { usePokemonCollectionContext } from "@/components/explore/pokemon-collection-provider";
import { formatPokemonName, getPokemonArtworkUrl, getPokemonIdFromUrl } from "@/lib/pokemon/api";
import { usePokemonCollectionToggle } from "@/lib/pokemon/use-pokemon-collection-toggle";
import { usePokemonFavorites } from "@/lib/pokemon/use-pokemon-favorites";
import type { PokemonListItem } from "@/lib/pokemon/types";

type PokemonCardProps = {
  pokemon: PokemonListItem;
};

export function PokemonCard({ pokemon }: PokemonCardProps) {
  const id = getPokemonIdFromUrl(pokemon.url);
  const name = formatPokemonName(pokemon.name);
  const slug = pokemon.name;

  const { collectionMap, updateEntry, isAuthenticated } = usePokemonCollectionContext();
  const localFavorites = usePokemonFavorites();

  const entry = collectionMap.get(id) ?? null;
  const displayEntry =
    entry ??
    (!isAuthenticated && localFavorites.some((favorite) => favorite.id === id)
      ? { pokemonId: id, pokemonSlug: slug, isFavorite: true, caughtInGame: false, hasCard: false }
      : null);

  const { isFavorite, caughtInGame, hasCard, isPending, toggleField } = usePokemonCollectionToggle({
    pokemonId: id,
    pokemonSlug: slug,
    entry: displayEntry,
    onUpdate: (next) => updateEntry(next, id),
  });

  return (
    <article className="group relative rounded-xl border border-border bg-card shadow-sm transition-colors hover:border-primary/30">
      <PokemonCardToggles
        isFavorite={isFavorite}
        caughtInGame={caughtInGame}
        hasCard={hasCard}
        isAuthenticated={isAuthenticated}
        isPending={isPending}
        onToggle={toggleField}
        loginHref={`/auth/login?next=/explore/pokemon`}
      />

      <Link href={`/explore/pokemon/${id}`} className="flex flex-col items-center p-4">
        <div className="relative size-28">
          <Image
            src={getPokemonArtworkUrl(id)}
            alt=""
            fill
            sizes="112px"
            className="object-contain transition-transform group-hover:scale-105"
          />
        </div>
        <p className="mt-3 text-sm font-medium capitalize">{name}</p>
        <p className="text-xs text-muted-foreground">#{String(id).padStart(3, "0")}</p>
      </Link>
    </article>
  );
}
