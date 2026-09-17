import * as C from "cesium";
import type { ParkViewerData } from "../types";
import { polygon, line } from "../geometry";
import { parkTexture } from "../parkAssets";
export function addSceneBaseLayer(v: C.Viewer, _data: ParkViewerData) {
  const ground = polygon(
    v,
    "park-base",
    [
      [-120, -120],
      [220, -120],
      [220, 180],
      [-120, 180],
    ],
    "#7d8270",
    0,
  );
  ground.polygon!.material = new C.ImageMaterialProperty({
    image: parkTexture("grass"),
    repeat: new C.Cartesian2(45, 45),
  });
  const interior = polygon(
    v,
    "park-interior",
    [
      [5, 9],
      [101, 9],
      [101, 95],
      [5, 95],
    ],
    "#888e78",
    0.4,
  );
  interior.polygon!.material = new C.ImageMaterialProperty({
    image: parkTexture("grass"),
    repeat: new C.Cartesian2(16, 16),
    color: C.Color.fromCssColorString("#c9cbb7"),
  });
  line(
    v,
    "park-boundary",
    [
      [5, 9],
      [101, 9],
      [101, 95],
      [5, 95],
      [5, 9],
    ],
    "#9baba0",
    1,
    1,
  );
  const plaza = polygon(
    v,
    "central-plaza",
    [
      [47, 80],
      [59, 80],
      [59, 89],
      [47, 89],
    ],
    "#adaca2",
    1.3,
  );
  plaza.polygon!.material = new C.ImageMaterialProperty({
    image: parkTexture("concrete"),
    repeat: new C.Cartesian2(4, 3),
  });
  line(
    v,
    "garden-walk",
    [
      [43, 85],
      [48, 85],
      [54, 89],
      [64, 89],
    ],
    "#b8b7ab",
    5,
    1.5,
  );
}
