"use client";

import { FadeIn } from "@/components/motion/fade-in";

type PageContentMotionProps = {
  children: React.ReactNode;
  className?: string;
  delay?: number;
};

export function PageContentMotion({ children, className, delay = 0.08 }: PageContentMotionProps) {
  return (
    <FadeIn className={className} delay={delay}>
      {children}
    </FadeIn>
  );
}
