"use client";

import { m } from "framer-motion";

import { instantTransition, springTransition } from "@/lib/motion/variants";
import { useReducedMotion } from "@/lib/motion/use-reduced-motion";
import { cn } from "@/lib/utils";

type AnimatedScoreProps = {
  value: number;
  className?: string;
  highlight?: boolean;
};

export function AnimatedScore({ value, className, highlight = false }: AnimatedScoreProps) {
  const reduceMotion = useReducedMotion();

  return (
    <m.span
      key={value}
      className={cn(
        "inline-block font-mono tabular-nums",
        highlight && "text-amber-600 dark:text-amber-400",
        className,
      )}
      initial={reduceMotion ? false : { scale: 1.3, opacity: 0.65 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={reduceMotion ? instantTransition : springTransition}
    >
      {value}
    </m.span>
  );
}
