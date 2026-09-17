import * as C from "cesium";
import type { ParkViewerData } from "../types";
import { polygon, box } from "../geometry";
import { parkTexture } from "../parkAssets";
export function addWaterLayer(v: C.Viewer, _data: ParkViewerData) {
  const bank = Array.from({ length: 151 }, (_, i) => {
    const x = i * 1.4 - 55;
    return [x, 102 + Math.sin(x * 0.085) * 2.5 + Math.sin(x * 0.21) * 0.7];
  });
  polygon(v, "river-bank", [...bank, [160, 140], [-55, 140]], "#8d9280", 0.6);
  const water = polygon(
    v,
    "river",
    [...bank.map(([x, y]) => [x, y + 0.8]), [160, 145], [-55, 145]],
    "#395c65",
    0.8,
  );
  water.polygon!.material = new C.ImageMaterialProperty({
    image: parkTexture("water"),
    repeat: new C.Cartesian2(14, 3),
  });
  box(v, "river-bridge", 38, 109, 10, 46, 780, 4, "#646d6d");
  for (const x of [37.2, 38.8])
    box(v, "bridge-rail-" + x, x, 109, 13, 1.5, 780, 2, "#c0c4bb");
  for (const y of [102, 110, 118])
    box(v, "bridge-pier-" + y, 38, y, 5, 28, 12, 10, "#939a94");
}
