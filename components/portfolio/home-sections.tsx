import Link from "next/link";

import { SectionHeadingMotion } from "@/components/motion/section-heading-motion";
import { StaggerChildren, StaggerItem } from "@/components/motion/stagger-children";
import { SkillsGrid } from "@/components/portfolio/skills-grid";
import { Button } from "@/components/ui/button";
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

export function HomeSkills() {
  return (
    <section>
      <SectionHeadingMotion title="Skills" />
      <SkillsGrid staggerKey="home-skills" />
    </section>
  );
}

export function ComingSoonZones() {
  return (
    <section>
      <SectionHeadingMotion
        title="Beyond the resume"
        description="More than a static resume — games, API explorations, and achievements you can opt into."
      />
      <StaggerChildren className="grid gap-4 sm:grid-cols-2" staggerKey="home-zones">
        <StaggerItem>
          <div className="h-full rounded-xl border border-border bg-card p-6 shadow-sm">
            <p className="text-xs font-medium uppercase tracking-wider text-primary">Live now</p>
            <h3 className="mt-2 font-semibold">Explore</h3>
            <p className="mt-1 text-sm text-muted-foreground">Pokédex, Star Wars, and more API-driven demos.</p>
            <Button variant="outline" size="sm" className="mt-4" asChild>
              <Link href="/explore">Browse Explore</Link>
            </Button>
          </div>
        </StaggerItem>
        <StaggerItem>
          <div className="h-full rounded-xl border border-border bg-card p-6 shadow-sm">
            <p className="text-xs font-medium uppercase tracking-wider text-primary">Live now</p>
            <h3 className="mt-2 font-semibold">Playground</h3>
            <p className="mt-1 text-sm text-muted-foreground">
              Type Racer is live — Art Roulette and more games on the way.
            </p>
            <Button variant="outline" size="sm" className="mt-4" asChild>
              <Link href="/playground">Open Playground</Link>
            </Button>
          </div>
        </StaggerItem>
      </StaggerChildren>
    </section>
  );
}
