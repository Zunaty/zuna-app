import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import { SwapiRecordDetails } from "@/components/explore/swapi-record-details";
import { PageContentMotion } from "@/components/motion/page-content-motion";
import { PageHeaderMotion } from "@/components/motion/page-header-motion";
import { PageShell } from "@/components/layout/page-shell";
import { Button } from "@/components/ui/button";
import {
  fetchSwapiDetail,
  getSwapiResource,
  isSwapiResourceSlug,
  resolveSwapiReferenceLabels,
} from "@/lib/star-wars/api";
import { site } from "@/lib/data/site";

type StarWarsDetailPageProps = {
  params: Promise<{ resource: string; id: string }>;
};

export async function generateMetadata({ params }: StarWarsDetailPageProps): Promise<Metadata> {
  const { resource: resourceSlug, id } = await params;

  if (!isSwapiResourceSlug(resourceSlug)) {
    return { title: "Not found" };
  }

  const record = await fetchSwapiDetail(resourceSlug, id);
  const title = typeof record?.name === "string" ? record.name : typeof record?.title === "string" ? record.title : id;

  return {
    title: `Star Wars · ${title}`,
    description: `SWAPI record for ${title} on ${site.name}'s portfolio.`,
  };
}

export default async function StarWarsDetailPage({ params }: StarWarsDetailPageProps) {
  const { resource: resourceSlug, id } = await params;

  if (!isSwapiResourceSlug(resourceSlug)) {
    notFound();
  }

  const resource = getSwapiResource(resourceSlug);
  const record = await fetchSwapiDetail(resourceSlug, id);

  if (!record || !resource) {
    notFound();
  }

  const referenceLabels = await resolveSwapiReferenceLabels(record);

  const title =
    typeof record.name === "string" ? record.name : typeof record.title === "string" ? record.title : `Entry ${id}`;

  return (
    <PageShell narrow>
      <PageHeaderMotion eyebrow="Explore · SWAPI" title={title} />

      <PageContentMotion>
        <div className="mb-8 space-y-3">
          <div className="flex flex-wrap items-center gap-3 text-sm text-muted-foreground">
            <Link href="/explore/star-wars" className="hover:text-foreground">
              Star Wars
            </Link>
            <span aria-hidden>/</span>
            <Link href={`/explore/star-wars/${resourceSlug}`} className="hover:text-foreground">
              {resource.label}
            </Link>
          </div>
          <Button variant="ghost" size="sm" asChild>
            <Link href={`/explore/star-wars/${resourceSlug}`}>← Back to {resource.label}</Link>
          </Button>
        </div>

        <SwapiRecordDetails record={record} referenceLabels={referenceLabels} />
      </PageContentMotion>
    </PageShell>
  );
}
