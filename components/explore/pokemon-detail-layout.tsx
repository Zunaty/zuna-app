"use client";

import { PageContentMotion } from "@/components/motion/page-content-motion";
import { StaggerChildren, StaggerItem } from "@/components/motion/stagger-children";

type PokemonDetailLayoutProps = {
  pokemonId: number;
  backLink: React.ReactNode;
  aside: React.ReactNode;
  main: React.ReactNode;
};

export function PokemonDetailLayout({ pokemonId, backLink, aside, main }: PokemonDetailLayoutProps) {
  return (
    <PageContentMotion>
      <div className="mb-8">{backLink}</div>
      <StaggerChildren
        className="grid gap-10 lg:grid-cols-[minmax(0,20rem)_1fr] lg:items-start"
        staggerKey={`pokemon-detail-${pokemonId}`}
      >
        <StaggerItem>{aside}</StaggerItem>
        <StaggerItem>{main}</StaggerItem>
      </StaggerChildren>
    </PageContentMotion>
  );
}
