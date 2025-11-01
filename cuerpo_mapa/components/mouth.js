"use client";

import dynamic from "next/dynamic";
import { useEffect, useState, useRef } from "react";

// Dynamically import react-p5 (client-only)
const Sketch = dynamic(() => import("react-p5"), { ssr: false });

export default function VoiceSquares() {
  const [ready, setReady] = useState(false);      // p5 + sound loaded
  const [micStarted, setMicStarted] = useState(false); // user allowed mic
  const micRef = useRef(null);
  const squaresRef = useRef([]);

  // Dynamically load p5 and p5.sound only in the browser
  useEffect(() => {
    (async () => {
      const p5mod = await import("p5");
      if (typeof window !== "undefined") {
        window.p5 = p5mod.default || p5mod; // expose globally before loading sound
      }
      await import("p5.sound");
      setReady(true);
    })();
  }, []);

  // Function triggered by the "Tap to start mic" button
  const startMic = async () => {
    try {
      // Resume AudioContext via p5 helper
      if (window.p5 && window.p5.prototype && window.p5.prototype.userStartAudio) {
        await window.p5.prototype.userStartAudio();
      }

      // Resume context manually (for safety)
      const ac =
        (window.p5 && window.p5.sound && window.p5.sound.audiocontext) ||
        (window.getAudioContext && window.getAudioContext());
      if (ac && ac.state === "suspended") {
        await ac.resume();
      }

      // Create mic input from the global p5 (not the instance)
      if (!micRef.current && window.p5 && window.p5.AudioIn) {
        micRef.current = new window.p5.AudioIn();
        await micRef.current.start();

        // Wait a bit to confirm mic access
        setTimeout(() => {
          if (micRef.current.enabled) {
            setMicStarted(true);
          } else {
            alert("Please allow microphone access.");
          }
        }, 400);
      }
    } catch (e) {
      console.error("Error starting mic:", e);
      alert("Could not access microphone. Check permissions.");
    }
  };

  if (!ready) {
    return <div className="text-white text-center p-4">Loading microphone engine…</div>;
  }

  // p5 setup function
  const setup = (p5, canvasParentRef) => {
    p5.createCanvas(p5.windowWidth, p5.windowHeight).parent(canvasParentRef);
    p5.rectMode(p5.CENTER);
    p5.noStroke();
    squaresRef.current = [];
  };

  // p5 draw loop
  const draw = (p5) => {
    p5.background(0, 30); // faint trail

    if (!micStarted || !micRef.current) {
      // Instruction text before mic is started
      p5.push();
      p5.fill(255, 180);
      p5.textAlign(p5.CENTER, p5.CENTER);
      p5.textSize(18);
      p5.text("Tap the mic button to start audio-reactive squares", p5.width / 2, p5.height / 2);
      p5.pop();
    } else {
      const vol = micRef.current.getLevel ? micRef.current.getLevel() : 0;
      const intensity = p5.map(vol, 0, 0.2, 0, 1);
      const spawnCount = p5.int(p5.map(intensity, 0, 1, 0, 12));

      for (let i = 0; i < spawnCount; i++) {
        squaresRef.current.push({
          x: p5.random(p5.width),
          y: p5.random(p5.height),
          size: p5.random(2, 8) * (0.5 + intensity * 4),
          life: 255,
        });
      }
    }

    // Draw and fade squares
    for (let i = squaresRef.current.length - 1; i >= 0; i--) {
      const s = squaresRef.current[i];
      p5.fill(0, 200, 255, s.life);
      p5.rect(s.x, s.y, s.size, s.size);
      s.life -= 4;
      if (s.life <= 0) squaresRef.current.splice(i, 1);
    }
  };

  const windowResized = (p5) => {
    p5.resizeCanvas(p5.windowWidth, p5.windowHeight);
  };

  return (
    <div style={{ position: "relative", width: "100%", height: "100vh" }}>
      <Sketch setup={setup} draw={draw} windowResized={windowResized} />

      {/* Microphone start button / status */}
      {!micStarted ? (
        <button
          onClick={startMic}
          style={{
            position: "absolute",
            right: 18,
            bottom: 18,
            zIndex: 20,
            padding: "10px 14px",
            borderRadius: 10,
            background: "rgba(255,255,255,0.12)",
            color: "white",
            border: "1px solid rgba(255,255,255,0.2)",
            cursor: "pointer",
            backdropFilter: "blur(6px)",
          }}
        >
          🎤 Tap to start mic
        </button>
      ) : (
        <div
          style={{
            position: "absolute",
            right: 18,
            bottom: 18,
            color: "white",
            fontSize: "0.9rem",
            opacity: 0.7,
          }}
        >
          🎧 Listening…
        </div>
      )}
    </div>
  );
}
