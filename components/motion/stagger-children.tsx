"use client";

import { m } from "framer-motion";

import { fadeInUp, instantTransition, motionTransition, staggerContainer } from "@/lib/motion/variants";
import { useReducedMotion } from "@/lib/motion/use-reduced-motion";

type StaggerChildrenProps = {
  children: React.ReactNode;
  className?: string;
  /** Change to re-run enter animation (e.g. filter key). */
  staggerKey?: string;
};

export function StaggerChildren({ children, className, staggerKey }: StaggerChildrenProps) {
  const reduceMotion = useReducedMotion();

  return (
    <m.div
      key={staggerKey}
      className={className}
      variants={staggerContainer}
      initial="hidden"
      animate="visible"
      transition={reduceMotion ? instantTransition : undefined}
    >
      {children}
    </m.div>
  );
}

type StaggerItemProps = {
  children: React.ReactNode;
  className?: string;
};

export function StaggerItem({ children, className }: StaggerItemProps) {
  const reduceMotion = useReducedMotion();

  return (
    <m.div className={className} variants={fadeInUp} transition={reduceMotion ? instantTransition : motionTransition}>
      {children}
    </m.div>
  );
}
