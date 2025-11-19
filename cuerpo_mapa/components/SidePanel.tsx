"use client";

import { motion } from "framer-motion";

export default function SidePanel({ children }: { children: React.ReactNode }) {
  return (
    <motion.div
      initial={{ opacity: 0, x: 80 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 80 }}
      transition={{ duration: 0.4 }}
      className="
        bg-white/50
        rounded-2xl
        shadow-xl
        backdrop-blur-sm
        overflow-hidden
        w-[40vw]
        h-[50vh]
        p-6
      "
    >
      {children}
    </motion.div>
  );
}
