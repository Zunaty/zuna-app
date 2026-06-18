"use client";

import { m } from "framer-motion";

import { fadeInUp, instantTransition, motionTransition, staggerContainer } from "@/lib/motion/variants";
import { useReducedMotion } from "@/lib/motion/use-reduced-motion";

type StaggerContainerElement = "div" | "ul";

type StaggerChildrenProps = {
  children: React.ReactNode;
  className?: string;
  /** Change to re-run enter animation (e.g. filter key). */
  staggerKey?: string;
  as?: StaggerContainerElement;
};

const containerMap = {
  div: m.div,
  ul: m.ul,
} as const;

export function StaggerChildren({ children, className, staggerKey, as = "div" }: StaggerChildrenProps) {
  const reduceMotion = useReducedMotion();
  const Component = containerMap[as];

  return (
    <Component
      key={staggerKey}
      className={className}
      variants={staggerContainer}
      initial="hidden"
      animate="visible"
      transition={reduceMotion ? instantTransition : undefined}
    >
      {children}
    </Component>
  );
}

type StaggerItemElement = "div" | "li";

type StaggerItemProps = {
  children: React.ReactNode;
  className?: string;
  as?: StaggerItemElement;
};

const itemMap = {
  div: m.div,
  li: m.li,
} as const;

export function StaggerItem({ children, className, as = "div" }: StaggerItemProps) {
  const reduceMotion = useReducedMotion();
  const Component = itemMap[as];

  return (
    <Component
      className={className}
      variants={fadeInUp}
      transition={reduceMotion ? instantTransition : motionTransition}
    >
      {children}
    </Component>
  );
}
