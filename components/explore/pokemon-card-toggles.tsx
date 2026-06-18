"use client";

import { Gamepad2, Heart, Layers, type LucideIcon } from "lucide-react";

import { cn } from "@/lib/utils";

import type { CollectionToggleField } from "@/lib/pokemon/use-pokemon-collection-toggle";

type PokemonCardTogglesProps = {
  isFavorite: boolean;
  caughtInGame: boolean;
  hasCard: boolean;
  isAuthenticated: boolean;
  isPending: boolean;
  onToggle: (field: CollectionToggleField) => void;
  loginHref: string;
};

export function PokemonCardToggles({
  isFavorite,
  caughtInGame,
  hasCard,
  isAuthenticated,
  isPending,
  onToggle,
  loginHref,
}: PokemonCardTogglesProps) {
  return (
    <>
      <div className="absolute left-1.5 top-1.5 z-10">
        <CardIconToggle
          icon={Heart}
          label="Favorite"
          active={isFavorite}
          activeClassName="text-rose-500"
          filled
          disabled={isPending}
          onClick={() => onToggle("isFavorite")}
        />
      </div>

      <div className="absolute right-1.5 top-1.5 z-10 flex flex-col gap-1">
        <CardIconToggle
          icon={Layers}
          label="Has TCG card"
          active={hasCard}
          activeClassName="text-amber-600"
          disabled={isPending || !isAuthenticated}
          onClick={() => onToggle("hasCard")}
          title={!isAuthenticated ? "Sign in to track TCG cards" : undefined}
          loginHref={!isAuthenticated ? loginHref : undefined}
        />
        <CardIconToggle
          icon={Gamepad2}
          label="Caught in game"
          active={caughtInGame}
          activeClassName="text-emerald-600"
          disabled={isPending || !isAuthenticated}
          onClick={() => onToggle("caughtInGame")}
          title={!isAuthenticated ? "Sign in to track in-game catches" : undefined}
          loginHref={!isAuthenticated ? loginHref : undefined}
        />
      </div>
    </>
  );
}

function CardIconToggle({
  icon: Icon,
  label,
  active,
  activeClassName,
  filled,
  disabled,
  onClick,
  title,
  loginHref,
}: {
  icon: LucideIcon;
  label: string;
  active: boolean;
  activeClassName: string;
  filled?: boolean;
  disabled?: boolean;
  onClick: () => void;
  title?: string;
  loginHref?: string;
}) {
  if (loginHref && disabled) {
    return (
      <a
        href={loginHref}
        title={title ?? label}
        aria-label={title ?? label}
        onClick={(event) => event.stopPropagation()}
        className={cn(
          "inline-flex size-7 items-center justify-center rounded-full bg-background/90 shadow-sm ring-1 ring-border transition-opacity",
          "text-muted-foreground/50 hover:text-muted-foreground",
        )}
      >
        <Icon className="size-3.5" />
      </a>
    );
  }

  return (
    <button
      type="button"
      title={title ?? label}
      aria-label={label}
      aria-pressed={active}
      disabled={disabled}
      onClick={(event) => {
        event.preventDefault();
        event.stopPropagation();
        onClick();
      }}
      className={cn(
        "inline-flex size-7 items-center justify-center rounded-full bg-background/90 shadow-sm ring-1 ring-border transition-all",
        active
          ? cn(activeClassName, "opacity-100")
          : "text-muted-foreground/40 opacity-70 hover:text-muted-foreground hover:opacity-100",
        disabled && !loginHref && "cursor-not-allowed opacity-40",
      )}
    >
      <Icon className={cn("size-3.5", filled && active && "fill-current")} />
    </button>
  );
}
