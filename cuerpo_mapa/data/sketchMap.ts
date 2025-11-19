import dynamic from "next/dynamic";

// Dynamically loaded sketches (client only)
export const sketchMap = {
  head: dynamic(() => import("@/components/head"), { ssr: false }),
  eyes: dynamic(() => import("@/components/eyes"), { ssr: false }),
  ears: dynamic(() => import("@/components/ears"), { ssr: false }),
  mouth: dynamic(() => import("@/components/mouth"), { ssr: false }),
  heart: dynamic(() => import("@/components/heart"), { ssr: false }),
  leftHand: dynamic(() => import("@/components/handLeft"), { ssr: false }),
  rightHand: dynamic(() => import("@/components/handRight"), { ssr: false }),
  vientre: dynamic(() => import("@/components/vientre"), { ssr: false }),
  references: dynamic(() => import("@/components/references"), { ssr: false }),
  footLeft: dynamic(() => import("@/components/footLeft"), { ssr: false }),
  footRight: dynamic(() => import("@/components/footRight"), { ssr: false }), 
};

export type SketchName = keyof typeof sketchMap;
