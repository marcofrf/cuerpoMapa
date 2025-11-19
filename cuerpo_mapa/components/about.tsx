"use client";

import { motion } from "framer-motion";

export default function About() {
  return (
    <motion.div
      initial={{ opacity: 0, x: 40 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.4 }}
      className="
        flex
        flex-col
        bg-white/50
        rounded-2xl
        shadow-xl
        overflow-hidden
        backdrop-blur-sm

        w-[40vw]
        h-[50vh]
        p-8
      "
    >
      <h2 className="text-2xl font-bold text-gray-900 mb-4">
        About This App
      </h2>

      <p className="text-gray-800 leading-relaxed text-sm overflow-y-auto pr-2">
        This application provides an immersive and interactive anatomy
        exploration experience.

        <br /><br />

        You can zoom into various anatomical zones, view detailed sketches,
        and access related media such as books, films, and audio material.

        <br /><br />

        The goal is to enhance learning through visual interaction and
        smooth navigation.
      </p>
    </motion.div>
  );
}
