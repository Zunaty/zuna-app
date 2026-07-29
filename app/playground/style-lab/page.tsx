import type { Metadata } from "next";
import Link from "next/link";

import { StyleLabEditor } from "@/components/playground/style-lab/style-lab-editor";
import { PageEnter } from "@/components/motion/page-enter";
import { PageShell } from "@/components/layout/page-shell";
import { Button } from "@/components/ui/button";
import { site } from "@/lib/data/site";

export const metadata: Metadata = {
  title: "Style Lab",
  description: `Tweak radius, accents, and fonts for ${site.name}'s portfolio — presets and live controls that restyle the whole site.`,
};

export default function StyleLabPage() {
  return (
    <PageShell narrow>
      <PageEnter
        header={{
          eyebrow: "Playground",
          title: "Style Lab",
          description:
            "Curated presets plus a few knobs — radius, accent, and fonts. Your choices apply site-wide and save in this browser.",
        }}
      >
        <StyleLabEditor />

        <div className="mt-10">
          <Button variant="ghost" size="sm" asChild>
            <Link href="/playground">Back to Playground</Link>
          </Button>
        </div>
      </PageEnter>
    </PageShell>
  );
}
