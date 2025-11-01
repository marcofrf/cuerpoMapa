"use client";
import { ReactP5Wrapper } from "@p5-wrapper/react";

export default function VoiceSquares() {
  const sketch = (p) => {
    let mic;
    let squares = [];

    p.setup = () => {
      p.createCanvas(p.windowWidth, p.windowHeight);
      mic = new p5.AudioIn();
      mic.start();
      p.rectMode(p.CENTER);
      p.noStroke();
    };

    p.draw = () => {
      p.background(0, 30);
      const vol = mic.getLevel();
      const intensity = p.map(vol, 0, 0.2, 0, 1);
      const spawnCount = p.int(p.map(intensity, 0, 1, 0, 10));

      for (let i = 0; i < spawnCount; i++) {
        squares.push({
          x: p.random(p.width),
          y: p.random(p.height),
          size: p.random(2, 10) * intensity * 5,
          life: 255,
        });
      }

      for (let i = squares.length - 1; i >= 0; i--) {
        const s = squares[i];
        p.fill(0, 200, 255, s.life);
        p.rect(s.x, s.y, s.size, s.size);
        s.life -= 4;
        if (s.life <= 0) squares.splice(i, 1);
      }
    };

    p.windowResized = () => {
      p.resizeCanvas(p.windowWidth, p.windowHeight);
    };
  };

  return <ReactP5Wrapper sketch={sketch} />;
}
