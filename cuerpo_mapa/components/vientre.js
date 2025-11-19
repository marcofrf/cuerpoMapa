"use client";

import dynamic from "next/dynamic";
import { useRef, useState } from "react";

const Sketch = dynamic(() => import("react-p5"), { ssr: false });

export default function MaskDrawingSketch() {
  const p5ref = useRef(null);
  const maskImage = useRef(null);
  const drawingLayer = useRef(null);
  const tempLayer = useRef(null);
  const circleCenter = useRef({ x: 0, y: 0 });
  const circleRadius = useRef(200);
  const lastXPos = useRef({ x: 0, y: 0 });
  const minXSpacing = 25;

  const imageScalePercent = useRef(0.35);

  const [brushColor, setBrushColor] = useState("#0000ff");
  const [isEraser, setIsEraser] = useState(false);
  const [lineType, setLineType] = useState("solid");
  const [brushSize, setBrushSize] = useState(10);

  const redrawBaseImage = (p5) => {
    if (!maskImage.current || !drawingLayer.current) return;

    const img = maskImage.current;
    const newWidth = p5.width * imageScalePercent.current;
    const scale = newWidth / img.width;
    const newHeight = img.height * scale;
    const x = (p5.width - newWidth) / 2;
    const y = (p5.height - newHeight) / 2;

    drawingLayer.current.clear();
    drawingLayer.current.image(img, x, y, newWidth, newHeight);

    circleCenter.current = { x: p5.width / 2, y: p5.height / 2 };
    circleRadius.current = Math.min(newWidth, newHeight) / 2;
  };

  const setup = (p5, canvasParentRef) => {
    const canvas = p5.createCanvas(p5.windowWidth * 0.8, p5.windowHeight * 0.8);
    canvas.parent(canvasParentRef);
    canvas.style("background-color", "transparent");

    drawingLayer.current = p5.createGraphics(p5.width, p5.height);
    tempLayer.current = p5.createGraphics(p5.width, p5.height);

    p5.loadImage("/vientre/bastidor.png", (img) => {
      maskImage.current = img;
      redrawBaseImage(p5);
    });

    p5.noCursor();
    p5ref.current = p5;
  };

  const windowResized = (p5) => {
    p5.resizeCanvas(p5.windowWidth * 0.8, p5.windowHeight * 0.8);
    drawingLayer.current = p5.createGraphics(p5.width, p5.height);
    tempLayer.current = p5.createGraphics(p5.width, p5.height);
    redrawBaseImage(p5);
  };

  const isInsideMask = (p5, x, y) => {
    return p5.dist(x, y, circleCenter.current.x, circleCenter.current.y) <=
      circleRadius.current - brushSize / 2;
  };

  const drawX = (pg, x, y, size, col) => {
    const offset = size / 2;
    pg.stroke(col);
    pg.strokeWeight(brushSize);
    pg.line(x - offset, y - offset, x + offset, y + offset);
    pg.line(x - offset, y + offset, x + offset, y - offset);
  };

  const draw = (p5) => {
    if (!drawingLayer.current || !tempLayer.current) return;

    p5.clear();
    tempLayer.current.clear();
    tempLayer.current.noFill();
    tempLayer.current.stroke(0);
    tempLayer.current.strokeWeight(2);
    tempLayer.current.circle(p5.mouseX, p5.mouseY, brushSize);

    p5.image(drawingLayer.current, 0, 0);
    p5.image(tempLayer.current, 0, 0);

    if (p5.mouseIsPressed) {
      const inside = isInsideMask(p5, p5.mouseX, p5.mouseY);
      const insidePrev = isInsideMask(p5, p5.pmouseX, p5.pmouseY);
      if (!inside || !insidePrev) return;

      const pg = drawingLayer.current;
      const col = isEraser ? 255 : brushColor;

      if (isEraser) {
        pg.stroke(255);
        pg.strokeWeight(brushSize);
        pg.line(p5.pmouseX, p5.pmouseY, p5.mouseX, p5.mouseY);
      } else if (lineType === "solid") {
        pg.stroke(col);
        pg.strokeWeight(brushSize);
        pg.line(p5.pmouseX, p5.pmouseY, p5.mouseX, p5.mouseY);
      } else if (lineType === "dotted") {
        if (p5.frameCount % 3 === 0) {
          pg.stroke(col);
          pg.strokeWeight(brushSize);
          pg.line(p5.pmouseX, p5.pmouseY, p5.mouseX, p5.mouseY);
        }
      } else if (lineType === "x") {
        const dx = p5.mouseX - lastXPos.current.x;
        const dy = p5.mouseY - lastXPos.current.y;
        if (Math.sqrt(dx * dx + dy * dy) > minXSpacing) {
          drawX(pg, p5.mouseX, p5.mouseY, brushSize, col);
          lastXPos.current = { x: p5.mouseX, y: p5.mouseY };
        }
      }
    }
  };

  const resetCanvas = () => {
    drawingLayer.current.clear();
    redrawBaseImage(p5ref.current);
  };

  return (
    <div className="w-full h-full flex flex-col items-center justify-center p-4">
      <Sketch setup={setup} draw={draw} windowResized={windowResized} />

      <div id="ui-panel" className="flex flex-wrap justify-center gap-4 mt-4 items-center bg-black/10 p-4 rounded-xl">
        <input
          type="color"
          value={brushColor}
          onChange={(e) => setBrushColor(e.target.value)}
          disabled={isEraser}
          className="w-10 h-10 border rounded"
        />

        <button onClick={() => setIsEraser(!isEraser)}
          className={`px-4 py-2 rounded-lg shadow ${isEraser ? "bg-red-600" : "bg-green-600"}`}>
          {isEraser ? "🧽 Goma" : "🖌️ Boli"}
        </button>

        <select value={lineType} onChange={(e) => setLineType(e.target.value)} disabled={isEraser}
          className="px-3 py-2 rounded-lg bg-gray-800 border border-gray-600">
          <option value="solid">Línea</option>
          <option value="dotted">Puntos</option>
          <option value="x">x</option>
        </select>

        <label className="flex items-center gap-2">
          Tamaño:
          <input
            type="range"
            min="2"
            max="50"
            value={brushSize}
            onChange={(e) => setBrushSize(+e.target.value)}
          />
          <span>{brushSize}</span>
        </label>

        <button onClick={resetCanvas} className="px-4 py-2 bg-blue-600 rounded-lg shadow">Borrar</button>
      </div>
    </div>
  );
}
