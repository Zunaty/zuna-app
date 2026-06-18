import type { Metadata } from "next";
import Link from "next/link";

import { PageEnter } from "@/components/motion/page-enter";
import { StaggerChildren, StaggerItem } from "@/components/motion/stagger-children";
import { PageShell } from "@/components/layout/page-shell";
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
      <PageEnter header={{ eyebrow: "Resume", title: site.name, description: `${site.title} · ${site.location}` }}>
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
            <StaggerChildren as="ul" className="mt-6 space-y-10" staggerKey="resume-experience">
              {experience.map((job) => (
                <StaggerItem key={`${job.company}-${job.period}`} as="li" className="border-l-2 border-primary/30 pl-4">
                  <div className="flex flex-wrap items-baseline justify-between gap-2">
                    <h3 className="font-semibold">{job.role}</h3>
                    <span className="text-sm text-muted-foreground">{job.period}</span>
                  </div>
                  <p className="text-sm font-medium text-muted-foreground">{job.company}</p>
                  {job.summary ? <p className="mt-2 text-sm text-muted-foreground">{job.summary}</p> : null}
                  <ul className="mt-3 list-inside list-disc space-y-1.5 text-sm text-muted-foreground">
                    {job.bullets.map((bullet) => (
                      <li key={bullet}>{bullet}</li>
                    ))}
                  </ul>
                </StaggerItem>
              ))}
            </StaggerChildren>
          </div>

          <div>
            <h2 className="text-xl font-semibold">Education</h2>
            <StaggerChildren as="ul" className="mt-6 space-y-8" staggerKey="resume-education">
              {education.map((item) => (
                <StaggerItem
                  key={`${item.school}-${item.credential}`}
                  as="li"
                  className="border-l-2 border-border pl-4"
                >
                  <div className="flex flex-wrap items-baseline justify-between gap-2">
                    <p className="font-semibold">{item.school}</p>
                    {item.period ? <span className="text-sm text-muted-foreground">{item.period}</span> : null}
                  </div>
                  <p className="text-sm font-medium text-muted-foreground">{item.credential}</p>
                  {item.bullets ? (
                    <ul className="mt-3 list-inside list-disc space-y-1.5 text-sm text-muted-foreground">
                      {item.bullets.map((bullet) => (
                        <li key={bullet}>{bullet}</li>
                      ))}
                    </ul>
                  ) : null}
                </StaggerItem>
              ))}
            </StaggerChildren>
          </div>

          <div>
            <h2 className="mb-6 text-xl font-semibold">Skills</h2>
            <SkillsGrid staggerKey="resume-skills" />
          </div>
        </section>
      </PageEnter>
    </PageShell>
  );
}
