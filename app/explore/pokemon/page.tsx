import type { Metadata } from "next";
import { Suspense } from "react";

import { PokemonFavoritesSection } from "@/components/explore/pokemon-favorites-section";
import { PokemonInfiniteGrid } from "@/components/explore/pokemon-infinite-grid";
import { PageHeader, PageShell } from "@/components/layout/page-shell";
import { fetchPokemonList } from "@/lib/pokemon/api";
import { site } from "@/lib/data/site";

export const metadata: Metadata = {
  title: "Pokédex",
  description: `Browse Pokémon from PokéAPI on ${site.name}'s portfolio.`,
};

export default async function PokemonListPage() {
  const data = await fetchPokemonList(0);

  return (
    <PageShell>
      <PageHeader
        eyebrow="Explore · PokéAPI"
        title="Pokédex"
        description={`${data.count.toLocaleString()} species from the public PokéAPI. Scroll to load more — favorites are saved in your browser for now.`}
      />

      <section className="mb-12">
        <h2 className="mb-4 text-lg font-semibold">Your favorites</h2>
        <Suspense fallback={<div className="h-24 animate-pulse rounded-xl bg-muted" aria-hidden />}>
          <PokemonFavoritesSection />
        </Suspense>
      </section>

      <section>
        <h2 className="mb-4 text-lg font-semibold">All Pokémon</h2>
        <PokemonInfiniteGrid initialPokemon={data.results} totalCount={data.count} />
      </section>
    </PageShell>
  );
}
