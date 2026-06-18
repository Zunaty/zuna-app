"use client";

import { Gamepad2, Heart, Layers } from "lucide-react";

import { Button } from "@/components/ui/button";
import type { PokemonCollectionEntry } from "@/lib/pokemon/collection";
import { usePokemonCollectionToggle } from "@/lib/pokemon/use-pokemon-collection-toggle";
import { cn } from "@/lib/utils";

type PokemonCollectionControlsProps = {
  pokemonId: number;
  pokemonSlug: string;
  initialEntry?: PokemonCollectionEntry | null;
  onUpdate?: (entry: PokemonCollectionEntry | null) => void;
};

export function PokemonCollectionControls({
  pokemonId,
  pokemonSlug,
  initialEntry = null,
  onUpdate,
}: PokemonCollectionControlsProps) {
  const { isFavorite, caughtInGame, hasCard, isAuthenticated, isLoading, isPending, toggleField } =
    usePokemonCollectionToggle({
      pokemonId,
      pokemonSlug,
      entry: initialEntry,
      onUpdate,
    });

  if (isLoading) {
    return <div className="h-9 w-full max-w-sm animate-pulse rounded-md bg-muted" aria-hidden />;
  }

  return (
    <div className="flex w-full max-w-sm flex-col gap-3">
      <div className="flex flex-wrap gap-2">
        <CollectionToggle
          label="Favorite"
          icon={Heart}
          active={isFavorite}
          disabled={isPending}
          onClick={() => toggleField("isFavorite")}
        />
        <CollectionToggle
          label="Caught"
          icon={Gamepad2}
          active={caughtInGame}
          disabled={isPending || !isAuthenticated}
          onClick={() => toggleField("caughtInGame")}
          title={!isAuthenticated ? "Sign in to track in-game catches" : undefined}
        />
        <CollectionToggle
          label="Card"
          icon={Layers}
          active={hasCard}
          disabled={isPending || !isAuthenticated}
          onClick={() => toggleField("hasCard")}
          title={!isAuthenticated ? "Sign in to track TCG cards" : undefined}
        />
      </div>

      {!isAuthenticated ? (
        <p className="text-xs text-muted-foreground">
          Favorites save in this browser.{" "}
          <a href={`/auth/login?next=/explore/pokemon/${pokemonId}`} className="underline underline-offset-2">
            Sign in
          </a>{" "}
          to sync catches and cards across devices.
        </p>
      ) : null}
    </div>
  );
}

function CollectionToggle({
  label,
  icon: Icon,
  active,
  disabled,
  onClick,
  title,
}: {
  label: string;
  icon: typeof Heart;
  active: boolean;
  disabled?: boolean;
  onClick: () => void;
  title?: string;
}) {
  return (
    <Button
      type="button"
      variant={active ? "default" : "outline"}
      size="sm"
      disabled={disabled}
      onClick={onClick}
      aria-pressed={active}
      title={title}
      className="gap-1.5"
    >
      <Icon className={cn("size-4", active && label === "Favorite" && "fill-current")} />
      {label}
    </Button>
  );
}
