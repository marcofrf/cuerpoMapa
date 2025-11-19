// /data/points.ts



export type SketchName =
  | "head"
  | "eyes"
  | "ears"
  | "mouth"
  | "heart"
  | "leftHand"
  | "rightHand"
  | "vientre"
  | "footLeft"
  | "footRight"

export type InteractionPoint = {
  id: number;
  x: string;       // dot left position (%)
  y: string;       // dot top position (%)
  zoomX: string;   // background zoom X alignment
  zoomY: string;   // background zoom Y alignment
  zoomScale: number;
  sketch: SketchName; // <-- FIXED

// 👇 NEW — optional per-sketch layout
  panelWidth?: string;   // px
  panelHeight?: string;  // px
  panelOpacity?: number; // 0–1
  panelLeft?: string;
  panelTop?: string;
  downloadButton?: boolean;
  buttonX?: string; // % or px
  buttonY?: string; // % or px

};

export const interactionPoints: InteractionPoint[] = [
  {
    id: 1,
    x: "50%",
    y: "21%",
    zoomX: "50%",
    zoomY: "-380%",
    zoomScale: 12,
    sketch: "head",
    panelWidth: "80%",
    panelHeight: "60%",
    panelLeft: "10%",
    panelTop: "15%"
  },
  {
    id: 2,
    x: "51.5%",
    y: "24%",
    zoomX: "100%",
    zoomY: "-325%",
    zoomScale: 12,
    sketch: "ears",
    panelWidth: "50%",
    panelHeight: "90%",
    panelLeft: "40%",
    panelTop: "5%"
  },
  {
    id: 3,
    x: "49.1%",
    y: "23.5%",
    zoomX: "8%",
    zoomY: "-300%",
    zoomScale: 12,
    sketch: "eyes",
    panelWidth: "60%",
    panelHeight: "70%",
    panelLeft: "8%",
    panelTop: "25%"
  },
  {
    id: 4,
    x: "50%",
    y: "26.5%",
    zoomX: "50%",
    zoomY: "-250%",
    zoomScale: 12,
    sketch: "mouth",
    panelWidth: "70%",
    panelHeight: "70%",
    panelLeft: "15%",
    panelTop: "15%"

  },
  {
    id: 5,
    x: "50.5%",
    y: "38%",
    zoomX: "55%",
    zoomY: "-100%",
    zoomScale: 10,
    sketch: "heart",
    panelWidth: "100%",
    panelHeight: "100%",
    panelLeft: "0%",
    panelTop: "0%"
  },
  {
    id: 6,
    x: "57%",
    y: "57%",
    zoomX: "140%",
    zoomY: "130%",
    zoomScale: 10,
    sketch: "leftHand",
    panelWidth: "50%",
    panelHeight: "50%",
    panelLeft: "40%",
    panelTop: "30%"
  },
  {
    id: 7,
    x: "43.5%",
    y: "56%",
    zoomX: "-45%",
    zoomY: "130%",
    zoomScale: 10,
    sketch: "rightHand",
    panelWidth: "50%",
    panelHeight: "50%",
    panelLeft: "15%",
    panelTop: "25%"
  },
  {
    id: 8,
    x: "50%",
    y: "52%",
    zoomX: "50%",
    zoomY: "70%",
    zoomScale: 10,
    sketch: "vientre",
    panelWidth: "90%",
    panelHeight: "90%",
    panelLeft: "5%",
    panelTop: "5%",
    downloadButton: true,
    buttonX: "50%",
    buttonY: "50%"
  },
  {
    id: 9,
    x: "51%",
    y: "86%",
    zoomX: "90%",
    zoomY: "450%",
    zoomScale: 10,
    sketch: "footLeft",
    panelWidth: "50%",
    panelHeight: "90%",
    panelLeft: "45%",
    panelTop: "5%"
  },
  {
    id: 10,
    x: "48%",
    y: "85.5%",
    zoomX: "10%",
    zoomY: "450%",
    zoomScale: 10,
    sketch: "footRight",
    panelWidth: "50%",
    panelHeight: "90%",
    panelLeft: "10%",
    panelTop: "5%"
  },
];
