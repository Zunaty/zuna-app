import type { Metadata } from "next";

import { PageHeader, PageShell } from "@/components/layout/page-shell";
import { ProjectCard } from "@/components/portfolio/project-card";
import { projects } from "@/lib/data/projects";
import { site } from "@/lib/data/site";

export const metadata: Metadata = {
  title: "Projects",
  description: `Selected projects and case studies by ${site.name}.`,
};

export default function ProjectsPage() {
  return (
    <PageShell>
      <PageHeader
        eyebrow="Projects"
        title="Work I'm proud of"
        description="Client and product work spanning marketing sites, platforms, and interactive experiences. Links go to live sites where available."
      />

      <div className="grid gap-6 lg:grid-cols-2">
        {projects.map((project) => (
          <ProjectCard key={project.slug} project={project} />
        ))}
      </div>
    </PageShell>
  );
}
