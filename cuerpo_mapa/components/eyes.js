"use client";
import dynamic from "next/dynamic";
import { useEffect, useRef, useState } from "react";

// Safe dynamic import for react-p5
const Sketch = dynamic(() => import("react-p5").then((m) => m.default || m), {
  ssr: false,
});

export default function EyesSketch({
  imagesPath = "/eyes",
  imageCount = 30,
  initialScale = 0.35,
  minScale = 0.06,
  maxScale = 4,
} = {}) {
  // itemsRef stores BOTH palette items (first N) and clones (rest)
  const itemsRef = useRef([]);
  const p5Ref = useRef(null);
  const containerRef = useRef(null);
  const resizeObserverRef = useRef(null);
  const loadedImagesRef = useRef(false);

  const selectedIndexRef = useRef(null);
  const paletteCountRef = useRef(0);

  const interactionRef = useRef({
    mode: null,
    startMouse: null,
    startScale: null,
    startRotation: null,
    startCenter: null,
    startOffset: null,
  });

  const [, setTick] = useState(0);
  const refresh = () => setTick((t) => t + 1);

  function createItem(img, x, y, w, h) {
    // baseW/baseH are the image pixel size on canvas before any interactive scale
    return { img, x, y, baseW: w, baseH: h, scale: 1, rotation: 0 };
  }

  // ---------- Download button handler ----------
  const downloadImage = () => {
    const p5 = p5Ref.current;
    if (!p5) return;

    const width = p5.width;
    const height = p5.height;

    // Create offscreen canvas
    const offCanvas = document.createElement("canvas");
    offCanvas.width = width;
    offCanvas.height = height;
    const ctx = offCanvas.getContext("2d");
    ctx.clearRect(0, 0, width, height);

    // Draw all clones (skip palette)
    itemsRef.current.forEach((it, idx) => {
      if (idx < paletteCountRef.current) return; // skip palette

      ctx.save();

      // translate to center of item
      const cx = it.x + (it.baseW * it.scale) / 2;
      const cy = it.y + (it.baseH * it.scale) / 2;
      ctx.translate(cx, cy);
      ctx.rotate(it.rotation);
      ctx.scale(it.scale, it.scale);

      // draw image (handle p5.Image shapes)
      const drawImg = it.img && (it.img.canvas || it.img.elt || it.img);
      if (drawImg) {
        ctx.drawImage(drawImg, -it.baseW / 2, -it.baseH / 2, it.baseW, it.baseH);
      }

      ctx.restore();
    });

    offCanvas.toBlob((blob) => {
      if (!blob) return;
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "canvas.png";
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);
    });
  };

  // ---------- Helper: compute a sane width/height if parent is collapsed ----------
  const computeParentSizeWithFallback = (parent) => {
    const fallbackHeight = Math.max(400, Math.round(window?.innerHeight * 0.7 || 700));
    const fallbackWidth = Math.max(480, Math.round(window?.innerWidth * 0.9 || 900));
    const w = (parent && parent.clientWidth) || fallbackWidth;
    const h = (parent && parent.clientHeight) || fallbackHeight;
    return { w, h };
  };

  // ---------- Setup ----------
  const setup = (p5, canvasParentRef) => {
    p5Ref.current = p5;
    containerRef.current = canvasParentRef;

    // If parent has no height yet (e.g., CSS not computed), use fallback values
    const { w: initialW, h: initialH } = computeParentSizeWithFallback(canvasParentRef);

    const canvas = p5.createCanvas(initialW, initialH);
    canvas.parent(canvasParentRef);

    // resize helper that updates canvas to parent dimensions and re-layouts palette
    const resizeCanvasToContainer = () => {
      if (!containerRef.current) return;
      const { w, h } = computeParentSizeWithFallback(containerRef.current);
      if (w && h && (p5.width !== w || p5.height !== h)) {
        p5.resizeCanvas(w, h);
        // re-layout palette items relative to new size
        placePalette(p5);
        refresh();
      }
    };

    // Observe container size changes (if parent gets a height later)
    resizeObserverRef.current = new ResizeObserver(resizeCanvasToContainer);
    resizeObserverRef.current.observe(containerRef.current);

    // ensure we load images only once
    if (loadedImagesRef.current) return;
    loadedImagesRef.current = true;

    // Load all images into an array, then place palette
    setTimeout(() => {
      const loaded = [];
      const tryPlaceImages = () => {
        if (loaded.length !== imageCount) return;
        // After all loaded, build palette
        placePalette(p5, loaded);
        refresh();
      };

      for (let i = 1; i <= imageCount; i++) {
        const src = `${imagesPath}/${i}.png`;
        p5.loadImage(
          src,
          (img) => {
            loaded.push(img);
            tryPlaceImages();
          },
          () => {
            // on error, push a null placeholder (we still respect index count)
            loaded.push(null);
            tryPlaceImages();
          }
        );
      }
    }, 10);

    // also react to p5 windowResized (safety)
    p5.windowResized = () => {
      resizeCanvasToContainer();
    };
  };

  // ---------- Place palette (two rows, all relative) ----------
  // If `images` is provided use it; otherwise if called on resize re-layout existing palette images
  function placePalette(p5, images = null) {
    // Preserve any existing clones (items after palette)
    const existingClones = itemsRef.current.slice(paletteCountRef.current);

    const imgs =
      images ||
      itemsRef.current.slice(0, paletteCountRef.current).map((it) => it.img);

    // If images are still null/empty (rare), do nothing (keep clones)
    if (!imgs || imgs.length === 0) {
      itemsRef.current = [...existingClones];
      paletteCountRef.current = 0;
      return;
    }

    // Reset palette area
    itemsRef.current = [];

    const canvasW = p5.width;
    const canvasH = p5.height;

    // Relative parameters
    const spacing = Math.max(6, canvasW * 0.01); // relative spacing (min 6px)
    const rowHeight = Math.max(32, canvasH * 0.16); // target pixel height per row (min 32px)
    const topMargin = Math.max(6, canvasH * 0.01);

    // Split into two rows evenly
    const half = Math.ceil(imgs.length / 2);
    const row1Imgs = imgs.slice(0, half);
    const row2Imgs = imgs.slice(half);

    // initial scale per image so its displayed height ~= rowHeight (before adjustments)
    const computeInitialScale = (img) => {
      if (!img) return Math.max(minScale, Math.min(maxScale, initialScale * 0.4));
      const s = (rowHeight * 0.9) / img.height; // aim 90% of rowHeight
      return Math.max(minScale, Math.min(maxScale, s));
    };

    const prepareRow = (rowImgs) =>
      rowImgs.map((img) => {
        if (!img) {
          return { img: null, scale: computeInitialScale(null), w: 40, h: 40 };
        }
        const s = computeInitialScale(img);
        const w = Math.max(40, img.width * s);
        const h = Math.max(40, img.height * s);
        return { img, scale: s, w, h };
      });

    let row1 = prepareRow(row1Imgs);
    let row2 = prepareRow(row2Imgs);

    // adjust scales so each row fits within canvas width (if needed)
    const adjustRowToFit = (row) => {
      if (!row || row.length === 0) return row;
      const totalWidth = row.reduce((a, b) => a + b.w, 0) + spacing * (row.length + 1);
      if (totalWidth <= canvasW) return row;
      // compute multiplier to fit
      const usable = canvasW - spacing * (row.length + 1);
      const sumBase = row.reduce((a, b) => a + (b.img ? b.img.width * b.scale : b.w), 0);
      const multiplier = usable / sumBase || 1;
      // apply multiplier but clamp to minScale
      return row.map((r) => {
        if (!r.img) return r;
        const newScale = Math.max(minScale, Math.min(maxScale, r.scale * multiplier));
        const w = Math.max(40, r.img.width * newScale);
        const h = Math.max(40, r.img.height * newScale);
        return { img: r.img, scale: newScale, w, h };
      });
    };

    row1 = adjustRowToFit(row1);
    row2 = adjustRowToFit(row2);

    // compute starting x for centered rows
    const rowWidth = (row) => row.reduce((s, r) => s + r.w, 0) + spacing * (row.length + 1);

    const row1W = rowWidth(row1);
    const row2W = rowWidth(row2);

    const row1StartX = Math.max(spacing, (canvasW - row1W) / 2 + spacing);
    const row2StartX = Math.max(spacing, (canvasW - row2W) / 2 + spacing);

    // vertical positions: bottom row (row1) at canvasH - rowHeight - margin
    // second row (row2) directly above it with spacing
    const yRow1 = canvasH - rowHeight - topMargin;
    const yRow2 = yRow1 - rowHeight - spacing;

    // push palette items into itemsRef
    let x = row1StartX;
    row1.forEach((r) => {
      const img = r.img;
      // for null images: create an empty placeholder rectangle
      if (!img) {
        itemsRef.current.push(createItem(null, x, yRow1, r.w, r.h));
      } else {
        itemsRef.current.push(createItem(img, x, yRow1, r.w, r.h));
      }
      x += r.w + spacing;
    });

    x = row2StartX;
    row2.forEach((r) => {
      const img = r.img;
      if (!img) {
        itemsRef.current.push(createItem(null, x, yRow2, r.w, r.h));
      } else {
        itemsRef.current.push(createItem(img, x, yRow2, r.w, r.h));
      }
      x += r.w + spacing;
    });

    // paletteCountRef is current palette size
    paletteCountRef.current = itemsRef.current.length;

    // append existing clones after palette (keep clone positions unchanged)
    existingClones.forEach((c) => {
      itemsRef.current.push(c);
    });
  }

  // ---------- Draw ----------
  const draw = (p5) => {
    p5.clear();

    // Draw items (palette first, clones later)
    itemsRef.current.forEach((it, idx) => {
      p5.push();
      const cx = it.x + (it.baseW * it.scale) / 2;
      const cy = it.y + (it.baseH * it.scale) / 2;

      p5.translate(cx, cy);
      p5.rotate(it.rotation);
      p5.scale(it.scale);
      p5.imageMode(p5.CENTER);

      if (it.img) {
        // draw image
        p5.image(it.img, 0, 0, it.baseW, it.baseH);
      } else {
        // placeholder rectangle for missing images
        p5.noFill();
        p5.stroke(180);
        p5.rectMode(p5.CENTER);
        p5.rect(0, 0, it.baseW, it.baseH);
      }

      p5.pop();

      const isPaletteItem = idx < paletteCountRef.current;
      if (!isPaletteItem && selectedIndexRef.current === idx) {
        drawSelection(p5, it);
      }
    });
  };

  // ---------- Selection UI ----------
  function drawSelection(p5, it) {
    const corners = getItemCorners(it);

    p5.noFill();
    p5.stroke(0, 180, 255);
    p5.strokeWeight(1.8);
    p5.beginShape();
    corners.forEach((c) => p5.vertex(c.x, c.y));
    p5.endShape(p5.CLOSE);

    const size = 14;
    corners.forEach((c) => {
      p5.fill(255);
      p5.stroke(0);
      p5.rectMode(p5.CENTER);
      p5.rect(c.x, c.y, size, size);
    });

    const rot = getRotationHandle(it, corners);
    p5.fill("yellow");
    p5.stroke(0);
    p5.circle(rot.x, rot.y, size + 2);
  }

  // ---------- Geometry Helpers ----------
  function getRotationHandle(it, corners) {
    const topCenter = {
      x: (corners[0].x + corners[1].x) / 2,
      y: (corners[0].y + corners[1].y) / 2,
    };
    const diag = Math.hypot(it.baseW * it.scale, it.baseH * it.scale);
    const up = getUpVector(it);

    const baseDistance = diag * 0.42 - 50;
    const scaleDelta = -it.scale + 1;
    const scaleEffect = 50;
    const distance = baseDistance + scaleDelta * scaleEffect;

    return {
      x: topCenter.x + up.x * distance,
      y: topCenter.y + up.y * distance,
    };
  }

  const getUpVector = (it) => ({
    x: -Math.sin(it.rotation),
    y: Math.cos(it.rotation),
  });

  function getItemCorners(it) {
    const cx = it.x + (it.baseW * it.scale) / 2;
    const cy = it.y + (it.baseH * it.scale) / 2;
    const w = (it.baseW * it.scale) / 2;
    const h = (it.baseH * it.scale) / 2;
    const a = it.rotation;

    const pts = [
      { x: -w, y: -h },
      { x: w, y: -h },
      { x: w, y: h },
      { x: -w, y: h },
    ];

    return pts.map((p) => ({
      x: cx + p.x * Math.cos(a) - p.y * Math.sin(a),
      y: cy + p.x * Math.sin(a) + p.y * Math.cos(a),
    }));
  }

  // ---------- Hit Test ----------
  const dist = (...a) => Math.hypot(a[0] - a[2], a[1] - a[3]);

  const pointInPoly = (p, v) => {
    let inside = false;
    for (let i = 0, j = v.length - 1; i < v.length; j = i++) {
      const intersects =
        (v[i].y > p.y) !== (v[j].y > p.y) &&
        p.x < ((v[j].x - v[i].x) * (p.y - v[i].y)) / (v[j].y - v[i].y) + v[i].x;
      if (intersects) inside = !inside;
    }
    return inside;
  };

  function hitTest(mx, my) {
    for (let i = itemsRef.current.length - 1; i >= 0; i--) {
      const it = itemsRef.current[i];
      const corners = getItemCorners(it);
      const size = 14;

      // rotation handle
      const rot = getRotationHandle(it, corners);
      if (dist(mx, my, rot.x, rot.y) <= size) return { type: "rotate", itemIndex: i };

      // corner handles
      for (let k = 0; k < corners.length; k++) {
        if (Math.abs(mx - corners[k].x) <= size && Math.abs(my - corners[k].y) <= size) {
          return { type: "handle", index: k, itemIndex: i };
        }
      }

      // body area
      if (pointInPoly({ x: mx, y: my }, corners)) return { type: "body", itemIndex: i };
    }
    return null;
  }

  // ---------- Interaction ----------
  const mousePressed = (p5) => {
    const hit = hitTest(p5.mouseX, p5.mouseY);

    if (!hit) {
      selectedIndexRef.current = null;
      interactionRef.current.mode = null;
      refresh();
      return;
    }

    const isPaletteItem = hit.itemIndex < paletteCountRef.current;
    let sel;

    if (isPaletteItem) {
      // create a new clone at center of canvas
      const original = itemsRef.current[hit.itemIndex];
      const pImg = original.img;
      const cloneW = original.baseW;
      const cloneH = original.baseH;

      // Create clone centered on mouse position instead of canvas center
      sel = {
        img: pImg,
        scale: 1,
        rotation: 0,
        baseW: cloneW,
        baseH: cloneH,
        x: p5.mouseX - cloneW / 2,
        y: p5.mouseY - cloneH / 2,
      };

      itemsRef.current.push(sel);
      selectedIndexRef.current = itemsRef.current.length - 1;
    } else {
      // select existing clone; bring to top
      const el = itemsRef.current.splice(hit.itemIndex, 1)[0];
      itemsRef.current.push(el);
      selectedIndexRef.current = itemsRef.current.length - 1;
      sel = el;
    }

    interactionRef.current.startMouse = { x: p5.mouseX, y: p5.mouseY };
    interactionRef.current.startCenter = {
      x: sel.x + (sel.baseW * sel.scale) / 2,
      y: sel.y + (sel.baseH * sel.scale) / 2,
    };

    if (hit.type === "handle") {
      interactionRef.current.mode = "scale";
      interactionRef.current.startScale = sel.scale;
    } else if (hit.type === "rotate") {
      interactionRef.current.mode = "rotate";
      interactionRef.current.startRotation = sel.rotation;
    } else {
      interactionRef.current.mode = "move";
      interactionRef.current.startOffset = {
        x: p5.mouseX - sel.x,
        y: p5.mouseY - sel.y,
      };
    }

    refresh();
  };

  const mouseDragged = (p5) => {
    const mode = interactionRef.current.mode;
    const idx = selectedIndexRef.current;
    if (idx == null) return;
    const sel = itemsRef.current[idx];

    if (mode === "move") {
      sel.x = p5.mouseX - interactionRef.current.startOffset.x;
      sel.y = p5.mouseY - interactionRef.current.startOffset.y;
    }

    if (mode === "scale") {
      const { startMouse, startCenter, startScale } = interactionRef.current;
      const d1 = dist(startMouse.x, startMouse.y, startCenter.x, startCenter.y);
      const d2 = dist(p5.mouseX, p5.mouseY, startCenter.x, startCenter.y);
      const newScale = Math.max(minScale, Math.min(maxScale, (d2 / d1) * startScale));
      sel.scale = newScale;
      sel.x = startCenter.x - (sel.baseW * sel.scale) / 2;
      sel.y = startCenter.y - (sel.baseH * sel.scale) / 2;
    }

    if (mode === "rotate") {
      const { startMouse, startCenter, startRotation } = interactionRef.current;
      const a1 = Math.atan2(startMouse.y - startCenter.y, startMouse.x - startCenter.x);
      const a2 = Math.atan2(p5.mouseY - startCenter.y, p5.mouseX - startCenter.x);
      sel.rotation = startRotation + (a2 - a1);
    }

    refresh();
  };

  const mouseReleased = () => {
    interactionRef.current.mode = null;
  };

  // ---------- Cleanup ----------
  useEffect(() => {
    return () => {
      resizeObserverRef.current?.disconnect();
    };
  }, []);

  return (
    <div className="flex flex-col gap-2 w-full h-full">
      {/* 
        NOTE: It's best if the parent that wraps this component gives it a height.
        However, we added fallbacks so the canvas won't collapse to zero height.
      */}
      <div
        ref={containerRef}
        className="relative w-full h-full overflow-hidden"
        // You can override CSS if you want a guaranteed height: e.g. style={{ height: '70vh' }}
      >
        <Sketch
          setup={setup}
          draw={draw}
          mousePressed={mousePressed}
          mouseDragged={mouseDragged}
          mouseReleased={mouseReleased}
          touchStarted={(p) => (mousePressed(p), false)}
          touchMoved={(p) => (mouseDragged(p), false)}
          touchEnded={() => (mouseReleased(), false)}
        />
      </div>

      <div className="flex gap-2 items-center">
        <button
          onClick={downloadImage}
          className="px-4 py-2 bg-blue-600 text-white rounded shadow hover:bg-blue-700 active:scale-95"
        >
          Download PNG
        </button>
      </div>
    </div>
  );
}
