import type { Metadata } from "next";

import { PageHeader, PageShell } from "@/components/layout/page-shell";
import { SkillsGrid } from "@/components/portfolio/skills-grid";
import { site } from "@/lib/data/site";

export const metadata: Metadata = {
  title: "About",
  description: `Learn more about ${site.name} — background, approach, and what I'm building here.`,
};

export default function AboutPage() {
  return (
    <PageShell narrow>
      <PageHeader
        eyebrow="About"
        title={`I'm ${site.displayName}, a ${site.title.toLowerCase()}.`}
        description="I care about fast interfaces, maintainable codebases, and products that feel good to use — whether that's a marketing site or a game hidden inside a portfolio."
      />

      <div className="space-y-6 text-muted-foreground">
        <p>
          I&apos;m a full stack engineer with a path from blockchain and AI research products at Black Swan Research to
          shipping AI-powered platforms at Koggin Labs — comedy discovery, creative tooling, and automation that turns
          generative workflows into real products.
        </p>
        <p>
          Most of that work lives in private repositories. This site is the public-facing version of how I build:
          Next.js and TypeScript end to end, Supabase when projects need auth and data, and strong tooling (ESLint,
          Prettier, CI, docs) so teams can move fast without accumulating debt.
        </p>
        <p>
          This site will grow into more than a resume: mini-games, API explorations, AI demos, and a light achievement
          system that rewards curiosity. The portfolio pages come first; the playground follows.
        </p>
      </div>

      <section className="mt-14">
        <h2 className="mb-6 text-xl font-semibold">Technical focus</h2>
        <SkillsGrid />
      </section>
    </PageShell>
  );
}
