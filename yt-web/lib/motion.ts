export const EASING = [0.25, 0.1, 0.25, 1] as const;
export const EASING_OUT = [0.0, 0.0, 0.2, 1] as const;

export const fadeUp = {
  initial: { opacity: 0, y: 24 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -12 },
  transition: { duration: 0.6, ease: EASING },
};

export const staggerContainer = {
  animate: { transition: { staggerChildren: 0.08 } },
};

export const slideInRight = {
  initial: { x: "100%" },
  animate: { x: 0 },
  exit: { x: "100%" },
  transition: { duration: 0.45, ease: EASING_OUT },
};

export const recipientPanel = {
  initial: { opacity: 0, height: 0 },
  animate: { opacity: 1, height: "auto" },
  exit: { opacity: 0, height: 0 },
  transition: { duration: 0.4, ease: EASING_OUT },
};
