import Link from "next/link";
import type { ReactNode } from "react";

import { PlaygroundScoreProvider } from "@/components/playground/playground-score-provider";
import { PageEnter } from "@/components/motion/page-enter";
import { PageShell } from "@/components/layout/page-shell";
import { Button } from "@/components/ui/button";
import { getUserPlaygroundScores } from "@/lib/playground/server-scores";

type PlaygroundGameShellProps = {
  title: string;
  /** Description shown to signed-in users (and guests when `guestDescription` is omitted). */
  description: string;
  /** Optional guest-only description (e.g. "saves in your browser" vs sync copy). */
  guestDescription?: string;
  children: ReactNode;
};

export async function PlaygroundGameShell({
  title,
  description,
  guestDescription,
  children,
}: PlaygroundGameShellProps) {
  const { userId, scores } = await getUserPlaygroundScores();
  const resolvedDescription = userId ? description : (guestDescription ?? description);

  return (
    <PageShell narrow>
      <PageEnter header={{ eyebrow: "Playground", title, description: resolvedDescription }}>
        <PlaygroundScoreProvider isAuthenticated={userId !== null} serverScores={scores}>
          {children}
        </PlaygroundScoreProvider>

        <div className="mt-10">
          <Button variant="ghost" size="sm" asChild>
            <Link href="/playground">Back to Playground</Link>
          </Button>
        </div>
      </PageEnter>
    </PageShell>
  );
}
