import type { Metadata } from "next";

import { PageEnter } from "@/components/motion/page-enter";
import { StaggerChildren, StaggerItem } from "@/components/motion/stagger-children";
import { PageShell } from "@/components/layout/page-shell";
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
      <PageEnter
        header={{
          eyebrow: "Projects",
          title: "Work I'm proud of",
          description:
            "Client and product work spanning marketing sites, platforms, and interactive experiences. Links go to live sites where available.",
        }}
      >
        <StaggerChildren className="grid gap-6 lg:grid-cols-2" staggerKey="projects-page">
          {projects.map((project) => (
            <StaggerItem key={project.slug}>
              <ProjectCard project={project} />
            </StaggerItem>
          ))}
        </StaggerChildren>
      </PageEnter>
    </PageShell>
  );
}
