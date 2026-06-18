export type SwapiListItem = {
  name?: string;
  title?: string;
  url: string;
};

export type SwapiListResponse = {
  count: number;
  next: string | null;
  previous: string | null;
  results: SwapiListItem[];
};

export type SwapiField = string | number | boolean | string[] | null | undefined;

export type SwapiRecord = Record<string, SwapiField>;
