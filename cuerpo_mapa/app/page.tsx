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

  // We now keep TWO layers:
  // JPG = welcome background
  // SVG = final map background
  const [svgVisible, setSvgVisible] = useState(false); // SVG + dots fade in
  const [jpgVisible, setJpgVisible] = useState(true);  // JPG fades out with welcome

  const exportRef = useRef<HTMLDivElement | null>(null);

  const panelAnimation = {
    initial: { opacity: 0, x: 80 },
    animate: { opacity: 1, x: 0 },
    exit: { opacity: 0, x: 80 },
    transition: { duration: 0.4 },
  };

  // ----------------------------------------
  // WELCOME BUTTON BEHAVIOR
  // ----------------------------------------
  const handleEnter = () => {
    // Step 1 → fade in SVG below everything
    setSvgVisible(true);

    // Step 2 → fade out welcome + JPG together
    setTimeout(() => {
      setJpgVisible(false);
      setShowWelcome(false);
    }, 700); // welcome fades out slightly after SVG begins fading in
  };

  return (
    <div
      ref={exportRef}
      id="captureArea"
      className="relative w-full h-screen overflow-hidden bg-black"
    >

      {/* BACKGROUND LAYER 1 — JPG (FADE OUT WITH WELCOME) */}
      <AnimatePresence>
        {jpgVisible && (
          <motion.img
            key="bg-jpg"
            src="/portada/fondo_solo.jpg"
            className="absolute inset-0 w-full h-full object-cover"
            initial={{ opacity: 1 }}
            animate={{ opacity: jpgVisible ? 1 : 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 1.2, ease: "easeInOut" }}
          />
        )}
      </AnimatePresence>

      {/* BACKGROUND LAYER 2 — SVG (FADE IN UNDERNEATH THE WELCOME) */}
      <motion.img
        key="bg-svg"
        src="/portada/fondo.svg"
        className="absolute inset-0 w-full h-full object-cover"
        initial={{ opacity: 0 }}
        animate={{ opacity: svgVisible ? 1 : 0 }}
        transition={{ duration: 1.2, ease: "easeInOut" }}
      />

      {/* WELCOME SCREEN */}
      <AnimatePresence>
        {showWelcome && (
          <motion.div
            className="absolute inset-0 z-[999] flex items-center justify-center bg-black/70 text-white"
            initial={{ opacity: 1 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 1.1 }}
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

              <button onClick={handleEnter} className="transition hover:opacity-80">
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

      {/* LOGOS (only after welcome is fully gone) */}
      {!showWelcome && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1 }}
          className="fixed top-[2vh] left-[2vw] z-[500] flex gap-4"
        >
          <img src="/portada/logo1.png" className="w-[10vh] h-auto" />
          <img src="/portada/logo2.png" className="w-[10vh] h-auto" />
        </motion.div>
      )}

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

      {/* MENU PANEL */}
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

      {/* ABOUT PANEL */}
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

      {/* DOTS (fade in with SVG) */}
      <AnimatePresence>
        {svgVisible &&
          interactionPoints.map((p) => (
            <motion.div
              key={p.id}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 1.2 }}
            >
              <DotWithCoverMapping
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
            </motion.div>
          ))}
      </AnimatePresence>

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
/* DOT COMPONENT WITH EXACT OBJECT-COVER COORDINATES     */
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
    const img = document.querySelector('img[src="/portada/fondo.svg"]') as HTMLImageElement;
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
