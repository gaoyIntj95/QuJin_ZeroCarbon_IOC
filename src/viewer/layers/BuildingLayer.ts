import type { Viewer } from "cesium";
import * as C from "cesium";
import type { ParkViewerData } from "../types";
import { polygon, line } from "../geometry";
import { addParkModel, buildingModel, parkTexture } from "../parkAssets";

export function addBuildingLayer(v: Viewer, data: ParkViewerData) {
  // One coherent yard per enterprise, rather than a slab under every block.
  data.enterprises.forEach((e) => {
    const { x, y } = e.position;
    const yard = polygon(
      v,
      e.enterpriseId + "-yard",
      [
        [x - 12, y - 10],
        [x + 12, y - 10],
        [x + 12, y + 13],
        [x - 12, y + 13],
      ],
      "#a6a99f",
      1.2,
      { kind: "building", enterpriseId: e.enterpriseId },
    );
    yard.polygon!.material = new C.ImageMaterialProperty({
      image: parkTexture("concrete"),
      repeat: new C.Cartesian2(6, 6),
    });
    line(
      v,
      e.enterpriseId + "-yard-edge",
      [
        [x - 12, y - 10],
        [x + 12, y - 10],
        [x + 12, y + 13],
        [x - 12, y + 13],
        [x - 12, y - 10],
      ],
      "#bfc3b4",
      1,
      1.5,
    );
    for (const offset of [-5, 5]) {
      const access = polygon(
        v,
        e.enterpriseId + "-access-" + offset,
        [
          [x + offset - 0.6, y + 12.8],
          [x + offset + 0.6, y + 12.8],
          [x + offset + 0.6, y + 15.5],
          [x + offset - 0.6, y + 15.5],
        ],
        "#959990",
        1.3,
      );
      access.polygon!.material = new C.ImageMaterialProperty({
        image: parkTexture("concrete"),
      });
    }
  });
  data.buildings.forEach((b) => {
    const { x, y } = b.position;
    const props = {
      kind: "building",
      enterpriseId: b.enterpriseId,
      buildingId: b.buildingId,
    };
    addParkModel(
      v,
      b.buildingId,
      x,
      y,
      buildingModel(b.type, b.width, b.depth, b.height, !!b.hasSolarRoof),
      props,
    );
    if (b.type !== "factory") {
      const py = y + b.depth / 60 + 1;
      for (let i = 0; i < 12; i++) {
        const px = x - 0.6 + i * 0.1;
        line(
          v,
          b.buildingId + "-bay-" + i,
          [
            [px, py],
            [px, py + 0.2],
            [px + 0.1, py + 0.2],
          ],
          "#d1d2c5",
          1,
          1.5,
        );
      }
    }
  });
}
