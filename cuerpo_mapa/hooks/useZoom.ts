"use client";

import { useState } from "react";
import type { SketchName } from "@/data/points";

export function useZoom() {
  const [zoomed, setZoomed] = useState(false);
  const [zoomingOutDone, setZoomingOutDone] = useState(true);

  const [zoomTarget, setZoomTarget] = useState({
    x: "50%",
    y: "50%",
    scale: 1,
  });

  const [activeSketch, setActiveSketch] = useState<SketchName | null>(null);

  const [panelSettings, setPanelSettings] = useState({
    width: "40%",
    height: "40%",
    opacity: 1,
    left: "50%",
    top: "50%",
  });

  // 🟢 FIXED ORDER
  const beginZoomIn = (
    x: string,
    y: string,
    scale: number,
    sketch: SketchName,
    panelWidth?: string,
    panelHeight?: string,
    panelOpacity?: number, // <-- now 7th
    panelLeft?: string,    // <-- now 8th
    panelTop?: string      // <-- now 9th
  ) => {
    setZoomingOutDone(false);
    setActiveSketch(sketch);

    setZoomTarget({ x, y, scale });

    setPanelSettings({
      width: panelWidth ?? "40%",
      height: panelHeight ?? "40%",
      opacity: panelOpacity ?? 1,
      left: panelLeft ?? "50%",
      top: panelTop ?? "50%",
    });

    setTimeout(() => setZoomed(true), 150);
  };

  const beginZoomOut = () => {
    setZoomingOutDone(false);
    setZoomed(false);
    setActiveSketch(null);
  };

  const handleAnimationComplete = () => {
    if (!zoomed) setZoomingOutDone(true);
  };

  return {
    zoomed,
    zoomTarget,
    activeSketch,
    showDots: !zoomed && zoomingOutDone,
    panelSettings,
    beginZoomIn,
    beginZoomOut,
    handleAnimationComplete,
  };
}
