"use client";

import { cn } from "@/lib/utils";
import type { PokedexView } from "@/lib/pokemon/constants";

type PokemonViewToggleProps = {
  view: PokedexView;
  collectionCount: number;
  onChange: (view: PokedexView) => void;
};

export function PokemonViewToggle({ view, collectionCount, onChange }: PokemonViewToggleProps) {
  return (
    <div
      className="inline-flex w-full rounded-lg border border-border bg-muted/40 p-1 sm:w-auto"
      role="tablist"
      aria-label="Pokédex view"
    >
      <ToggleButton active={view === "browse"} onClick={() => onChange("browse")}>
        Browse
      </ToggleButton>
      <ToggleButton active={view === "collection"} onClick={() => onChange("collection")}>
        My Collection
        {collectionCount > 0 ? (
          <span className="ml-1.5 rounded-full bg-background/80 px-1.5 py-0.5 text-xs tabular-nums text-muted-foreground">
            {collectionCount}
          </span>
        ) : null}
      </ToggleButton>
    </div>
  );
}

function ToggleButton({
  children,
  active,
  onClick,
}: {
  children: React.ReactNode;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      role="tab"
      aria-selected={active}
      onClick={onClick}
      className={cn(
        "flex flex-1 items-center justify-center rounded-md px-4 py-2 text-sm font-medium transition-colors sm:flex-initial",
        active ? "bg-background text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground",
      )}
    >
      {children}
    </button>
  );
}
