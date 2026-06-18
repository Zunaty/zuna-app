"use client";

import { m } from "framer-motion";
import Link from "next/link";

import { Button } from "@/components/ui/button";
import { site } from "@/lib/data/site";
import { fadeInUp, instantTransition, motionTransition, staggerContainer } from "@/lib/motion/variants";
import { useReducedMotion } from "@/lib/motion/use-reduced-motion";

export function HomeHeroMotion() {
  const reduceMotion = useReducedMotion();
  const transition = reduceMotion ? instantTransition : motionTransition;

  return (
    <section className="relative overflow-hidden rounded-2xl border border-border bg-card px-6 py-14 sm:px-10 sm:py-20">
      <div
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-primary/15 via-transparent to-transparent"
        aria-hidden
      />
      <m.div
        className="relative max-w-3xl"
        variants={staggerContainer}
        initial="hidden"
        animate="visible"
        transition={reduceMotion ? instantTransition : undefined}
      >
        <m.p
          className="text-sm font-medium uppercase tracking-widest text-primary"
          variants={fadeInUp}
          transition={transition}
        >
          Portfolio & playground
        </m.p>
        <m.h1
          className="mt-3 text-4xl font-bold tracking-tight sm:text-5xl lg:text-6xl"
          variants={fadeInUp}
          transition={transition}
        >
          Hi, I&apos;m {site.displayName}.{" "}
          <span className="text-muted-foreground">I build web products people enjoy using.</span>
        </m.h1>
        <m.p className="mt-6 text-lg text-muted-foreground" variants={fadeInUp} transition={transition}>
          {site.tagline}
        </m.p>
        <m.div className="mt-8 flex flex-wrap gap-3" variants={fadeInUp} transition={transition}>
          <Button size="lg" asChild>
            <Link href="/projects">View projects</Link>
          </Button>
          <Button variant="outline" size="lg" asChild>
            <Link href="/contact">Get in touch</Link>
          </Button>
        </m.div>
      </m.div>
    </section>
  );
}
