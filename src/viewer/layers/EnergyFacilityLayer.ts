import * as C from "cesium";
import type { ParkViewerData } from "../types";
import { box, line, color } from "../geometry";
import { coordinate } from "../sceneUtils";
import { addParkModel, facilityModel, parkTexture } from "../parkAssets";
export function addEnergyFacilityLayer(
  v: C.Viewer,
  data: ParkViewerData,
  showLabels = true,
) {
  data.facilities.forEach((f) => {
    const { x, y } = f.position,
      props = { kind: "facility", facilityId: f.facilityId };
    const tint =
      f.type === "substation"
        ? "#72bfff"
        : f.type === "gas"
          ? "#d6dc70"
          : f.type === "heat"
            ? "#ffb63f"
            : "#6cdbac";
    v.entities.add({
      id: f.facilityId,
      position: coordinate(x, y, f.type === "wind" ? 135 : 45),
      billboard: {
        image: icon(f.type, tint),
        width: 18,
        height: 18,
        pixelOffset: new C.Cartesian2(0, -10),
        disableDepthTestDistance: Infinity,
      },
      label: {
        text: f.name,
        font: "12px Microsoft YaHei",
        fillColor: C.Color.WHITE,
        show: showLabels,
        showBackground: true,
        backgroundColor: color("#082737e6"),
        pixelOffset: new C.Cartesian2(0, -26),
        disableDepthTestDistance: Infinity,
      },
      properties: props,
    });
    if (["solar", "storage", "substation"].includes(f.type)) {
      const pad = box(
        v,
        f.facilityId + "-equipment-pad",
        x,
        y,
        1.1,
        f.type === "solar" ? 450 : 280,
        f.type === "solar" ? 230 : 220,
        1,
        "#969b94",
        props,
      );
      pad.box!.material = new C.ImageMaterialProperty({
        image: parkTexture("concrete"),
        repeat: new C.Cartesian2(4, 3),
      });
      addParkModel(
        v,
        f.facilityId + "-equipment",
        x,
        y,
        facilityModel(f.type),
        props,
      );
    }
    if (f.type === "wind")
      for (let i = 0; i < 3; i++) {
        const xx = x + (i - 1) * 8,
          position = coordinate(xx, y, 60);
        v.entities.add({
          id: "wind-tower-" + i,
          position,
          orientation: C.Transforms.headingPitchRollQuaternion(
            position,
            new C.HeadingPitchRoll(),
          ),
          cylinder: {
            length: 120,
            topRadius: 2,
            bottomRadius: 5,
            material: color("#d4e2df"),
          },
          properties: props,
        });
        box(v, "wind-hub-" + i, xx, y, 123, 13, 18, 9, "#eff6e8", props);
        for (let b = 0; b < 3; b++) {
          const a = (b * Math.PI * 2) / 3;
          line(
            v,
            `blade-${i}-${b}`,
            [
              [xx, y, 123],
              [xx + Math.sin(a) * 1.4, y, 123 + Math.cos(a) * 43],
            ],
            "#e5efdf",
            4,
            123,
            false,
            props,
          );
        }
      }
    if (f.type === "greenLink")
      line(
        v,
        "direct-corridor",
        [
          [68, 5],
          [68, 44],
          [38, 44],
          [38, 60],
        ],
        "#61d9a6",
        3,
        22,
        true,
        props,
      );
  });
}
const icons: Record<string, string> = {
  solar: "▦",
  wind: "✣",
  storage: "▥",
  substation: "ϟ",
  greenLink: "↗",
  gas: "◒",
  heat: "♨",
};
const cache = new Map<string, string>();
function icon(type: string, tint: string) {
  if (cache.has(type)) return cache.get(type)!;
  const canvas = document.createElement("canvas");
  canvas.width = 64;
  canvas.height = 64;
  const c = canvas.getContext("2d")!;
  c.fillStyle = "#092935";
  c.strokeStyle = tint;
  c.lineWidth = 3;
  c.beginPath();
  c.roundRect(3, 3, 58, 58, 13);
  c.fill();
  c.stroke();
  c.fillStyle = tint;
  c.font = "bold 40px sans-serif";
  c.textAlign = "center";
  c.textBaseline = "middle";
  c.fillText(icons[type] ?? "◇", 32, 33);
  const url = canvas.toDataURL();
  cache.set(type, url);
  return url;
}
