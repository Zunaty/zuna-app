import { ArrowRight } from "lucide-react";
import Link from "next/link";

import { HoverLift } from "@/components/motion/hover-lift";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

type PlaygroundGameCardProps = {
  title: string;
  description: string;
  href: string;
  status: "live" | "coming-soon";
  eyebrow?: string;
};

export function PlaygroundGameCard({
  title,
  description,
  href,
  status,
  eyebrow = "Mini-game",
}: PlaygroundGameCardProps) {
  const isLive = status === "live";

  return (
    <HoverLift>
      <Card
        className={
          isLive
            ? "flex h-full flex-col transition-colors hover:border-primary/30"
            : "flex h-full flex-col border-dashed bg-muted/20"
        }
      >
        <CardHeader>
          <p className="text-xs font-medium uppercase tracking-wider text-primary">
            {isLive ? eyebrow : "Coming soon"}
          </p>
          <CardTitle className="text-xl">{title}</CardTitle>
          <CardDescription>{description}</CardDescription>
        </CardHeader>
        <CardContent className="mt-auto">
          {isLive ? (
            <Button variant="outline" asChild>
              <Link href={href}>
                Play
                <ArrowRight className="size-4" />
              </Link>
            </Button>
          ) : (
            <Button variant="ghost" disabled>
              Not yet available
            </Button>
          )}
        </CardContent>
      </Card>
    </HoverLift>
  );
}
