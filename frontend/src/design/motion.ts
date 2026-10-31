// Motion specifications for ArthSetu
// Following Section 8: standard ease cubic-bezier(0.22, 1, 0.36, 1)

export const EASING = {
  standard: [0.22, 1, 0.36, 1] as const,
  gentleSpring: { type: 'spring', stiffness: 300, damping: 30 } as const,
  bouncySpring: { type: 'spring', stiffness: 400, damping: 25 } as const,
};

export const DURATIONS = {
  micro: 0.16,
  component: 0.28,
  page: 0.4,
  countUp: 0.9,
};

// Ink pathLength draw variants
export const inkDrawVariants = {
  hidden: { pathLength: 0, opacity: 0 },
  visible: (custom = 0) => ({
    pathLength: 1,
    opacity: 1,
    transition: {
      pathLength: { delay: custom * 0.1, duration: 0.6, ease: EASING.standard },
      opacity: { delay: custom * 0.1, duration: 0.2 },
    },
  }),
};

// Stamp landing animation (scale 1.35 -> 1 with rotation settle)
export const stampLandingVariants = {
  initial: { scale: 1.4, opacity: 0, rotate: -8 },
  animate: (targetRotate = -2) => ({
    scale: 1,
    opacity: 1,
    rotate: targetRotate,
    transition: {
      duration: 0.24,
      ease: [0.34, 1.56, 0.64, 1],
    },
  }),
  exit: { scale: 0.9, opacity: 0, transition: { duration: 0.15 } },
};

// Paper lift & fold
export const paperLiftVariants = {
  initial: { y: 16, opacity: 0, rotateX: 6 },
  animate: {
    y: 0,
    opacity: 1,
    rotateX: 0,
    transition: { duration: DURATIONS.component, ease: EASING.standard },
  },
  exit: {
    y: -12,
    opacity: 0,
    rotateX: -4,
    transition: { duration: 0.2 },
  },
};

// Staggered ledger rows
export const ledgerStaggerContainer = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.05,
    },
  },
};

export const ledgerRowVariant = {
  hidden: { opacity: 0, y: 8 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.22, ease: EASING.standard },
  },
};

