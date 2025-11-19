"use client";

import dynamic from "next/dynamic";
import { useRef, useEffect, useState } from "react";

const Sketch = dynamic(() => import("react-p5"), { ssr: false });

export default function MouthSketch() {
  const img = useRef(null);
  const revealed = useRef(null);
  const amplitude = useRef(0);
  const [micReady, setMicReady] = useState(false);

  // 🎤 Microphone setup
  useEffect(() => {
    if (typeof window === "undefined") return;

    async function initMic() {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
        const source = audioCtx.createMediaStreamSource(stream);
        const analyser = audioCtx.createAnalyser();
        analyser.fftSize = 1024;

        const data = new Float32Array(analyser.fftSize);
        source.connect(analyser);

        function updateVol() {
          analyser.getFloatTimeDomainData(data);
          let sum = 0;
          for (let i = 0; i < data.length; i++) sum += data[i] * data[i];
          amplitude.current = Math.sqrt(sum / data.length);
          requestAnimationFrame(updateVol);
        }

        updateVol();
        setMicReady(true);
      } catch (err) {
        console.error("Mic error:", err);
      }
    }

    initMic();
  }, []);

  // 🖼 Load image
  const preload = (p5) => {
    img.current = p5.loadImage("/images/background1.png");
  };

  // 🖼 Canvas matches image EXACTLY, but scales visually
  const setup = (p5, parent) => {
    const w = img.current.width;
    const h = img.current.height;

    const canvas = p5.createCanvas(w, h).parent(parent);

    // ⭐ Scale canvas visually (responsive, no distortion)
    canvas.elt.style.width = "100%";
    canvas.elt.style.height = "100%";
    canvas.elt.style.objectFit = "contain";
    canvas.elt.style.display = "block";

    // Prepare revealed buffer
    revealed.current = p5.createImage(w, h);
    revealed.current.loadPixels();

    for (let i = 0; i < revealed.current.pixels.length; i += 4) {
      revealed.current.pixels[i + 3] = 0; // transparent
    }

    revealed.current.updatePixels();
  };

  // 🎨 Reveal blocks based on mic loudness
  const draw = (p5) => {
    if (!micReady || !img.current || !revealed.current) return;

    const vol = amplitude.current;
    const revealCount = p5.map(vol, 0.01, 0.1, 0, 150, true);

    const block = 5; // ⭐ 5×5 reveal blocks

    img.current.loadPixels();
    revealed.current.loadPixels();

    for (let i = 0; i < revealCount; i++) {
      const x = p5.floor(p5.random(img.current.width / block)) * block;
      const y = p5.floor(p5.random(img.current.height / block)) * block;

      for (let bx = 0; bx < block; bx++) {
        for (let by = 0; by < block; by++) {
          const px = x + bx;
          const py = y + by;
          if (px >= img.current.width || py >= img.current.height) continue;

          const idx = (px + py * img.current.width) * 4;

          revealed.current.pixels[idx] = img.current.pixels[idx];
          revealed.current.pixels[idx + 1] = img.current.pixels[idx + 1];
          revealed.current.pixels[idx + 2] = img.current.pixels[idx + 2];
          revealed.current.pixels[idx + 3] = 255;
        }
      }
    }

    revealed.current.updatePixels();
    p5.image(revealed.current, 0, 0);
  };

  return (
    <div className="w-[80vw] h-[80vh] mx-auto relative bg-transparent flex items-center justify-center">
      {!micReady && (
        <p className="text-white absolute top-2">🎤 Waiting for microphone permission…</p>
      )}
      <Sketch preload={preload} setup={setup} draw={draw} />
    </div>
  );
}
