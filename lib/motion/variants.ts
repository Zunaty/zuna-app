import type { Transition, Variants } from "framer-motion";

export const motionTransition = {
  duration: 0.35,
  ease: [0.25, 0.1, 0.25, 1],
} satisfies Transition;

export const instantTransition = {
  duration: 0,
} satisfies Transition;

export const springTransition = {
  type: "spring",
  stiffness: 500,
  damping: 28,
} satisfies Transition;

export const fadeInUp: Variants = {
  hidden: { opacity: 0, y: 14 },
  visible: { opacity: 1, y: 0 },
};

export const fadeIn: Variants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1 },
};

export const staggerContainer: Variants = {
  hidden: {},
  visible: {
    transition: {
      staggerChildren: 0.05,
      delayChildren: 0.03,
    },
  },
};

export const scalePop: Variants = {
  idle: { scale: 1 },
  active: { scale: 1.08 },
};
