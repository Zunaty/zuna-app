import { fetchJson } from "@/lib/explore/fetch";

import type { SwapiListResponse, SwapiRecord } from "./types";

/** swapi.dev currently serves an expired TLS cert; py4e mirrors the same v1 API. */
export const SWAPI_BASE = "https://swapi.py4e.com/api";

export const SWAPI_RESOURCES = [
  {
    slug: "films",
    label: "Films",
    description: "Episodes from the Skywalker saga and spin-offs.",
  },
  {
    slug: "people",
    label: "Characters",
    description: "Heroes, villains, and everyone in between.",
  },
  {
    slug: "planets",
    label: "Planets",
    description: "Worlds across the galaxy far, far away.",
  },
  {
    slug: "species",
    label: "Species",
    description: "Sentient and notable life forms.",
  },
  {
    slug: "starships",
    label: "Starships",
    description: "Capital ships, fighters, and freighters.",
  },
  {
    slug: "vehicles",
    label: "Vehicles",
    description: "Walkers, speeders, and ground craft.",
  },
] as const;

export type SwapiResourceSlug = (typeof SWAPI_RESOURCES)[number]["slug"];

const RESOURCE_SLUGS = new Set<string>(SWAPI_RESOURCES.map((resource) => resource.slug));

export function isSwapiResourceSlug(value: string): value is SwapiResourceSlug {
  return RESOURCE_SLUGS.has(value);
}

export function getSwapiResource(slug: string) {
  return SWAPI_RESOURCES.find((resource) => resource.slug === slug);
}

export function parseSwapiId(url: string): string | null {
  const match = url.match(/\/api\/[^/]+\/(\d+)\/?$/);
  return match?.[1] ?? null;
}

export function swapiUrlToAppPath(url: unknown): string | null {
  if (typeof url !== "string") {
    return null;
  }

  const match = url.match(/\/api\/([^/]+)\/(\d+)\/?$/);
  if (!match || !isSwapiResourceSlug(match[1])) {
    return null;
  }
  return `/explore/star-wars/${match[1]}/${match[2]}`;
}

export function getSwapiListItemLabel(item: { name?: string; title?: string }): string {
  return item.title ?? item.name ?? "Unknown";
}

export function formatSwapiLabel(key: string): string {
  return key
    .split("_")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

export function formatSwapiValue(value: string | number | boolean): string {
  if (typeof value === "boolean") {
    return value ? "Yes" : "No";
  }

  const text = String(value);
  if (text === "unknown" || text === "n/a") {
    return "Unknown";
  }
  return text;
}

export async function fetchSwapiList(resource: SwapiResourceSlug, page = 1): Promise<SwapiListResponse> {
  return fetchJson<SwapiListResponse>(`${SWAPI_BASE}/${resource}/?page=${page}`);
}

export async function fetchSwapiDetail(resource: SwapiResourceSlug, id: string): Promise<SwapiRecord | null> {
  try {
    return await fetchJson<SwapiRecord>(`${SWAPI_BASE}/${resource}/${id}/`);
  } catch {
    return null;
  }
}

function collectSwapiReferenceUrls(record: SwapiRecord): string[] {
  const urls = new Set<string>();

  for (const value of Object.values(record)) {
    if (typeof value === "string" && swapiUrlToAppPath(value)) {
      urls.add(value);
    } else if (Array.isArray(value)) {
      for (const item of value) {
        if (typeof item === "string" && swapiUrlToAppPath(item)) {
          urls.add(item);
        }
      }
    }
  }

  return [...urls];
}

async function fetchSwapiReferenceLabel(url: string): Promise<[string, string] | null> {
  try {
    const data = await fetchJson<{ name?: string; title?: string }>(url);
    const label = data.title ?? data.name;
    if (!label) {
      return null;
    }
    return [url, label];
  } catch {
    return null;
  }
}

/** SWAPI only embeds URLs for related records — resolve labels in parallel (one request each). */
export async function resolveSwapiReferenceLabels(record: SwapiRecord): Promise<Record<string, string>> {
  const urls = collectSwapiReferenceUrls(record);
  const results = await Promise.all(urls.map(fetchSwapiReferenceLabel));

  return Object.fromEntries(results.filter((entry): entry is [string, string] => entry !== null));
}

export function getSwapiReferenceFallbackLabel(url: string): string {
  const id = parseSwapiId(url);
  const resource = url.match(/\/api\/([^/]+)\//)?.[1];
  if (!id || !resource) {
    return url;
  }
  return `${formatSwapiLabel(resource).replace(/s$/, "")} ${id}`;
}
