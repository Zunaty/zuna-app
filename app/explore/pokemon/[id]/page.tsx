import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";

import { PokemonDetailCollection } from "@/components/explore/pokemon-detail-collection";
import { PokemonDetailLayout } from "@/components/explore/pokemon-detail-layout";
import { PageShell } from "@/components/layout/page-shell";
import { Button } from "@/components/ui/button";
import { fetchPokemon, formatPokemonName, getPokemonSprite } from "@/lib/pokemon/api";
import { getUserPokemonCollection } from "@/lib/pokemon/server-collection";
import { site } from "@/lib/data/site";

type PokemonDetailPageProps = {
  params: Promise<{ id: string }>;
};

export async function generateMetadata({ params }: PokemonDetailPageProps): Promise<Metadata> {
  const { id } = await params;
  const pokemon = await fetchPokemon(id);

  if (!pokemon) {
    return { title: "Pokémon not found" };
  }

  const name = formatPokemonName(pokemon.name);

  return {
    title: name,
    description: `Stats, types, and abilities for ${name} — Pokédex on ${site.name}'s portfolio.`,
  };
}

export default async function PokemonDetailPage({ params }: PokemonDetailPageProps) {
  const { id } = await params;
  const [pokemon, { collection }] = await Promise.all([fetchPokemon(id), getUserPokemonCollection()]);

  if (!pokemon) {
    notFound();
  }

  const name = formatPokemonName(pokemon.name);
  const sprite = getPokemonSprite(pokemon);
  const collectionEntry = collection.find((entry) => entry.pokemonId === pokemon.id) ?? null;

  return (
    <PageShell>
      <PokemonDetailLayout
        pokemonId={pokemon.id}
        backLink={
          <Button variant="ghost" size="sm" asChild>
            <Link href="/explore/pokemon">← Back to Pokédex</Link>
          </Button>
        }
        aside={
          <div className="flex flex-col items-center rounded-2xl border border-border bg-card p-8">
            {sprite ? (
              <div className="relative size-56">
                <Image src={sprite} alt="" fill sizes="224px" className="object-contain" priority />
              </div>
            ) : null}
            <p className="mt-4 text-sm text-muted-foreground">#{String(pokemon.id).padStart(3, "0")}</p>
            <h1 className="mt-1 text-3xl font-bold capitalize">{name}</h1>
            <div className="mt-4 w-full">
              <PokemonDetailCollection
                pokemonId={pokemon.id}
                pokemonSlug={pokemon.name}
                initialEntry={collectionEntry}
              />
            </div>
          </div>
        }
        main={
          <div className="space-y-8">
            <section>
              <h2 className="mb-3 text-lg font-semibold">Types</h2>
              <div className="flex flex-wrap gap-2">
                {pokemon.types.map(({ type }) => (
                  <span
                    key={type.name}
                    className="rounded-full bg-primary/10 px-3 py-1 text-sm font-medium capitalize text-primary"
                  >
                    {type.name}
                  </span>
                ))}
              </div>
            </section>

            <section>
              <h2 className="mb-3 text-lg font-semibold">Stats</h2>
              <dl className="grid gap-3 sm:grid-cols-2">
                <Stat label="Height" value={`${(pokemon.height / 10).toFixed(1)} m`} />
                <Stat label="Weight" value={`${(pokemon.weight / 10).toFixed(1)} kg`} />
                {pokemon.stats.map(({ stat, base_stat }) => (
                  <Stat key={stat.name} label={formatPokemonName(stat.name)} value={String(base_stat)} />
                ))}
              </dl>
            </section>

            <section>
              <h2 className="mb-3 text-lg font-semibold">Abilities</h2>
              <ul className="space-y-2">
                {pokemon.abilities.map(({ ability, is_hidden }) => (
                  <li key={ability.name} className="flex items-center gap-2 text-sm">
                    <span className="font-medium capitalize">{formatPokemonName(ability.name)}</span>
                    {is_hidden ? (
                      <span className="rounded-full bg-muted px-2 py-0.5 text-xs text-muted-foreground">Hidden</span>
                    ) : null}
                  </li>
                ))}
              </ul>
            </section>
          </div>
        }
      />
    </PageShell>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg border border-border bg-card px-4 py-3">
      <dt className="text-xs font-medium uppercase tracking-wide text-muted-foreground">{label}</dt>
      <dd className="mt-1 text-lg font-semibold">{value}</dd>
    </div>
  );
}
