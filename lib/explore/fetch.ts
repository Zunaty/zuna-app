export const EXPLORE_FETCH_REVALIDATE_SECONDS = 60 * 60 * 24;

export async function fetchJson<T>(url: string, init?: RequestInit): Promise<T> {
  const res = await fetch(url, {
    ...init,
    next: { revalidate: EXPLORE_FETCH_REVALIDATE_SECONDS },
  });

  if (!res.ok) {
    throw new Error(`Failed to fetch ${url}: ${res.status}`);
  }

  return res.json() as Promise<T>;
}
