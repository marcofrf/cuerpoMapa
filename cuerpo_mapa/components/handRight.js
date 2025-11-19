"use client";

import dynamic from "next/dynamic";
import { useRef, useState, useEffect } from "react";
import { createClient } from "@supabase/supabase-js";

const Sketch = dynamic(() => import("react-p5"), { ssr: false });

// Supabase setup
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

export default function handRightSketch() {
  const postcardImg = useRef(null);
  const [ready, setReady] = useState(false);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("✉️ Loading postcard...");
  const [content, setContent] = useState("");

  // BASE postcard size (used for scaling)
  const BASE_WIDTH = 800;
  const BASE_HEIGHT = 600;

  // layout
  const maxLines = 4;
  const lineSpacing = 40;
  const startX = 120;
  const startY = 250;
  const lineLength = 500;

  const scaleRef = useRef(1);
  const p5ref = useRef(null);

  // PRELOAD postcard
  const preload = (p5) => {
    postcardImg.current = p5.loadImage("/images/postcard.png", () =>
      setReady(true)
    );
  };

  // Fetch postcard
  const fetchRandomPostcard = async () => {
    setLoading(true);
    setMessage("✉️ Loading postcard...");

    try {
      const { data, error } = await supabase.from("postcards").select("content");

      if (error) throw error;

      if (data.length > 0) {
        const random = data[Math.floor(Math.random() * data.length)];
        setContent(random.content || "");
        setMessage("");
      } else {
        setMessage("📭 No postcards saved yet.");
      }
    } catch (err) {
      console.error(err);
      setMessage("❌ Error fetching postcard.");
    }

    setLoading(false);
  };

  useEffect(() => {
    fetchRandomPostcard();
  }, []);

  // SETUP responsive canvas
  const setup = (p5, parent) => {
    const wrapper = document.getElementById("postcard-wrapper-right");
    const w = wrapper.clientWidth;
    const h = (w / BASE_WIDTH) * BASE_HEIGHT;

    scaleRef.current = w / BASE_WIDTH;
    p5.createCanvas(w, h).parent(parent);

    p5.textFont("Courier New");
    p5.textSize(20);
    p5.textAlign(p5.LEFT, p5.BASELINE);

    p5ref.current = p5;
  };

  // DRAW postcard, lines, and wrapped text
  const draw = (p5) => {
    if (!ready || !postcardImg.current) return;

    p5.background(255);

    p5.push();
    p5.scale(scaleRef.current);

    // draw postcard
    p5.image(postcardImg.current, 0, 0, BASE_WIDTH, BASE_HEIGHT);

    // writing lines
    p5.stroke(180);
    for (let i = 0; i < maxLines; i++) {
      const y = startY + i * lineSpacing;
      p5.line(startX, y + 5, startX + lineLength, y + 5);
    }

    // draw wrapped postcard text
    if (content) {
      const words = content.split(" ");
      const linesArr = [];
      let currentLine = "";

      for (let word of words) {
        const test = currentLine ? currentLine + " " + word : word;
        const w = p5.textWidth(test);

        if (w > lineLength - 15 && linesArr.length < maxLines - 1) {
          linesArr.push(currentLine);
          currentLine = word;
        } else {
          currentLine = test;
        }
      }
      linesArr.push(currentLine);

      p5.noStroke();
      p5.fill(0);

      for (let i = 0; i < linesArr.length; i++) {
        p5.text(linesArr[i], startX, startY + i * lineSpacing);
      }
    }

    p5.pop();
  };

  // RESPONSIVE RESIZING
  const windowResized = (p5) => {
    const wrapper = document.getElementById("postcard-wrapper-right");
    if (!wrapper) return;

    const w = wrapper.clientWidth;
    const h = (w / BASE_WIDTH) * BASE_HEIGHT;

    scaleRef.current = w / BASE_WIDTH;
    p5.resizeCanvas(w, h);
  };

  // Recalculate size on mount/orientation
  useEffect(() => {
    const resize = () => {
      if (!p5ref.current) return;

      const wrapper = document.getElementById("postcard-wrapper-right");
      const w = wrapper.clientWidth;
      const h = (w / BASE_WIDTH) * BASE_HEIGHT;

      scaleRef.current = w / BASE_WIDTH;
      p5ref.current.resizeCanvas(w, h);
    };

    window.addEventListener("resize", resize);
    window.addEventListener("orientationchange", resize);

    return () => {
      window.removeEventListener("resize", resize);
      window.removeEventListener("orientationchange", resize);
    };
  }, []);

  return (
    <div className="w-full flex flex-col items-center justify-center">

      <div
        id="postcard-wrapper-right"
        className="w-[30vw]" // same sizing as left version
      >
        <Sketch
          preload={preload}
          setup={setup}
          draw={draw}
          windowResized={windowResized}
        />
      </div>

      <button
        onClick={fetchRandomPostcard}
        disabled={loading}
        className="mt-4 px-4 py-2 bg-blue-500 text-white rounded-lg shadow hover:bg-blue-600 disabled:opacity-50"
      >
        {loading ? "Loading..." : "Show Another"}
      </button>

      {message && <p className="text-gray-700 mt-2">{message}</p>}
    </div>
  );
}
