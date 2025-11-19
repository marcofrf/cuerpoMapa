import { motion } from "framer-motion";
import type { ReactNode } from "react";

type ZoomPanelProps = {
  children?: ReactNode;
  width: string;
  height: string;
  opacity: number;
  left: string;
  top: string;
  className?: string; // ← added
};

export default function ZoomPanel({
  children,
  width,
  height,
  opacity,
  left,
  top,
  className,
}: ZoomPanelProps) {
  return (
    <motion.div
      key="zoom-panel"
      initial={{ opacity: 0, scale: 0.85 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.85 }}
      transition={{ duration: 0.5 }}
      className={`
        absolute
        bg-transparent
        rounded-lg
        z-30
        flex items-center justify-center
        pointer-events-auto
        ${className || ""}
      `}
      style={{
        width,
        height,
        opacity,
        left,
        top,
        transform: "translate(-50%, -50%)",
      }}
    >
      {children}
    </motion.div>
  );
}
