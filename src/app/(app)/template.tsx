"use client";

// App Router template re-mounts on every navigation, giving each route a cheap
// enter transition. MotionConfig (in AppShell) neutralizes the y-offset for
// reduced-motion users, leaving a plain fade.
import { motion } from "framer-motion";
import type { ReactNode } from "react";

export default function Template({ children }: { children: ReactNode }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.28, ease: [0.16, 1, 0.3, 1] }}
    >
      {children}
    </motion.div>
  );
}
