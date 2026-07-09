"use client";

import { ChevronDown, Search, X } from "lucide-react";
import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { formatPokemonName } from "@/lib/pokemon/api";
import type { CollectionFilter, PokedexView } from "@/lib/pokemon/constants";
import { POKEMON_TYPES } from "@/lib/pokemon/constants";
import { countCollected } from "@/lib/pokemon/collection";
import { usePokemonFavorites } from "@/lib/pokemon/use-pokemon-favorites";
import { cn } from "@/lib/utils";

import { usePokemonCollectionContext } from "./pokemon-collection-provider";

export type PokedexFilters = {
  search: string;
  type: string;
  collection: CollectionFilter;
};

type PokemonSearchFiltersProps = {
  view: PokedexView;
  filters: PokedexFilters;
  onChange: (filters: PokedexFilters) => void;
};

export function PokemonSearchFilters({ view, filters, onChange }: PokemonSearchFiltersProps) {
  const { isAuthenticated, collection } = usePokemonCollectionContext();
  const localFavorites = usePokemonFavorites();

  const totalCollected = isAuthenticated ? countCollected(collection) : localFavorites.length;
  const favoriteCount = isAuthenticated ? collection.filter((entry) => entry.isFavorite).length : localFavorites.length;
  const caughtCount = collection.filter((entry) => entry.caughtInGame).length;
  const cardCount = collection.filter((entry) => entry.hasCard).length;

  const hasActiveFilters =
    view === "browse"
      ? filters.search.length > 0 || filters.type.length > 0
      : filters.search.length > 0 || filters.collection !== "all";

  function clearFilters() {
    onChange({ search: "", type: "", collection: "all" });
  }

  return (
    <div className="space-y-4 rounded-xl border border-border bg-card p-4 shadow-sm">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-end">
        <div className="flex-1 space-y-2">
          <Label htmlFor="pokemon-search">{view === "browse" ? "Search by name" : "Search your collection"}</Label>
          <div className="relative">
            <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              id="pokemon-search"
              type="search"
              placeholder={view === "browse" ? "e.g. charizard, pika…" : "Filter by name…"}
              value={filters.search}
              onChange={(event) => onChange({ ...filters, search: event.target.value })}
              className="pl-9"
            />
          </div>
        </div>

        {view === "browse" ? (
          <div className="w-full space-y-2 lg:w-48">
            <Label htmlFor="pokemon-type">Type</Label>
            <PokemonTypeSelect
              id="pokemon-type"
              value={filters.type}
              onChange={(type) => onChange({ ...filters, type })}
            />
          </div>
        ) : null}
      </div>

      {view === "collection" ? (
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex flex-wrap gap-2">
            <FilterChip
              active={filters.collection === "all"}
              onClick={() => onChange({ ...filters, collection: "all" })}
            >
              All ({totalCollected})
            </FilterChip>
            <FilterChip
              active={filters.collection === "favorite"}
              onClick={() => onChange({ ...filters, collection: "favorite" })}
              disabled={favoriteCount === 0}
            >
              Favorites ({favoriteCount})
            </FilterChip>
            <FilterChip
              active={filters.collection === "caught"}
              onClick={() => onChange({ ...filters, collection: "caught" })}
              disabled={!isAuthenticated || caughtCount === 0}
              title={!isAuthenticated ? "Sign in to track in-game catches" : undefined}
            >
              Caught ({caughtCount})
            </FilterChip>
            <FilterChip
              active={filters.collection === "card"}
              onClick={() => onChange({ ...filters, collection: "card" })}
              disabled={!isAuthenticated || cardCount === 0}
              title={!isAuthenticated ? "Sign in to track TCG cards" : undefined}
            >
              Cards ({cardCount})
            </FilterChip>
          </div>

          {hasActiveFilters ? (
            <button
              type="button"
              onClick={clearFilters}
              className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
            >
              <X className="size-4" />
              Clear filters
            </button>
          ) : null}
        </div>
      ) : hasActiveFilters ? (
        <div className="flex justify-end">
          <button
            type="button"
            onClick={clearFilters}
            className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
          >
            <X className="size-4" />
            Clear filters
          </button>
        </div>
      ) : null}

      {!isAuthenticated ? (
        <p className="text-sm text-muted-foreground">
          <Link href="/auth/login?next=/explore/pokemon" className="underline underline-offset-2">
            Sign in
          </Link>{" "}
          to track in-game catches and TCG cards across devices.
        </p>
      ) : null}
    </div>
  );
}

function PokemonTypeSelect({ id, value, onChange }: { id: string; value: string; onChange: (value: string) => void }) {
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const options = useMemo(
    () => [
      { value: "", label: "All types" },
      ...POKEMON_TYPES.map((type) => ({ value: type, label: formatPokemonName(type) })),
    ],
    [],
  );

  const selectedLabel = options.find((option) => option.value === value)?.label ?? "All types";

  useEffect(() => {
    if (!open) return;

    function onPointerDown(event: PointerEvent) {
      if (!containerRef.current?.contains(event.target as Node)) {
        setOpen(false);
      }
    }

    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setOpen(false);
      }
    }

    document.addEventListener("pointerdown", onPointerDown);
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("pointerdown", onPointerDown);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [open]);

  return (
    <div ref={containerRef} className="relative">
      <button
        type="button"
        id={id}
        aria-haspopup="listbox"
        aria-expanded={open}
        onClick={() => setOpen((current) => !current)}
        className={cn(
          "flex h-9 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-1 text-sm text-foreground shadow-sm",
          "focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring",
        )}
      >
        <span className="truncate">{selectedLabel}</span>
        <ChevronDown
          className={cn("size-4 shrink-0 text-muted-foreground transition-transform", open && "rotate-180")}
        />
      </button>

      {open ? (
        <ul
          role="listbox"
          aria-labelledby={id}
          className="absolute z-50 mt-1 max-h-60 w-full overflow-auto rounded-md border border-border bg-popover py-1 text-popover-foreground shadow-md"
        >
          {options.map((option) => (
            <li key={option.value || "all"} role="presentation">
              <button
                type="button"
                role="option"
                aria-selected={value === option.value}
                onClick={() => {
                  onChange(option.value);
                  setOpen(false);
                }}
                className={cn(
                  "flex w-full px-3 py-1.5 text-left text-sm hover:bg-accent hover:text-accent-foreground",
                  value === option.value && "bg-accent/50 font-medium",
                )}
              >
                {option.label}
              </button>
            </li>
          ))}
        </ul>
      ) : null}
    </div>
  );
}

function FilterChip({
  children,
  active,
  onClick,
  disabled,
  title,
}: {
  children: React.ReactNode;
  active: boolean;
  onClick: () => void;
  disabled?: boolean;
  title?: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      title={title}
      className={cn(
        "rounded-full border px-3 py-1 text-sm transition-colors",
        active
          ? "border-primary bg-primary/10 font-medium text-primary"
          : "border-border text-muted-foreground hover:border-primary/30 hover:text-foreground",
        disabled && "cursor-not-allowed opacity-50",
      )}
    >
      {children}
    </button>
  );
}

export { useDebouncedValue, usePokedexFilters } from "./pokemon-pokedex-filters";
