import { Gamepad2, Heart, Layers } from "lucide-react";

import type { PokemonCollectionEntry } from "@/lib/pokemon/collection";
import { cn } from "@/lib/utils";

type PokemonCollectionBadgesProps = {
  entry?: PokemonCollectionEntry | null;
  className?: string;
};

export function PokemonCollectionBadges({ entry, className }: PokemonCollectionBadgesProps) {
  if (!entry || (!entry.isFavorite && !entry.caughtInGame && !entry.hasCard)) {
    return null;
  }

  return (
    <div className={cn("flex gap-1", className)}>
      {entry.isFavorite ? <BadgeIcon icon={Heart} label="Favorite" className="text-rose-500" filled /> : null}
      {entry.caughtInGame ? <BadgeIcon icon={Gamepad2} label="Caught in game" className="text-emerald-600" /> : null}
      {entry.hasCard ? <BadgeIcon icon={Layers} label="Has card" className="text-amber-600" /> : null}
    </div>
  );
}

function BadgeIcon({
  icon: Icon,
  label,
  className,
  filled,
}: {
  icon: typeof Heart;
  label: string;
  className?: string;
  filled?: boolean;
}) {
  return (
    <span
      className={cn(
        "inline-flex size-6 items-center justify-center rounded-full bg-background/90 shadow-sm ring-1 ring-border",
        className,
      )}
      title={label}
      aria-label={label}
    >
      <Icon className={cn("size-3.5", filled && "fill-current")} />
    </span>
  );
}
