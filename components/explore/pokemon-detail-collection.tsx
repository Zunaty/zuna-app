"use client";

import { useState } from "react";

import { PokemonCollectionControls } from "@/components/explore/pokemon-collection-controls";
import type { PokemonCollectionEntry } from "@/lib/pokemon/collection";

type PokemonDetailCollectionProps = {
  pokemonId: number;
  pokemonSlug: string;
  initialEntry: PokemonCollectionEntry | null;
};

export function PokemonDetailCollection({ pokemonId, pokemonSlug, initialEntry }: PokemonDetailCollectionProps) {
  const [entry, setEntry] = useState(initialEntry);

  return (
    <PokemonCollectionControls
      pokemonId={pokemonId}
      pokemonSlug={pokemonSlug}
      initialEntry={entry}
      onUpdate={setEntry}
    />
  );
}
