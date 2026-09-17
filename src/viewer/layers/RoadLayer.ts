import * as C from "cesium";
import type { ParkViewerData } from "../types";
import { box, polygon, line, label } from "../geometry";
import { parkTexture } from "../parkAssets";
export function addRoadLayer(v: C.Viewer, _data: ParkViewerData) {
  const hs = [12, 44, 76, 92],
    vs = [8, 38, 68, 98];
  const road = (id: string, x: number, y: number, w: number, d: number) => {
    const surface = polygon(
      v,
      id,
      [
        [x - w / 60, y - d / 60],
        [x + w / 60, y - d / 60],
        [x + w / 60, y + d / 60],
        [x - w / 60, y + d / 60],
      ],
      "#535a5c",
      1.7,
    );
    surface.polygon!.material = new C.ImageMaterialProperty({
      image: parkTexture(id.startsWith("walk-") ? "concrete" : "asphalt"),
      repeat: new C.Cartesian2(w / 60, d / 60),
    });
  };
  hs.forEach((y, i) => {
    const width = i === 1 ? 46 : 32;
    road("road-h-" + i, 53, y, 2810, width);
    for (const side of [-1, 1]) {
      road(
        "walk-h-" + i + "-" + side,
        53,
        y + side * (width / 60 + 0.12),
        2810,
        6,
      );
      line(
        v,
        "curb-h-" + i + "-" + side,
        [
          [6, y + side * (width / 60 + 0.15)],
          [100, y + side * (width / 60 + 0.15)],
        ],
        "#b2b4aa",
        2,
        2,
      );
    }
    const stripe = line(
      v,
      "stripe-h-" + i,
      [
        [6, y],
        [100, y],
      ],
      "#c5c4ae",
      1,
      2,
    );
    stripe.polyline!.material = new C.PolylineDashMaterialProperty({
      color: C.Color.fromCssColorString("#c5c4ae"),
      dashLength: 14,
    });
  });
  vs.forEach((x, i) => {
    const width = i === 1 ? 46 : 32;
    road("road-v-" + i, x, 52, width, 2500);
    for (const side of [-1, 1])
      line(
        v,
        "curb-v-" + i + "-" + side,
        [
          [x + side * (width / 60 + 0.15), 10],
          [x + side * (width / 60 + 0.15), 94],
        ],
        "#b2b4aa",
        2,
        2,
      );
    const stripe = line(
      v,
      "stripe-v-" + i,
      [
        [x, 10],
        [x, 94],
      ],
      "#c5c4ae",
      1,
      2,
    );
    stripe.polyline!.material = new C.PolylineDashMaterialProperty({
      color: C.Color.fromCssColorString("#c5c4ae"),
      dashLength: 14,
    });
  });
  for (const x of vs)
    for (const y of hs) {
      road(`junction-${x}-${y}`, x, y, 48, 48);
      for (let i = 0; i < 6; i++) {
        box(
          v,
          `crossing-${x}-${y}-${i}`,
          x - 0.6 + i * 0.24,
          y + 0.95,
          2.1,
          4,
          8,
          0.1,
          "#c8c8b9",
        );
      }
    }
  box(v, "entry-gate", 38, 91, 14, 110, 12, 3, "#bac0bc");
  for (const x of [36.3, 39.7])
    box(v, "entry-pillar-" + x, x, 91, 7, 5, 10, 14, "#737d7c");
  box(v, "entry-security", 41, 91, 5, 24, 17, 10, "#b2b6b2");
  label(v, "entry-label", 38, 96, "南海子 · 园区入口", "#b8c4c1", 11);
}
