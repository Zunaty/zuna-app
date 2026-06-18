import Image from "next/image";
import Link from "next/link";

import { formatPokemonName, getPokemonArtworkUrl, getPokemonIdFromUrl } from "@/lib/pokemon/api";
import type { PokemonListItem } from "@/lib/pokemon/types";

type PokemonCardProps = {
  pokemon: PokemonListItem;
};

export function PokemonCard({ pokemon }: PokemonCardProps) {
  const id = getPokemonIdFromUrl(pokemon.url);
  const name = formatPokemonName(pokemon.name);

  return (
    <Link
      href={`/explore/pokemon/${id}`}
      className="group flex flex-col items-center rounded-xl border border-border bg-card p-4 shadow-sm transition-colors hover:border-primary/30"
    >
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
  );
}
