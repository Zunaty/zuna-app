"use client";

import { LazyMotion, domAnimation } from "framer-motion";

type MotionProviderProps = {
  children: React.ReactNode;
};

export function MotionProvider({ children }: MotionProviderProps) {
  return (
    <LazyMotion features={domAnimation} strict>
      {children}
    </LazyMotion>
  );
}
