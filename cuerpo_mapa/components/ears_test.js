"use client";

import dynamic from "next/dynamic";
import { useState, useRef } from "react";

// Only run react-p5 on the client
const Sketch = dynamic(() => import("react-p5"), { ssr: false });

export default function earSketch() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [p5Instance, setP5Instance] = useState(null);
  const [soundReady, setSoundReady] = useState(false);
  const isPlayingRef = useRef(false);
  const soundRef = useRef(null);
  const radioImgRef = useRef(null);
  const buttons = useRef({});
  const audioFiles = ["/audio/song1.wav", "/audio/song2.wav", "/audiosong3.wav"];

  // ✅ Dynamically load p5.sound from CDN
  const preload = async () => {
    if (!window.soundLoaded) {
      await new Promise((resolve, reject) => {
        const s = document.createElement("script");
        s.src =
          "https://cdn.jsdelivr.net/npm/p5@1.9.0/lib/addons/p5.sound.min.js";
        s.onload = () => {
          window.soundLoaded = true;
          console.log("✅ p5.sound loaded");
          resolve();
        };
        s.onerror = reject;
        document.body.appendChild(s);
      });
    }
  };

  const setup = (p5, canvasParentRef) => {
    p5.createCanvas(400, 400).parent(canvasParentRef);
    p5.textAlign(p5.CENTER, p5.CENTER);
    setP5Instance(p5);

    buttons.current = {
      prev: { x: 130, y: 320, r: 20 },
      play: { x: 170, y: 320, r: 20 },
      pause: { x: 210, y: 320, r: 20 },
      next: { x: 250, y: 320, r: 20 },
    };

    radioImgRef.current = p5.loadImage("/images/radio.jpg");
  };

  const draw = (p5) => {
    p5.background(240);

    if (radioImgRef.current) {
      p5.image(radioImgRef.current, 50, 50, 300, 200);
    }

    if (!soundReady) {
      p5.fill(50);
      p5.textSize(14);
      p5.text("Tap 'Start Radio' to enable sound 🎶", 200, 200);
      return;
    }

    p5.fill(0);
    Object.values(buttons.current).forEach((b) =>
      p5.ellipse(b.x, b.y, b.r * 2)
    );
    p5.fill(255);
    p5.textSize(14);
    p5.text("⏮", buttons.current.prev.x, buttons.current.prev.y);
    p5.text("▶️", buttons.current.play.x, buttons.current.play.y);
    p5.text("⏸", buttons.current.pause.x, buttons.current.pause.y);
    p5.text("⏭", buttons.current.next.x, buttons.current.next.y);

    p5.fill(50);
    p5.textSize(12);
    p5.text(
      `Now playing: ${audioFiles[currentIndex].split("/").pop()}`,
      200,
      370
    );
  };

  const mousePressed = (p5) => {
    if (!soundReady) return;
    for (let key in buttons.current) {
      const b = buttons.current[key];
      const d = p5.dist(p5.mouseX, p5.mouseY, b.x, b.y);
      if (d < b.r) handleButton(key);
    }
  };

  const handleButton = (action) => {
    const p5 = p5Instance;
    if (!p5 || !window.p5?.SoundFile) {
      console.warn("p5.sound not ready yet");
      return;
    }

    if (action === "play") {
      if (!isPlayingRef.current) {
        if (!soundRef.current) {
          soundRef.current = new window.p5.SoundFile(
            audioFiles[currentIndex],
            () => soundRef.current.play()
          );
        } else {
          soundRef.current.play();
        }
        isPlayingRef.current = true;
      }
    } else if (action === "pause") {
      if (isPlayingRef.current && soundRef.current) {
        soundRef.current.pause();
        isPlayingRef.current = false;
      }
    } else if (action === "next" || action === "prev") {
      if (soundRef.current) soundRef.current.stop();

      const newIndex =
        action === "next"
          ? (currentIndex + 1) % audioFiles.length
          : (currentIndex - 1 + audioFiles.length) % audioFiles.length;

      setCurrentIndex(newIndex);

      soundRef.current = new window.p5.SoundFile(audioFiles[newIndex], () => {
        if (isPlayingRef.current) soundRef.current.play();
      });
    }
  };

  const startRadio = async () => {
  try {
    await preload();
    await window.p5.prototype.userStartAudio();
    if (window.p5.soundOut === undefined) new window.p5.SoundFile();
    setSoundReady(true);
    console.log("🎧 Audio context resumed, sound ready!");
  } catch (err) {
    console.error("Failed to start audio:", err);
  }
};



  return (
    <div style={{ position: "relative", width: 400, height: 400 }}>
      <Sketch
        preload={preload}
        setup={setup}
        draw={draw}
        mousePressed={mousePressed}
      />
      {!soundReady && (
        <button
          onClick={startRadio}
          style={{
            position: "absolute",
            left: "50%",
            bottom: 20,
            transform: "translateX(-50%)",
            background: "#333",
            color: "white",
            border: "none",
            borderRadius: 8,
            padding: "10px 16px",
            cursor: "pointer",
          }}
        >
          🎵 Start Radio
        </button>
      )}
    </div>
  );
}
