import { ArrowRight } from "lucide-react";
import Link from "next/link";

import { SectionHeadingMotion } from "@/components/motion/section-heading-motion";
import { StaggerChildren, StaggerItem } from "@/components/motion/stagger-children";
import { PlaygroundGameCard } from "@/components/playground/playground-game-card";
import { SkillsGrid } from "@/components/portfolio/skills-grid";
import { Button } from "@/components/ui/button";
import { getFeaturedPlaygroundGames } from "@/lib/data/playground-games";
import { getFeaturedProjects } from "@/lib/data/projects";

import { HomeHeroMotion } from "./home-hero-motion";
import { ProjectCard } from "./project-card";

export function HomeHero() {
  return <HomeHeroMotion />;
}

export function FeaturedProjects() {
  const featured = getFeaturedProjects();

  return (
    <section>
      <SectionHeadingMotion
        title="Selected work"
        description="Recent product work at Koggin Labs and Black Swan Research — plus earlier client marketing sites. Repos stay private; this is the craft in the open."
      />
      <StaggerChildren className="grid gap-6 lg:grid-cols-2" staggerKey="featured-projects">
        {featured.map((project) => (
          <StaggerItem key={project.slug}>
            <ProjectCard project={project} showAllProjectsLink />
          </StaggerItem>
        ))}
      </StaggerChildren>
    </section>
  );
}

export function FeaturedPlayground() {
  const featured = getFeaturedPlaygroundGames();

  return (
    <section>
      <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <SectionHeadingMotion
          title="Playground"
          description="A few games to try right now — more experiments live on the Playground page."
          className="mb-0 max-w-2xl"
        />
        <Button variant="outline" asChild>
          <Link href="/playground">
            See all games
            <ArrowRight className="size-4" />
          </Link>
        </Button>
      </div>
      <StaggerChildren className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3" staggerKey="featured-playground">
        {featured.map((game) => (
          <StaggerItem key={game.id}>
            <PlaygroundGameCard
              title={game.title}
              description={game.description}
              href={game.href}
              status={game.status}
              eyebrow={game.eyebrow}
              ctaLabel={game.ctaLabel}
            />
          </StaggerItem>
        ))}
      </StaggerChildren>
    </section>
  );
}

export function HomeSkills() {
  return (
    <section>
      <SectionHeadingMotion title="Skills" />
      <SkillsGrid staggerKey="home-skills" />
    </section>
  );
}

export function ZoneHighlights() {
  return (
    <section>
      <SectionHeadingMotion
        title="Explore"
        description="Pokédex, geocoding, and more API-driven demos you can poke at."
      />
      <div className="max-w-lg rounded-xl border border-border bg-card p-6 shadow-sm">
        <p className="text-xs font-medium uppercase tracking-wider text-primary">Live now</p>
        <h3 className="mt-2 font-semibold">API playgrounds</h3>
        <p className="mt-1 text-sm text-muted-foreground">
          Live data from public APIs — a small taste of how I wire external services into polished UI.
        </p>
        <Button variant="outline" size="sm" className="mt-4" asChild>
          <Link href="/explore">
            Browse Explore
            <ArrowRight className="size-4" />
          </Link>
        </Button>
      </div>
    </section>
  );
}
