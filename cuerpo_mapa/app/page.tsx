"use client";

import { motion, AnimatePresence } from "framer-motion";
import { interactionPoints } from "@/data/points";
import { sketchMap } from "@/data/sketchMap";
import { useZoom } from "@/hooks/useZoom";
import ZoomPanel from "@/components/ZoomPanel";
import { useState, useRef, useEffect } from "react";
import MediaMenuPage from "@/components/references";
import About from "@/components/about";

export default function HomePage() {
  const {
    zoomed,
    zoomTarget,
    showDots,
    activeSketch,
    panelSettings,
    beginZoomIn,
    beginZoomOut,
    handleAnimationComplete,
  } = useZoom();

  const [showWelcome, setShowWelcome] = useState(true);
  const [menuOpen, setMenuOpen] = useState(false);
  const [aboutOpen, setAboutOpen] = useState(false);

  const exportRef = useRef<HTMLDivElement | null>(null);

  const panelAnimation = {
    initial: { opacity: 0, x: 80 },
    animate: { opacity: 1, x: 0 },
    exit: { opacity: 0, x: 80 },
    transition: { duration: 0.4 },
  };

  return (
    <div
      ref={exportRef}
      id="captureArea"
      className="relative w-full h-screen overflow-hidden bg-black"
    >
      {/* WELCOME SCREEN */}
      <AnimatePresence>
        {showWelcome && (
          <motion.div
            className="relative w-full h-full inset-0 z-[999] flex 
            items-center justify-center bg-black/80 text-white"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.8 }}
          >
            <div className="flex flex-row items-center gap-[20%]">
              <div className="text-left">
                <h1 className="text-[16vh] leading-[0.9] font-bold mb-6">
                  CUERPO <br />
                  MAPA
                </h1>

                <p className="text-[3vh] mb-8 opacity-80">
                  Espacio interactivo sobre mujeres,<br />
                  resistencias y paz en el conflicto<br />
                  armado de Colombia
                </p>
              </div>

              <button
                onClick={() => setShowWelcome(false)}
                className="transition hover:opacity-80"
              >
                <img
                  src="/portada/button.png"
                  alt="Enter"
                  className="w-[40vh] h-auto"
                />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* MENU & ABOUT BUTTONS */}
      {!showWelcome && (
        <>
          <button
            onClick={() => {
              setMenuOpen(!menuOpen);
              setAboutOpen(false);
            }}
            className="fixed z-[500] text-white text-4xl"
            style={{ top: "11vh", right: "2.5vw" }}
          >
            ⋮
          </button>

          <button
            onClick={() => {
              setAboutOpen(!aboutOpen);
              setMenuOpen(false);
            }}
            className="fixed z-[500] text-white text-3xl"
            style={{ top: "18vh", right: "2.5vw" }}
          >
            ?
          </button>
        </>
      )}

      {/* MENU OVERLAY */}
      <AnimatePresence>
        {menuOpen && (
          <motion.div
            className="fixed inset-0 z-[300] bg-black/60 backdrop-blur-md flex justify-end"
            {...panelAnimation}
          >
            <div className="pt-[10vh] pr-[7vw]">
              <MediaMenuPage />
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ABOUT OVERLAY */}
      <AnimatePresence>
        {aboutOpen && (
          <motion.div
            className="fixed inset-0 z-[300] bg-black/60 backdrop-blur-md flex justify-end"
            {...panelAnimation}
          >
            <div className="pt-[18vh] pr-[7vw]">
              <About />
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* BACKGROUND IMAGE */}
      <div className="absolute inset-0 w-full h-full overflow-hidden">
        <motion.img
          id="bodyImage"
          src="/portada/fondo.svg"
          alt="Interactive Body"
          className="absolute inset-0 w-full h-full object-cover object-center"
          animate={
            zoomed
              ? {
                  scale: zoomTarget.scale,
                  x: `calc(50% - ${zoomTarget.x})`,
                  y: `calc(50% - ${zoomTarget.y})`,
                }
              : { scale: 1, x: 0, y: 0 }
          }
          transition={{ duration: 0.8, ease: "easeInOut" }}
          onAnimationComplete={handleAnimationComplete}
        />

        {/* DOTS - NOW WITH PERFECT MAPPING */}
        <AnimatePresence>
          {showDots &&
            interactionPoints.map((p) => (
              <DotWithCoverMapping
                key={p.id}
                xPercent={parseFloat(p.x)}
                yPercent={parseFloat(p.y)}
                onClick={() =>
                  beginZoomIn(
                    p.zoomX,
                    p.zoomY,
                    p.zoomScale,
                    p.sketch,
                    p.panelWidth ?? "40%",
                    p.panelHeight ?? "40%",
                    p.panelOpacity ?? 1,
                    p.panelLeft ?? "50%",
                    p.panelTop ?? "50%"
                  )
                }
              />
            ))}
        </AnimatePresence>
      </div>

      {/* SKETCH PANEL */}
      <AnimatePresence>
        {zoomed && activeSketch && (
          <div className="fixed inset-0 z-30">
            <ZoomPanel
              width={panelSettings.width}
              height={panelSettings.height}
              opacity={panelSettings.opacity}
              left={panelSettings.left}
              top={panelSettings.top}
            >
              {(() => {
                const SketchComponent = sketchMap[activeSketch];
                return <SketchComponent />;
              })()}
            </ZoomPanel>
          </div>
        )}
      </AnimatePresence>

      {/* BACK & EXPORT */}
      {zoomed && (
        <>
          <button
            onClick={beginZoomOut}
            className="fixed bottom-6 right-6 z-50 px-4 py-2 rounded-lg shadow-lg bg-white text-black"
          >
            Back
          </button>

          <button className="fixed bottom-6 left-6 z-50 px-4 py-2 rounded-lg shadow-lg bg-green-500 text-white">
            📥 Export
          </button>
        </>
      )}
    </div>
  );
}

/* ----------------------------------------------------- */
/* DOT COMPONENT WITH PERFECT OBJECT-COVER COMPENSATION  */
/* ----------------------------------------------------- */

function DotWithCoverMapping({
  xPercent,
  yPercent,
  onClick,
}: {
  xPercent: number;
  yPercent: number;
  onClick: () => void;
}) {
  const [pos, setPos] = useState({ left: 0, top: 0 });

  const updatePosition = () => {
    const img = document.getElementById("bodyImage") as HTMLImageElement;
    if (!img) return;

    const containerW = img.clientWidth;
    const containerH = img.clientHeight;

    const naturalW = 1920;
    const naturalH = 1080;
    const naturalRatio = naturalW / naturalH;
    const containerRatio = containerW / containerH;

    let renderW, renderH;

    if (containerRatio > naturalRatio) {
      renderW = containerW;
      renderH = containerW / naturalRatio;
    } else {
      renderH = containerH;
      renderW = containerH * naturalRatio;
    }

    const cropX = (containerW - renderW) / 2;
    const cropY = (containerH - renderH) / 2;

    const px = (xPercent / 100) * renderW + cropX;
    const py = (yPercent / 100) * renderH + cropY;

    setPos({ left: px, top: py });
  };

  useEffect(() => {
    updatePosition();
    window.addEventListener("resize", updatePosition);
    return () => window.removeEventListener("resize", updatePosition);
  }, []);

  return (
    <motion.div
      className="absolute bg-red-500 rounded-full cursor-pointer shadow-lg"
      style={{
        width: "0.35vw",
        height: "0.35vw",
        left: pos.left,
        top: pos.top,
        transform: "translate(-50%, -50%)",
      }}
      onClick={onClick}
    />
  );
}
