"use client";

import dynamic from "next/dynamic";
import { useRef } from "react";

const Sketch = dynamic(() => import("react-p5"), { ssr: false });

export default function ParallaxSketch() {
  let bg1, bg2, bg3;
  const scrollX = useRef(0); // 👈 persistent scroll state
  const maxScroll = useRef(0);
  const speed1 = 0.3, speed2 = 0.6, speed3 = 1.0;
  const zoom = 1.5;

  const preload = (p5) => {
    bg1 = p5.loadImage("/background1.png");
    bg2 = p5.loadImage("/background2.png");
    bg3 = p5.loadImage("/background3.png");
  };

  const setup = (p5, canvasParentRef) => {
    p5.createCanvas(p5.windowWidth, p5.windowHeight).parent(canvasParentRef);
  };

  const draw = (p5) => {
    p5.background(0);

    if (bg3 && bg3.width > 0) {
      const scaleFactor = (p5.height / bg3.height) * zoom;
      const displayWidth = bg3.width * scaleFactor;
      maxScroll.current = Math.max(0, displayWidth - p5.width);
    }

    // keep within bounds
    //scrollX.current = p5.constrain(scrollX.current, 0, maxScroll.current);

    // draw layers
    drawLayer(p5, bg1, scrollX.current * speed1);
    drawLayer(p5, bg2, scrollX.current * speed2);
    drawLayer(p5, bg3, scrollX.current * speed3);
  };

  const drawLayer = (p5, img, offset) => {
    if (!img) return;
    const scaleFactor = (p5.height / img.height) * zoom;
    const displayWidth = img.width * scaleFactor;
    const displayHeight = p5.height;
    p5.image(img, -offset, 0, displayWidth, displayHeight);
  };

  const mouseWheel = (p5, event) => {
    event.preventDefault(); // stops native browser handling
    scrollX.current += event.deltaX; // 👈 accumulate scroll
    return false;
  };

  const windowResized = (p5) => {
    p5.resizeCanvas(p5.windowWidth, p5.windowHeight);
  };

  return (
    <Sketch
      preload={preload}
      setup={setup}
      draw={draw}
      mouseWheel={mouseWheel}
      windowResized={windowResized}
    />
  );
}
