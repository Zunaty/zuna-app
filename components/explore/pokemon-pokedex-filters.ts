"use client";

import { useCallback, useEffect, useState } from "react";

import type { PokedexFilters } from "@/components/explore/pokemon-search-filters";

export function useDebouncedValue<T>(value: T, delayMs: number): T {
  const [debounced, setDebounced] = useState(value);

  useEffect(() => {
    const timer = window.setTimeout(() => setDebounced(value), delayMs);
    return () => window.clearTimeout(timer);
  }, [delayMs, value]);

  return debounced;
}

const EMPTY_FILTERS: PokedexFilters = {
  search: "",
  type: "",
  collection: "all",
};

export function usePokedexFilters() {
  const [filters, setFilters] = useState<PokedexFilters>(EMPTY_FILTERS);

  const debouncedSearch = useDebouncedValue(filters.search, 300);

  const resetKey = useCallback(
    () => `${debouncedSearch}|${filters.type}|${filters.collection}`,
    [debouncedSearch, filters.collection, filters.type],
  );

  const resetFilters = useCallback(() => {
    setFilters(EMPTY_FILTERS);
  }, []);

  return { filters, setFilters, debouncedSearch, resetKey, resetFilters };
}
