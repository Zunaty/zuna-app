"use client";

import { m } from "framer-motion";

import { fadeInUp, instantTransition, motionTransition } from "@/lib/motion/variants";
import { useReducedMotion } from "@/lib/motion/use-reduced-motion";

type FadeInProps = {
  children: React.ReactNode;
  className?: string;
  delay?: number;
};

export function FadeIn({ children, className, delay = 0 }: FadeInProps) {
  const reduceMotion = useReducedMotion();

  return (
    <m.div
      className={className}
      variants={fadeInUp}
      initial="hidden"
      animate="visible"
      transition={reduceMotion ? instantTransition : { ...motionTransition, delay }}
    >
      {children}
    </m.div>
  );
}
