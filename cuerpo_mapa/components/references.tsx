"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { supabase } from "@/lib/supabaseClient";

export default function MediaMenuPage() {
  const [data, setData] = useState<any[]>([]);
  const [hoveredItem, setHoveredItem] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);

  const sections = [
    { title: "Books", type: "book" },
    { title: "Movies", type: "movie" },
    { title: "Music", type: "audio" },
  ];

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      const { data, error } = await supabase
        .from("csv_test")
        .select("id, title, description, type");

      if (error) console.error("Supabase error:", error);
      else setData(data || []);
      setLoading(false);
    };

    fetchData();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-[300px] text-gray-600">
        Loading...
      </div>
    );
  }

  if (data.length === 0) {
    return (
      <div className="flex items-center justify-center h-[300px] text-gray-600">
        No items found.
      </div>
    );
  }

  return (
    <div
      className="
        flex 
        items-start
        justify-end       /* ⬅ push menu to the right */
        w-full 
        h-full
      "
    >
      {/* MENU BOX */}
      <div
        className="
          flex
          bg-white/50
          rounded-2xl
          shadow-xl
          overflow-hidden
          backdrop-blur-sm

          w-[40vw]
          h-[50vh]
        "
      >
        {sections.map((section, index) => {
          const filtered = data.filter(
            (i) => i.type?.toLowerCase() === section.type.toLowerCase()
          );

          return (
            <div
              key={section.title}
              className="
                flex flex-col
                w-1/3
                items-center
                py-6
              "
              style={{
                borderRight:
                  index !== sections.length - 1 ? "1px solid #e5e7eb" : "none",
              }}
            >
              <h2 className="text-xl font-semibold mb-4 text-gray-900">
                {section.title}
              </h2>

              <div
                className="
                  grid grid-cols-1
                  gap-4
                  w-full
                  px-4
                  overflow-y-auto
                  scrollbar-thin
                  scrollbar-thumb-gray-400
                  scrollbar-track-transparent
                "
                style={{ maxHeight: "90%" }}
              >
                {filtered.map((item) => {
                  const isActive = hoveredItem === item.id;

                  return (
                    <motion.div
                      key={item.id}
                      onMouseEnter={() => setHoveredItem(item.id)}
                      onMouseLeave={() => setHoveredItem(null)}
                      className="
                        rounded-xl
                        bg-white/30
                        p-4
                        shadow-sm
                        bg-gray-50
                        flex flex-col
                        cursor-pointer
                        transition-all duration-300
                        border border-gray-200
                      "
                    >
                      <div className="font-medium text-gray-900">
                        {item.title}
                      </div>

                      <AnimatePresence>
                        {isActive && (
                          <motion.p
                            key="desc"
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: "auto" }}
                            exit={{ opacity: 0, height: 0 }}
                            transition={{ duration: 0.3 }}
                            className="text-sm text-gray-700 mt-2"
                          >
                            {item.description}
                          </motion.p>
                        )}
                      </AnimatePresence>
                    </motion.div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
