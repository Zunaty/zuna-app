import type { Metadata } from "next";

import { HoverLift } from "@/components/motion/hover-lift";
import { PageEnter } from "@/components/motion/page-enter";
import { StaggerChildren, StaggerItem } from "@/components/motion/stagger-children";
import { PageShell } from "@/components/layout/page-shell";
import { Button } from "@/components/ui/button";
import { site, socialLinks } from "@/lib/data/site";

export const metadata: Metadata = {
  title: "Contact",
  description: `Get in touch with ${site.name} for opportunities, collaborations, or questions about this site.`,
};

export default function ContactPage() {
  return (
    <PageShell narrow>
      <PageEnter
        header={{
          eyebrow: "Contact",
          title: "Let's connect",
          description:
            "Open to full-time roles, contract work, and interesting side projects. The fastest way to reach me is email or LinkedIn.",
        }}
      >
        <StaggerChildren className="grid gap-6 sm:grid-cols-2" staggerKey="contact-cards">
          <StaggerItem>
            <HoverLift>
              <div className="h-full rounded-xl border border-border bg-card p-6">
                <h2 className="font-semibold">Email</h2>
                <p className="mt-2 text-sm text-muted-foreground">Best for introductions and role details.</p>
                <Button className="mt-4" asChild>
                  <a href={`mailto:${site.email}`}>{site.email}</a>
                </Button>
              </div>
            </HoverLift>
          </StaggerItem>

          <StaggerItem>
            <HoverLift>
              <div className="h-full rounded-xl border border-border bg-card p-6">
                <h2 className="font-semibold">Social</h2>
                <p className="mt-2 text-sm text-muted-foreground">Professional profiles and code.</p>
                <ul className="mt-4 space-y-2">
                  {socialLinks.map((link) => (
                    <li key={link.href}>
                      <a
                        href={link.href}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-sm font-medium text-primary hover:underline"
                      >
                        {link.label}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            </HoverLift>
          </StaggerItem>
        </StaggerChildren>

        <p className="mt-10 text-sm text-muted-foreground">
          A contact form may land here later. For now, email works great.
        </p>
      </PageEnter>
    </PageShell>
  );
}
