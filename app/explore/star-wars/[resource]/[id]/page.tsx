import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import { SwapiRecordDetails } from "@/components/explore/swapi-record-details";
import { SwapiUnavailableNotice } from "@/components/explore/swapi-unavailable-notice";
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

  const result = await fetchSwapiDetail(resourceSlug, id);
  const title =
    result.status === "success"
      ? typeof result.data.name === "string"
        ? result.data.name
        : typeof result.data.title === "string"
          ? result.data.title
          : id
      : id;

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
  if (!resource) {
    notFound();
  }

  const result = await fetchSwapiDetail(resourceSlug, id);

  if (result.status === "not_found") {
    notFound();
  }

  if (result.status === "unavailable") {
    return (
      <PageShell narrow>
        <PageHeaderMotion eyebrow="Explore · SWAPI" title={`${resource.label} entry`} />

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

          <SwapiUnavailableNotice />
        </PageContentMotion>
      </PageShell>
    );
  }

  const record = result.data;
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
