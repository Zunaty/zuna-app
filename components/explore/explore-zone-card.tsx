import { ArrowRight } from "lucide-react";
import Link from "next/link";

import { HoverLift } from "@/components/motion/hover-lift";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

type ExploreZoneCardProps = {
  title: string;
  description: string;
  href: string;
  eyebrow: string;
};

export function ExploreZoneCard({ title, description, href, eyebrow }: ExploreZoneCardProps) {
  return (
    <HoverLift>
      <Card className="flex h-full flex-col transition-colors hover:border-primary/30">
        <CardHeader>
          <p className="text-xs font-medium uppercase tracking-wider text-primary">{eyebrow}</p>
          <CardTitle className="text-xl">{title}</CardTitle>
          <CardDescription>{description}</CardDescription>
        </CardHeader>
        <CardContent className="mt-auto">
          <Button variant="outline" asChild>
            <Link href={href}>
              Browse
              <ArrowRight className="size-4" />
            </Link>
          </Button>
        </CardContent>
      </Card>
    </HoverLift>
  );
}
