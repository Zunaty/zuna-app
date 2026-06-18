import type { Metadata } from "next";

import { PokemonPokedex } from "@/components/explore/pokemon-pokedex";
import { PageEnter } from "@/components/motion/page-enter";
import { PageShell } from "@/components/layout/page-shell";
import { fetchPokemonList } from "@/lib/pokemon/api";
import { getUserPokemonCollection } from "@/lib/pokemon/server-collection";
import { site } from "@/lib/data/site";

export const metadata: Metadata = {
  title: "Pokédex",
  description: `Browse Pokémon from PokéAPI on ${site.name}'s portfolio.`,
};

export default async function PokemonListPage() {
  const [data, { collection }] = await Promise.all([fetchPokemonList(0), getUserPokemonCollection()]);

  const favoriteCount = collection.filter((entry) => entry.isFavorite).length;
  const caughtCount = collection.filter((entry) => entry.caughtInGame).length;
  const cardCount = collection.filter((entry) => entry.hasCard).length;
  const hasCollection = favoriteCount > 0 || caughtCount > 0 || cardCount > 0;

  const description = hasCollection
    ? `${data.count.toLocaleString()} species from PokéAPI. Search, filter by type, and track your collection (${favoriteCount} favorites, ${caughtCount} caught, ${cardCount} cards).`
    : `${data.count.toLocaleString()} species from PokéAPI. Search and filter by type — sign in to track favorites, in-game catches, and TCG cards.`;

  return (
    <PageShell>
      <PageEnter header={{ eyebrow: "Explore · PokéAPI", title: "Pokédex", description }}>
        <PokemonPokedex initialPokemon={data.results} totalCount={data.count} initialCollection={collection} />
      </PageEnter>
    </PageShell>
  );
}
