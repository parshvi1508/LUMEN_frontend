"use client";

// Tiny shared motion vocabulary so every surface animates the same way.
// Honors prefers-reduced-motion via the app-level <MotionConfig reducedMotion="user">.
import { motion, type Variants } from "framer-motion";
import type { ComponentProps, ReactNode } from "react";

const EASE: [number, number, number, number] = [0.16, 1, 0.3, 1]; // gentle ease-out

export const fadeUp: Variants = {
  hidden: { opacity: 0, y: 8 },
  show: { opacity: 1, y: 0, transition: { duration: 0.4, ease: EASE } },
};

export const staggerParent: Variants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.06, delayChildren: 0.03 } },
};

export function FadeIn({
  children,
  className,
  delay = 0,
}: {
  children: ReactNode;
  className?: string;
  delay?: number;
}) {
  return (
    <motion.div
      className={className}
      initial="hidden"
      animate="show"
      variants={fadeUp}
      transition={{ delay }}
    >
      {children}
    </motion.div>
  );
}

// Container that staggers its StaggerItem children on mount.
export function Stagger({
  children,
  ...rest
}: ComponentProps<typeof motion.div>) {
  return (
    <motion.div
      variants={staggerParent}
      initial="hidden"
      animate="show"
      {...rest}
    >
      {children}
    </motion.div>
  );
}

export function StaggerItem({
  children,
  ...rest
}: ComponentProps<typeof motion.div>) {
  return (
    <motion.div variants={fadeUp} {...rest}>
      {children}
    </motion.div>
  );
}
