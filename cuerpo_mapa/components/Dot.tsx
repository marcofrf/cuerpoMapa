// /components/Dot.tsx

"use client";

import { motion } from "framer-motion";
import { FC } from "react";

type DotProps = {
  x: string;
  y: string;
  onClick: () => void;
};

const Dot: FC<DotProps> = ({ x, y, onClick }) => {
  return (
    <motion.div
      className="absolute w-4 h-4 bg-red-500 rounded-full cursor-pointer shadow-lg"
      style={{
        left: x,
        top: y,
        transform: "translate(-50%, -50%)",
      }}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ opacity: { duration: 0.2 } }}
      whileHover={{ scale: 1.3 }}
      onClick={onClick}
    />
  );
};

export default Dot;
