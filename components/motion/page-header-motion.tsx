"use client";

import { m } from "framer-motion";

import type { PageHeaderProps } from "@/components/layout/page-shell";
import { fadeInUp, instantTransition, motionTransition, staggerContainer } from "@/lib/motion/variants";
import { useReducedMotion } from "@/lib/motion/use-reduced-motion";

export function PageHeaderMotion({ eyebrow, title, description }: PageHeaderProps) {
  const reduceMotion = useReducedMotion();
  const transition = reduceMotion ? instantTransition : motionTransition;

  return (
    <m.header
      className="mb-10 max-w-3xl"
      variants={staggerContainer}
      initial="hidden"
      animate="visible"
      transition={reduceMotion ? instantTransition : undefined}
    >
      {eyebrow ? (
        <m.p
          className="mb-2 text-sm font-medium uppercase tracking-widest text-primary"
          variants={fadeInUp}
          transition={transition}
        >
          {eyebrow}
        </m.p>
      ) : null}
      <m.h1 className="text-3xl font-bold tracking-tight sm:text-4xl" variants={fadeInUp} transition={transition}>
        {title}
      </m.h1>
      {description ? (
        <m.p className="mt-4 text-lg text-muted-foreground" variants={fadeInUp} transition={transition}>
          {description}
        </m.p>
      ) : null}
    </m.header>
  );
}
