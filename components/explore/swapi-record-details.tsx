import Link from "next/link";

import {
  formatSwapiLabel,
  formatSwapiValue,
  getSwapiReferenceFallbackLabel,
  swapiUrlToAppPath,
} from "@/lib/star-wars/api";
import type { SwapiField, SwapiRecord } from "@/lib/star-wars/types";

const HIDDEN_FIELDS = new Set(["url", "created", "edited"]);

type SwapiRecordDetailsProps = {
  record: SwapiRecord;
  referenceLabels?: Record<string, string>;
};

export function SwapiRecordDetails({ record, referenceLabels = {} }: SwapiRecordDetailsProps) {
  const entries = Object.entries(record).filter(([key]) => !HIDDEN_FIELDS.has(key));

  return (
    <dl className="divide-y divide-border rounded-xl border border-border bg-card">
      {entries.map(([key, value]) => (
        <div key={key} className="grid gap-2 px-4 py-3 sm:grid-cols-[10rem_1fr] sm:gap-4 sm:px-6">
          <dt className="text-sm font-medium text-muted-foreground">{formatSwapiLabel(key)}</dt>
          <dd className="text-sm">
            <SwapiFieldValue fieldKey={key} value={value} referenceLabels={referenceLabels} />
          </dd>
        </div>
      ))}
    </dl>
  );
}

type SwapiFieldValueProps = {
  fieldKey: string;
  value: SwapiField;
  referenceLabels: Record<string, string>;
};

function getReferenceLabel(url: string, referenceLabels: Record<string, string>): string {
  return referenceLabels[url] ?? getSwapiReferenceFallbackLabel(url);
}

function SwapiFieldValue({ fieldKey, value, referenceLabels }: SwapiFieldValueProps) {
  if (value == null || value === "") {
    return <span className="text-muted-foreground">—</span>;
  }

  if (Array.isArray(value)) {
    if (value.length === 0) {
      return <span className="text-muted-foreground">None</span>;
    }

    return (
      <ul className="flex flex-wrap gap-2">
        {value.map((item) => {
          const href = swapiUrlToAppPath(item);
          const label = typeof item === "string" ? getReferenceLabel(item, referenceLabels) : String(item);
          return (
            <li key={String(item)}>
              {href ? (
                <Link href={href} className="rounded-full bg-secondary px-2.5 py-0.5 text-xs hover:text-primary">
                  {label}
                </Link>
              ) : (
                <span className="rounded-full bg-secondary px-2.5 py-0.5 text-xs">{label}</span>
              )}
            </li>
          );
        })}
      </ul>
    );
  }

  if (typeof value !== "string") {
    return <span>{formatSwapiValue(value)}</span>;
  }

  const href = swapiUrlToAppPath(value);
  if (href) {
    return (
      <Link href={href} className="font-medium text-primary hover:underline">
        {getReferenceLabel(value, referenceLabels)}
      </Link>
    );
  }

  if (fieldKey === "opening_crawl") {
    return <p className="whitespace-pre-line leading-relaxed text-muted-foreground">{formatSwapiValue(value)}</p>;
  }

  if (fieldKey === "name" || fieldKey === "title") {
    return <span className="font-medium">{formatSwapiValue(value)}</span>;
  }

  return <span>{formatSwapiValue(value)}</span>;
}
