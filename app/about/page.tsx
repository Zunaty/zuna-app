import type { Metadata } from "next";

import { PageHeader, PageShell } from "@/components/layout/page-shell";
import { SkillsGrid } from "@/components/portfolio/skills-grid";
import { site } from "@/lib/data/site";

export const metadata: Metadata = {
  title: "About",
  description: `Learn more about ${site.name} — background, approach, and what I'm building with Zuna.`,
};

export default function AboutPage() {
  return (
    <PageShell narrow>
      <PageHeader
        eyebrow="About"
        title={`I'm ${site.name}, a ${site.title.toLowerCase()}.`}
        description="I care about fast interfaces, maintainable codebases, and products that feel good to use — whether that's a marketing site or a game hidden inside a portfolio."
      />

      <div className="space-y-6 text-muted-foreground">
        <p>
          Most of my recent work lives in private repositories: event platforms, creative AI tools, and company
          marketing sites. Zuna is the public-facing version of how I build — same standards, open for anyone to
          explore.
        </p>
        <p>
          I lean on Next.js and TypeScript end to end, Supabase when projects need auth and data, and strong tooling
          (ESLint, Prettier, CI, docs) so teams can move fast without accumulating debt.
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
