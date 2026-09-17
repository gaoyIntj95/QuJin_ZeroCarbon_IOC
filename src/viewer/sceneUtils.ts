import * as Cesium from "cesium";

export const PARK_CENTER = { longitude: 103.822, latitude: 25.514 };

export function coordinate(x: number, y: number, height = 0) {
  return Cesium.Cartesian3.fromDegrees(
    PARK_CENTER.longitude + (x - 50) * 0.0003,
    PARK_CENTER.latitude + (50 - y) * 0.00027,
    height,
  );
}

export function severityColor(intensity: number) {
  if (intensity >= 0.4) return Cesium.Color.fromCssColorString("#ff5d60");
  if (intensity >= 0.35) return Cesium.Color.fromCssColorString("#ffcc56");
  return Cesium.Color.fromCssColorString("#4ba8ff");
}

export function flowColor(type: string) {
  return (
    {
      electric: "#39b5ff",
      green: "#48e4a6",
      gas: "#a7e871",
      heat: "#ffb63f",
    }[type] ?? "#55c9e8"
  );
}
