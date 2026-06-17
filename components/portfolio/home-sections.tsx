import Link from "next/link";

import { SectionHeading } from "@/components/portfolio/section-heading";
import { SkillsGrid } from "@/components/portfolio/skills-grid";
import { Button } from "@/components/ui/button";
import { getFeaturedProjects } from "@/lib/data/projects";
import { site } from "@/lib/data/site";

import { ProjectCard } from "./project-card";

export function HomeHero() {
  return (
    <section className="relative overflow-hidden rounded-2xl border border-border bg-card px-6 py-14 sm:px-10 sm:py-20">
      <div
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-primary/15 via-transparent to-transparent"
        aria-hidden
      />
      <div className="relative max-w-3xl">
        <p className="text-sm font-medium uppercase tracking-widest text-primary">Portfolio & playground</p>
        <h1 className="mt-3 text-4xl font-bold tracking-tight sm:text-5xl lg:text-6xl">
          Hi, I&apos;m {site.name.split(" ")[0]}.{" "}
          <span className="text-muted-foreground">I build web products people enjoy using.</span>
        </h1>
        <p className="mt-6 text-lg text-muted-foreground">{site.tagline}</p>
        <div className="mt-8 flex flex-wrap gap-3">
          <Button size="lg" asChild>
            <Link href="/projects">View projects</Link>
          </Button>
          <Button variant="outline" size="lg" asChild>
            <Link href="/contact">Get in touch</Link>
          </Button>
        </div>
      </div>
    </section>
  );
}

export function FeaturedProjects() {
  const featured = getFeaturedProjects();

  return (
    <section>
      <SectionHeading
        title="Selected work"
        description="Production sites and platforms — client work and products where repos stay private, but the craft is here for you to see."
      />
      <div className="grid gap-6 lg:grid-cols-2">
        {featured.map((project) => (
          <ProjectCard key={project.slug} project={project} />
        ))}
      </div>
    </section>
  );
}

export function HomeSkills() {
  return (
    <section>
      <SectionHeading
        title="Skills"
        description="The stack I reach for most often — and what this site is built to demonstrate."
      />
      <SkillsGrid />
    </section>
  );
}

export function ComingSoonZones() {
  return (
    <section>
      <SectionHeading
        title="Beyond the resume"
        description="Zuna is an interactive portfolio. Games, API explorations, and achievements are rolling out in later phases."
      />
      <div className="grid gap-4 sm:grid-cols-2">
        {[
          { title: "Playground", description: "Art Roulette, mini-games, and saved scores." },
          { title: "Explore", description: "Pokédex, Star Wars, and more API-driven demos." },
        ].map((zone) => (
          <div key={zone.title} className="rounded-xl border border-dashed border-border bg-muted/30 p-6">
            <p className="text-xs font-medium uppercase tracking-wider text-primary">Coming soon</p>
            <h3 className="mt-2 font-semibold">{zone.title}</h3>
            <p className="mt-1 text-sm text-muted-foreground">{zone.description}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
