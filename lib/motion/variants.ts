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

export const cardFlipReveal: Variants = {
  hidden: { opacity: 0, rotateY: -72, scale: 0.94 },
  visible: { opacity: 1, rotateY: 0, scale: 1 },
};

export const slideInRight: Variants = {
  hidden: { opacity: 0, x: 24 },
  visible: { opacity: 1, x: 0 },
  exit: { opacity: 0, x: -24 },
};

export const phaseEnter: Variants = {
  hidden: { opacity: 0, y: 10 },
  visible: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -8 },
};

export const scorePop: Variants = {
  hidden: { opacity: 0, y: 4, scale: 0.85 },
  visible: { opacity: 1, y: -32, scale: 1 },
  exit: { opacity: 0, y: -48, scale: 0.95 },
};

export const popIn: Variants = {
  hidden: { opacity: 0, scale: 0.88 },
  visible: { opacity: 1, scale: 1 },
};
