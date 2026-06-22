"use client";

import { RefreshCw, ShoppingCart } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { SHOP_REFRESH_BASE_COST, SHOP_UNLOCK_ROUND } from "@/lib/prompt-run/constants";
import type { Game, Round, ShopItem } from "@/lib/prompt-run/types";
import { cn } from "@/lib/utils";

type ShopPanelProps = {
  game: Game;
  round: Round;
  onPurchase: (item: ShopItem) => void;
  onRefresh: () => void;
  canAffordItem: (item: ShopItem) => boolean;
  canRefreshShop: () => boolean;
};

const RARITY_CLASS = {
  rare: "border-blue-500/30 bg-blue-500/5",
  epic: "border-purple-500/30 bg-purple-500/5",
  legendary: "border-amber-500/30 bg-amber-500/5",
  common: "border-border bg-muted/20",
  uncommon: "border-green-500/30 bg-green-500/5",
} as const;

export function ShopPanel({ game, round, onPurchase, onRefresh, canAffordItem, canRefreshShop }: ShopPanelProps) {
  const isUnlocked = game.shopUnlocked;
  const roundsUntilUnlock = Math.max(0, SHOP_UNLOCK_ROUND - round.roundNumber);

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div className="flex items-center gap-2">
            <ShoppingCart className="size-5 text-primary" />
            <CardTitle className="text-lg">Shop</CardTitle>
          </div>
          <div className="text-sm text-muted-foreground">
            Score: <span className="font-mono font-semibold text-foreground">{game.totalScore}</span>
            {round.shopSpent ? (
              <span className="ml-3">
                Spent: <span className="font-mono text-orange-600 dark:text-orange-400">-{round.shopSpent}</span>
              </span>
            ) : null}
          </div>
        </div>
        <CardDescription>Purchases add variables to your prompt and cost run score points.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {!isUnlocked ? (
          <p className="py-4 text-center text-sm text-muted-foreground">
            {roundsUntilUnlock === 0
              ? "Shop unlocks next round."
              : `Complete ${roundsUntilUnlock} more round${roundsUntilUnlock === 1 ? "" : "s"} to unlock.`}
          </p>
        ) : (
          <>
            <div className="grid gap-3 md:grid-cols-3">
              {game.shop.items.map((item) => (
                <ShopItemCard
                  key={item.id}
                  item={item}
                  game={game}
                  disabled={game.phase !== "round"}
                  canAfford={canAffordItem(item)}
                  onPurchase={() => onPurchase(item)}
                />
              ))}
            </div>
            <div className="flex flex-wrap items-center justify-between gap-3 border-t pt-4">
              <p className="text-sm text-muted-foreground">
                Refresh available slots for{" "}
                <span className="font-mono font-medium text-foreground">{SHOP_REFRESH_BASE_COST}</span> points.
              </p>
              <Button
                type="button"
                variant="outline"
                size="sm"
                disabled={!canRefreshShop() || game.phase !== "round"}
                onClick={onRefresh}
              >
                <RefreshCw className="size-4" />
                Refresh
              </Button>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
}

function ShopItemCard({
  item,
  game,
  disabled,
  canAfford,
  onPurchase,
}: {
  item: ShopItem;
  game: Game;
  disabled: boolean;
  canAfford: boolean;
  onPurchase: () => void;
}) {
  if (item.isOnCooldown) {
    const roundsLeft = Math.max(0, (item.cooldownEndRound ?? 0) - game.completedRounds);
    return (
      <div className="rounded-lg border border-dashed p-4 text-sm text-muted-foreground">
        <p className="font-medium">Cooling down</p>
        <p className="mt-1 text-xs">
          Available in {roundsLeft} round{roundsLeft === 1 ? "" : "s"}
        </p>
      </div>
    );
  }

  const label = item.type === "variable" ? item.variable?.name : item.name;
  const affordable = canAfford && !disabled;

  return (
    <div className={cn("flex flex-col rounded-lg border p-4", RARITY_CLASS[item.rarity])}>
      <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">{item.rarity}</p>
      <p className="mt-2 flex-1 text-sm font-medium capitalize">{label}</p>
      {item.description ? <p className="mt-1 text-xs text-muted-foreground">{item.description}</p> : null}
      <div className="mt-4 flex items-center justify-between gap-2">
        <span className="font-mono text-sm font-semibold">{item.price}</span>
        <Button type="button" size="sm" disabled={!affordable} onClick={onPurchase}>
          {affordable ? (item.type === "variable" ? "Buy" : "Buy buff") : "Can't afford"}
        </Button>
      </div>
    </div>
  );
}
