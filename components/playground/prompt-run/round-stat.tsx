import type { ReactNode } from "react";

import { cn } from "@/lib/utils";

type RoundStatProps = {
  label: string;
  value: ReactNode;
  hint?: ReactNode;
  className?: string;
  valueClassName?: string;
  hintClassName?: string;
  align?: "left" | "right";
};

export function RoundStat({
  label,
  value,
  hint,
  className,
  valueClassName,
  hintClassName,
  align = "left",
}: RoundStatProps) {
  return (
    <div className={cn("text-sm", align === "right" && "text-right", className)}>
      <p className="leading-5 text-muted-foreground">{label}</p>
      <div
        className={cn(
          "flex min-h-7 items-center text-lg font-semibold",
          align === "right" && "justify-end",
          valueClassName,
        )}
      >
        {value}
      </div>
      <p className={cn("min-h-4 text-xs leading-4", hint ? hintClassName : "text-muted-foreground/0")}>
        {hint ?? "\u00a0"}
      </p>
    </div>
  );
}
