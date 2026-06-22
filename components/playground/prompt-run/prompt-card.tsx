import type { PromptVariable, Rarity } from "@/lib/prompt-run/types";
import { cn } from "@/lib/utils";

const RARITY_STYLES: Record<Rarity, string> = {
  common: "border-border bg-muted/40 text-foreground",
  uncommon: "border-green-500/40 bg-green-500/10 text-green-700 dark:text-green-300",
  rare: "border-blue-500/40 bg-blue-500/10 text-blue-700 dark:text-blue-300",
  epic: "border-purple-500/40 bg-purple-500/10 text-purple-700 dark:text-purple-300",
  legendary: "border-amber-500/40 bg-amber-500/10 text-amber-700 dark:text-amber-300",
};

type PromptCardProps = {
  variable: PromptVariable;
  onSelect: (variable: PromptVariable) => void;
  disabled?: boolean;
};

export function PromptCard({ variable, onSelect, disabled }: PromptCardProps) {
  return (
    <button
      type="button"
      disabled={disabled}
      onClick={() => onSelect(variable)}
      className={cn(
        "flex min-h-28 flex-col justify-between rounded-xl border p-4 text-left transition-colors",
        "hover:border-primary/50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
        "disabled:cursor-not-allowed disabled:opacity-50",
        RARITY_STYLES[variable.rarity],
      )}
    >
      <span className="text-xs font-medium uppercase tracking-wider opacity-80">{variable.rarity}</span>
      <span className="text-lg font-semibold capitalize">{variable.name}</span>
      <span className="font-mono text-sm">{variable.points} pts</span>
    </button>
  );
}
