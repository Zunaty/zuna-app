import type { Metadata } from "next";
import Link from "next/link";

import { PageHeader, PageShell } from "@/components/layout/page-shell";
import { SkillsGrid } from "@/components/portfolio/skills-grid";
import { Button } from "@/components/ui/button";
import { education, experience } from "@/lib/data/resume";
import { site } from "@/lib/data/site";

export const metadata: Metadata = {
  title: "Resume",
  description: `Experience and skills for ${site.name}.`,
};

export default function ResumePage() {
  return (
    <PageShell narrow>
      <PageHeader eyebrow="Resume" title={site.name} description={`${site.title} · ${site.location}`} />

      <div className="mb-8 flex flex-wrap gap-3">
        <Button asChild>
          <Link href="/contact">Contact me</Link>
        </Button>
        <Button variant="outline" asChild>
          <a href={`mailto:${site.email}`}>Email</a>
        </Button>
      </div>

      <section className="space-y-10">
        <div>
          <h2 className="text-xl font-semibold">Experience</h2>
          <ul className="mt-6 space-y-8">
            {experience.map((job) => (
              <li key={job.company} className="border-l-2 border-primary/30 pl-4">
                <div className="flex flex-wrap items-baseline justify-between gap-2">
                  <h3 className="font-semibold">{job.role}</h3>
                  <span className="text-sm text-muted-foreground">{job.period}</span>
                </div>
                <p className="text-sm font-medium text-muted-foreground">{job.company}</p>
                <p className="mt-2 text-sm text-muted-foreground">{job.summary}</p>
                <ul className="mt-3 list-inside list-disc space-y-1 text-sm text-muted-foreground">
                  {job.bullets.map((bullet) => (
                    <li key={bullet}>{bullet}</li>
                  ))}
                </ul>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <h2 className="text-xl font-semibold">Education</h2>
          <ul className="mt-4 space-y-4">
            {education.map((item) => (
              <li key={item.school}>
                <p className="font-medium">{item.school}</p>
                <p className="text-sm text-muted-foreground">{item.detail}</p>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <h2 className="mb-6 text-xl font-semibold">Skills</h2>
          <SkillsGrid />
        </div>
      </section>
    </PageShell>
  );
}
