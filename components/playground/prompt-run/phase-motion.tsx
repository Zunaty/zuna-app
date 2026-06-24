"use client";

import { AnimatePresence, m } from "framer-motion";
import type { ReactNode } from "react";

import { instantTransition, motionTransition, phaseEnter } from "@/lib/motion/variants";
import { useReducedMotion } from "@/lib/motion/use-reduced-motion";

type PhaseMotionProps = {
  phaseKey: string;
  children: ReactNode;
};

export function PhaseMotion({ phaseKey, children }: PhaseMotionProps) {
  const reduceMotion = useReducedMotion();

  return (
    <AnimatePresence mode="wait">
      <m.div
        key={phaseKey}
        variants={phaseEnter}
        initial={reduceMotion ? false : "hidden"}
        animate="visible"
        exit={reduceMotion ? undefined : "exit"}
        transition={reduceMotion ? instantTransition : motionTransition}
      >
        {children}
      </m.div>
    </AnimatePresence>
  );
}
