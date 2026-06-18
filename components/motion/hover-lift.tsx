"use client";

import { m } from "framer-motion";

import { instantTransition, springTransition } from "@/lib/motion/variants";
import { useReducedMotion } from "@/lib/motion/use-reduced-motion";
import { cn } from "@/lib/utils";

type HoverLiftProps = {
  children: React.ReactNode;
  className?: string;
};

export function HoverLift({ children, className }: HoverLiftProps) {
  const reduceMotion = useReducedMotion();

  return (
    <m.div
      className={cn(className)}
      whileHover={reduceMotion ? undefined : { y: -3 }}
      transition={reduceMotion ? instantTransition : springTransition}
    >
      {children}
    </m.div>
  );
}
