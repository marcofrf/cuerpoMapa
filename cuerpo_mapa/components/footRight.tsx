"use client";

import { motion } from "framer-motion";

export default function FootRight() {
  // For now: hardcoded data
  // Later: fetch this via API or database
  const data = [
    {
      title: "Tarsals",
      description: "Seven irregularly shaped bones that form the ankle and heel.",
    },
    {
      title: "Metatarsals",
      description: "Five long bones that connect the ankle area to the toes.",
    },
    {
      title: "Phalanges",
      description: "The bones of the toes, grouped into proximal, middle, and distal sets.",
    },
    {
      title: "Tarsals",
      description: "Seven irregularly shaped bones that form the ankle and heel.",
    },
    {
      title: "Metatarsals",
      description: "Five long bones that connect the ankle area to the toes.",
    },
    {
      title: "Phalanges",
      description: "The bones of the toes, grouped into proximal, middle, and distal sets.",
    },
    {
      title: "Tarsals",
      description: "Seven irregularly shaped bones that form the ankle and heel.",
    },
    {
      title: "Metatarsals",
      description: "Five long bones that connect the ankle area to the toes.",
    },
    {
      title: "Phalanges",
      description: "The bones of the toes, grouped into proximal, middle, and distal sets.",
    },
    {
      title: "Tarsals",
      description: "Seven irregularly shaped bones that form the ankle and heel.",
    },
    {
      title: "Metatarsals",
      description: "Five long bones that connect the ankle area to the toes.",
    },
    {
      title: "Phalanges",
      description: "The bones of the toes, grouped into proximal, middle, and distal sets.",
    },
    {
      title: "Tarsals",
      description: "Seven irregularly shaped bones that form the ankle and heel.",
    },
    {
      title: "Metatarsals",
      description: "Five long bones that connect the ankle area to the toes.",
    },
    {
      title: "Phalanges",
      description: "The bones of the toes, grouped into proximal, middle, and distal sets.",
    },
  ];

  return (
    <div className="w-full h-full overflow-y-auto p-6 text-white">
      <motion.div
        initial={{ opacity: 0, x: 40 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.4 }}
        className="space-y-6"
      >
        {data.map((item, index) => (
          <motion.div
            key={index}
            className="
              bg-black/20 
              p-4
              rounded-xl
              shadow-lg
              backdrop-blur-md
              border border-white/10
            "
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: index * 0.08 }}
          >
            <h3 className="text-xl font-bold">{item.title}</h3>
            <p className="text-sm opacity-80 mt-1">{item.description}</p>
          </motion.div>
        ))}
      </motion.div>
    </div>
  );
}
