"use client";

import dynamic from "next/dynamic";
import { useRef, useState } from "react";

const Sketch = dynamic(() => import("react-p5"), { ssr: false });

export default function heartSketch() {
  const heartImg = useRef(null);
  const pulses = useRef([]);
  const pulseTimer = useRef(0);
  const pulsing = useRef(false);
  const scaleFactor = useRef(1);

  const pulseInterval = 2000; // full heartbeat cycle
  const pulseScale = 1.3;
  const pulseLead = 200; // line starts 0.2s before pump

  const prePulseStarted = useRef(false);
  const [ready, setReady] = useState(false);

  const preload = (p5) => {
    heartImg.current = p5.loadImage("/heart/heart.png", () => setReady(true));
  };

  const setup = (p5, canvasParentRef) => {
    p5.createCanvas(p5.windowWidth, p5.windowHeight).parent(canvasParentRef);
    p5.clear();
    p5.imageMode(p5.CENTER);
    p5.textAlign(p5.CENTER, p5.CENTER);
    p5.textSize(16);
    pulseTimer.current = p5.millis();
  };

  const draw = (p5) => {
    if (!ready || !heartImg.current) return;
    p5.clear();

    const now = p5.millis();
    const elapsed = now - pulseTimer.current;

    // 🔹 Start line BEFORE the heart pulses
    if (!prePulseStarted.current && elapsed > pulseInterval - pulseLead) {
      prePulseStarted.current = true;
      pulses.current.push(new Pulse(p5, p5.width / 2, p5.height / 2));
    }

    // 💓 Heart pulse at pulseInterval
    if (elapsed > pulseInterval) {
      pulseTimer.current = now;
      pulsing.current = true;
      scaleFactor.current = pulseScale;

      // Prepare for next cycle
      prePulseStarted.current = false;
    }

    // 💓 animate heart pulsing
    if (pulsing.current) {
      scaleFactor.current -= 0.02;
      if (scaleFactor.current <= 1) {
        scaleFactor.current = 1;
        pulsing.current = false;
      }
    }

    // 🩸 draw pulses behind
    for (let i = pulses.current.length - 1; i >= 0; i--) {
      const p = pulses.current[i];
      p.update();
      p.show();
      if (p.isDead()) pulses.current.splice(i, 1);
    }

    // 🫀 draw heart (responsive with aspect ratio)
    p5.push();
    p5.translate(p5.width / 2, p5.height / 2);
    p5.scale(scaleFactor.current);

    const img = heartImg.current;
    const imgW = img.width;
    const imgH = img.height;
    const ratio = imgW / imgH;

    const baseSize = Math.min(p5.width, p5.height) * 0.33;

    let drawW, drawH;
    if (ratio > 1) {
      drawW = baseSize;
      drawH = baseSize / ratio;
    } else {
      drawH = baseSize;
      drawW = baseSize * ratio;
    }

    p5.image(img, 0, 0, drawW, drawH);
    p5.pop();
  };

  // ---- Pulse class ----
  class Pulse {
    constructor(p5, x, y) {
      this.p5 = p5;
      this.path = [{ x, y }];
      this.baseAngle = p5.random(p5.TWO_PI);
      this.speed = 2.2;
      this.noiseOffset = p5.random(1000);
      this.text = "I'm pulsing";
      this.spacing = 10;
      this.visibleLength = 0;
      this.alpha = 255;
      this.finished = false;
      this.offsetRadius = 70;
      this.textTravel = 0;

      if (Math.abs(Math.sin(this.baseAngle)) > 0.8) {
        this.baseAngle = p5.random(-p5.PI / 3, p5.PI / 3);
        if (p5.random() < 0.5) this.baseAngle += p5.PI;
      }
    }

    update() {
      const p5 = this.p5;
      const last = this.path[this.path.length - 1];

      const curveAngle =
        this.baseAngle +
        p5.map(p5.noise(this.noiseOffset), 0, 1, -p5.PI / 3, p5.PI / 3);
      this.noiseOffset += 0.015;

      const newX = last.x + Math.cos(curveAngle) * this.speed;
      const newY = last.y + Math.sin(curveAngle) * this.speed;
      this.path.push({ x: newX, y: newY });

      this.visibleLength += this.speed;
      this.textTravel += this.speed;

      const end = this.path[this.path.length - 1];
      if (end.x < 0 || end.x > p5.width || end.y < 0 || end.y > p5.height) {
        this.alpha -= 5;
      }
      if (this.alpha <= 0) this.finished = true;
    }

    getPointAtDistance(dist) {
      const p5 = this.p5;
      let total = 0;
      for (let i = 0; i < this.path.length - 1; i++) {
        const a = this.path[i];
        const b = this.path[i + 1];
        const d = p5.dist(a.x, a.y, b.x, b.y);
        if (total + d >= dist) {
          const t = (dist - total) / d;
          return {
            x: p5.lerp(a.x, b.x, t),
            y: p5.lerp(a.y, b.y, t),
            angle: Math.atan2(b.y - a.y, b.x - a.x),
          };
        }
        total += d;
      }
      const end = this.path[this.path.length - 1];
      return { x: end.x, y: end.y, angle: 0 };
    }

    show() {
      const p5 = this.p5;
      const startOffset = this.offsetRadius;
      const totalVisible = this.visibleLength;

      p5.push();
      p5.noFill();
      p5.stroke(255, 0, 0, this.alpha);
      p5.strokeWeight(4);
      p5.strokeJoin(p5.ROUND);
      p5.strokeCap(p5.ROUND);
      p5.beginShape();

      let totalDist = 0;
      for (let i = 0; i < this.path.length - 1; i++) {
        const a = this.path[i];
        const b = this.path[i + 1];
        const d = p5.dist(a.x, a.y, b.x, b.y);

        if (totalDist + d > totalVisible) {
          const t = (totalVisible - totalDist) / d;
          const x = p5.lerp(a.x, b.x, t);
          const y = p5.lerp(a.y, b.y, t);
          if (totalVisible > startOffset) p5.vertex(x, y);
          break;
        } else if (totalDist > startOffset) {
          p5.vertex(a.x, a.y);
        }
        totalDist += d;
      }
      p5.endShape();
      p5.pop();

      // text
      p5.push();
      p5.fill(255, 0, 0, this.alpha);
      p5.noStroke();
      p5.textSize(20);

      const letterOffset = -10;
      const { angle: startAngle } = this.getPointAtDistance(startOffset + 1);
      const facingLeft = Math.cos(startAngle) < 0;

      const chars = facingLeft ? [...this.text].reverse() : [...this.text];

      for (let i = 0; i < chars.length; i++) {
        const dist = startOffset + i * this.spacing + this.textTravel * 0.5;
        if (dist > totalVisible) break;

        const { x, y, angle } = this.getPointAtDistance(dist);
        if (x < 0 || x > p5.width || y < 0 || y > p5.height) continue;

        p5.push();
        p5.translate(x, y);

        if (facingLeft) {
          p5.rotate(angle + p5.PI);
        } else {
          p5.rotate(angle);
        }

        p5.text(chars[i], 0, letterOffset);
        p5.pop();
      }

      p5.pop();
    }

    isDead() {
      return this.finished;
    }
  }

  // responsive resize
  const windowResized = (p5) => {
    p5.resizeCanvas(p5.windowWidth, p5.windowHeight);
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-transparent">
      {!ready && (
        <p className="text-gray-700 mb-4 absolute">🫀 Loading heart...</p>
      )}
      <Sketch
        preload={preload}
        setup={setup}
        draw={draw}
        windowResized={windowResized}
      />
    </div>
  );
}
