import { ArrowUpRight } from "lucide-react";
import Link from "next/link";

import { Button } from "@/components/ui/button";
import type { Project } from "@/lib/data/projects";

type ProjectCardProps = {
  project: Project;
};

export function ProjectCard({ project }: ProjectCardProps) {
  return (
    <article className="group flex flex-col rounded-xl border border-border bg-card p-6 shadow-sm transition-colors hover:border-primary/30">
      <div className="flex-1">
        <h3 className="text-lg font-semibold">{project.title}</h3>
        {project.employer ? <p className="mt-1 text-sm font-medium text-primary">{project.employer}</p> : null}
        <p className="mt-2 text-sm text-muted-foreground">{project.description}</p>
        <ul className="mt-4 space-y-1.5 text-sm text-muted-foreground">
          {project.highlights.map((item) => (
            <li key={item} className="flex gap-2">
              <span className="text-primary" aria-hidden>
                ·
              </span>
              <span>{item}</span>
            </li>
          ))}
        </ul>
      </div>
      <div className="mt-6 flex flex-wrap gap-2">
        {project.skills.map((skill) => (
          <span
            key={skill}
            className="rounded-full bg-secondary px-2.5 py-0.5 text-xs font-medium text-secondary-foreground"
          >
            {skill}
          </span>
        ))}
      </div>
      <div className="mt-6 flex flex-wrap gap-3">
        {project.siteUrl ? (
          <Button variant="outline" size="sm" asChild>
            <a href={project.siteUrl} target="_blank" rel="noopener noreferrer">
              Visit site
              <ArrowUpRight className="size-3.5" />
            </a>
          </Button>
        ) : null}
        <Button variant="ghost" size="sm" asChild>
          <Link href="/projects">All projects</Link>
        </Button>
      </div>
    </article>
  );
}
