import * as C from "cesium";
import { coordinate } from "./sceneUtils";
export const color = (value: string) => C.Color.fromCssColorString(value);
export function box(
  v: C.Viewer,
  id: string,
  x: number,
  y: number,
  z: number,
  w: number,
  d: number,
  h: number,
  tint: string,
  properties = {},
) {
  const position = coordinate(x, y, z);
  return v.entities.add({
    id,
    position,
    orientation: C.Transforms.headingPitchRollQuaternion(
      position,
      new C.HeadingPitchRoll(0, 0, 0),
    ),
    box: {
      dimensions: new C.Cartesian3(w, d, h),
      material: color(tint),
      shadows: h > 10 ? C.ShadowMode.ENABLED : C.ShadowMode.RECEIVE_ONLY,
    },
    properties,
  });
}
export function polygon(
  v: C.Viewer,
  id: string,
  points: number[][],
  tint: string,
  height = 1,
  properties = {},
) {
  return v.entities.add({
    id,
    polygon: {
      hierarchy: new C.PolygonHierarchy(
        points.map((p) => coordinate(p[0], p[1])),
      ),
      height,
      material: color(tint),
    },
    properties,
  });
}
export function line(
  v: C.Viewer,
  id: string,
  points: number[][],
  tint: string,
  width = 2,
  height = 3,
  glow = false,
  properties = {},
) {
  return v.entities.add({
    id,
    polyline: {
      positions: points.map((p) => coordinate(p[0], p[1], p[2] ?? height)),
      width,
      material: glow
        ? new C.PolylineGlowMaterialProperty({
            color: color(tint),
            glowPower: 0.2,
          })
        : color(tint),
    },
    properties,
  });
}
export function label(
  v: C.Viewer,
  id: string,
  x: number,
  y: number,
  text: string,
  tint = "#d4edeb",
  size = 13,
  properties = {},
) {
  return v.entities.add({
    id,
    position: coordinate(x, y, 20),
    label: {
      text,
      font: `${size}px Microsoft YaHei`,
      fillColor: color(tint),
      style: C.LabelStyle.FILL_AND_OUTLINE,
      outlineColor: color("#082232"),
      outlineWidth: 3,
      showBackground: true,
      backgroundColor: color("#071d2bd9"),
      backgroundPadding: new C.Cartesian2(9, 5),
      disableDepthTestDistance: Infinity,
    },
    properties,
  });
}
