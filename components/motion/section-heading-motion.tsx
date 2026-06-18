"use client";

import { m } from "framer-motion";

import { fadeInUp, instantTransition, motionTransition, staggerContainer } from "@/lib/motion/variants";
import { useReducedMotion } from "@/lib/motion/use-reduced-motion";

type SectionHeadingMotionProps = {
  title: string;
  description?: string;
  className?: string;
};

export function SectionHeadingMotion({ title, description, className }: SectionHeadingMotionProps) {
  const reduceMotion = useReducedMotion();
  const transition = reduceMotion ? instantTransition : motionTransition;

  return (
    <m.div
      className={className ?? "mb-8 max-w-2xl"}
      variants={staggerContainer}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: "-40px" }}
      transition={reduceMotion ? instantTransition : undefined}
    >
      <m.h2 className="text-2xl font-semibold tracking-tight sm:text-3xl" variants={fadeInUp} transition={transition}>
        {title}
      </m.h2>
      {description ? (
        <m.p className="mt-2 text-muted-foreground" variants={fadeInUp} transition={transition}>
          {description}
        </m.p>
      ) : null}
    </m.div>
  );
}
