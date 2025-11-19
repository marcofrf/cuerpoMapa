"use client";

import dynamic from "next/dynamic";
import { useRef, useState, useEffect } from "react";
import { createClient } from "@supabase/supabase-js";

const Sketch = dynamic(() => import("react-p5"), { ssr: false });

// --- supabase setup ---
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

export default function handLeftSketch() {
  const postcardImg = useRef(null);
  const [ready, setReady] = useState(false);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");

  // --- writing state ---
  const lines = useRef([""]);
  const currentLine = useRef(0);
  const totalChars = useRef(0);

  // --- cursor state ---
  const cursorVisible = useRef(true);
  const lastBlink = useRef(0);

  // --- base postcard design size ---
  const BASE_WIDTH = 800;
  const BASE_HEIGHT = 600;

  // --- base layout (scaled automatically) ---
  const maxLines = 4;
  const lineSpacing = 40;
  const startX = 120;
  const startY = 250;
  const lineLength = 500;
  const maxChars = 300;

  // --- send button ---
  const buttonX = 300;
  const buttonY = 500;
  const buttonW = 200;
  const buttonH = 40;

  const scaleRef = useRef(1);
  const p5ref = useRef(null);

  // PRELOAD IMAGE
  const preload = (p5) => {
    postcardImg.current = p5.loadImage("/images/postcard.png", () =>
      setReady(true)
    );
  };

  // SETUP CANVAS USING WRAPPER WIDTH
  const setup = (p5, parent) => {
    const wrapper = document.getElementById("postcard-wrapper");
    const w = wrapper.clientWidth;
    const h = (w / BASE_WIDTH) * BASE_HEIGHT;

    scaleRef.current = w / BASE_WIDTH;
    p5.createCanvas(w, h).parent(parent);

    p5.textFont("Courier New");
    p5.textSize(20);
    p5.textAlign(p5.LEFT, p5.BASELINE);

    p5ref.current = p5;
  };

  // DRAW EVERYTHING (SCALED)
  const draw = (p5) => {
    if (!ready || !postcardImg.current) return;

    p5.background(255);

    p5.push();
    p5.scale(scaleRef.current);

    // postcard
    p5.image(postcardImg.current, 0, 0, BASE_WIDTH, BASE_HEIGHT);

    // writing lines
    p5.stroke(180);
    for (let i = 0; i < maxLines; i++) {
      const y = startY + i * lineSpacing;
      p5.line(startX, y + 5, startX + lineLength, y + 5);
    }

    // text
    p5.noStroke();
    p5.textFont("Courier New");
    p5.textSize(20);

    for (let i = 0; i < lines.current.length; i++) {
      p5.text(lines.current[i], startX, startY + i * lineSpacing);
    }

    // blinking cursor
    const now = p5.millis();
    if (now - lastBlink.current > 500) {
      cursorVisible.current = !cursorVisible.current;
      lastBlink.current = now;
    }

    const currentText = lines.current[currentLine.current] || "";
    const cursorX = startX + p5.textWidth(currentText);
    const cursorY = startY + currentLine.current * lineSpacing;

    if (cursorVisible.current) {
      p5.stroke(0);
      p5.strokeWeight(1.5);
      p5.line(cursorX, cursorY - 18, cursorX, cursorY + 4);
    }

    // char counter
    p5.noStroke();
    p5.fill(100);
    p5.textSize(14);
    p5.textAlign(p5.RIGHT);
    p5.text(`${totalChars.current}/${maxChars}`, BASE_WIDTH - 30, BASE_HEIGHT - 20);

    // SEND BUTTON
    p5.fill(70, 130, 180);
    p5.stroke(40, 90, 140);
    p5.strokeWeight(2);
    p5.rect(buttonX, buttonY, buttonW, buttonH, 8);

    p5.noStroke();
    p5.fill(255);
    p5.textAlign(p5.CENTER, p5.CENTER);
    p5.text("Send Message", buttonX + buttonW / 2, buttonY + buttonH / 2);

    p5.pop();
  };

  // CLICK HANDLER WITH SCALED COORDINATES
  const mousePressed = (p5) => {
    const s = scaleRef.current;

    const mx = p5.mouseX / s;
    const my = p5.mouseY / s;

    if (
      mx > buttonX &&
      mx < buttonX + buttonW &&
      my > buttonY &&
      my < buttonY + buttonH
    ) {
      handleSave();
    }
  };

  // KEYBOARD INPUT
  useEffect(() => {
    const handleKeyDown = (e) => {
      const p5 = p5ref.current;
      if (!p5) return;

      if (e.metaKey || e.ctrlKey || e.altKey) return;
      e.preventDefault();

      const lineIndex = currentLine.current;
      const line = lines.current[lineIndex];

      if (
        totalChars.current >= maxChars &&
        e.key !== "Backspace" &&
        e.key !== "Enter"
      )
        return;

      if (e.key === "Enter") {
        if (currentLine.current < maxLines - 1) {
          currentLine.current++;
          if (!lines.current[currentLine.current])
            lines.current[currentLine.current] = "";
        }
        return;
      }

      if (e.key === "Backspace") {
        if (line.length > 0) {
          lines.current[lineIndex] = line.slice(0, -1);
          totalChars.current--;
        } else if (currentLine.current > 0) {
          currentLine.current--;
        }
        return;
      }

      if (e.key.length === 1) {
        const newText = line + e.key;
        const margin = 150;
        const textW = p5.textWidth(newText);

        if (textW > lineLength - margin && currentLine.current < maxLines - 1) {
          currentLine.current++;
          lines.current[currentLine.current] = e.key;
        } else if (textW <= lineLength - margin) {
          lines.current[lineIndex] = newText;
        }

        totalChars.current++;
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  // RESIZE WHEN SCREEN OR WRAPPER CHANGES
  const windowResized = (p5) => {
    const wrapper = document.getElementById("postcard-wrapper");
    if (!wrapper) return;

    const w = wrapper.clientWidth;
    const h = (w / BASE_WIDTH) * BASE_HEIGHT;

    scaleRef.current = w / BASE_WIDTH;
    p5.resizeCanvas(w, h);
  };

  // FORCE RESIZE ON MOUNT + ORIENTATION CHANGE
  useEffect(() => {
    const p5 = p5ref.current;
    if (!p5) return;

    const resize = () => {
      const wrapper = document.getElementById("postcard-wrapper");
      if (!wrapper) return;

      const w = wrapper.clientWidth;
      const h = (w / BASE_WIDTH) * BASE_HEIGHT;

      scaleRef.current = w / BASE_WIDTH;
      p5.resizeCanvas(w, h);
    };

    resize();

    window.addEventListener("resize", resize);
    window.addEventListener("orientationchange", resize);

    return () => {
      window.removeEventListener("resize", resize);
      window.removeEventListener("orientationchange", resize);
    };
  }, []);

  // SAVE
  const handleSave = async () => {
    const fullText = lines.current.join(" ").trim();
    if (!fullText) {
      setMessage("✏️ Nothing written yet!");
      return;
    }

    setSaving(true);
    setMessage("");

    const { error } = await supabase.from("postcards").insert([
      { content: fullText, created_at: new Date().toISOString() },
    ]);

    if (error) {
      console.error(error);
      setMessage("❌ Error saving message");
    } else {
      setMessage("✅ Message saved!");
    }

    setSaving(false);
  };

  return (
    <div className="w-full flex flex-col items-center justify-center">
      <div
        id="postcard-wrapper"
        className="w-[30vw]" /* this controls final size */
      >
        {!ready && (
          <p className="text-gray-700 text-center">✉️ Loading postcard...</p>
        )}

        <Sketch
          preload={preload}
          setup={setup}
          draw={draw}
          mousePressed={mousePressed}
          windowResized={windowResized}
        />
      </div>

      {message && <p className="text-gray-700 mt-3">{message}</p>}
    </div>
  );
}
