import * as C from "cesium";
import type { ParkViewerData } from "../types";
import { coordinate, severityColor } from "../sceneUtils";

const heatTextures = new Map<string, string>();

function heatTexture(color: C.Color) {
  const key = color.toCssColorString();
  if (heatTextures.has(key)) return heatTextures.get(key)!;
  const canvas = document.createElement("canvas");
  canvas.width = canvas.height = 256;
  const ctx = canvas.getContext("2d")!;
  const r = Math.round(color.red * 255);
  const g = Math.round(color.green * 255);
  const b = Math.round(color.blue * 255);
  const glow = ctx.createRadialGradient(128, 128, 12, 128, 128, 124);
  glow.addColorStop(0, "rgba(255,255,255,.96)");
  glow.addColorStop(0.1, `rgba(${r},${g},${b},.9)`);
  glow.addColorStop(0.42, `rgba(${r},${g},${b},.38)`);
  glow.addColorStop(0.75, `rgba(${r},${g},${b},.1)`);
  glow.addColorStop(1, `rgba(${r},${g},${b},0)`);
  ctx.fillStyle = glow;
  ctx.fillRect(0, 0, 256, 256);
  const texture = canvas.toDataURL();
  heatTextures.set(key, texture);
  return texture;
}

export function addCarbonHeatLayer(v: C.Viewer, data: ParkViewerData) {
  data.carbonRegions.forEach((region) => {
    const heatColor = severityColor(region.intensity);
    v.entities.add({
      id: region.regionId,
      position: coordinate(region.position.x, region.position.y, 14),
      billboard: {
        image: heatTexture(heatColor),
        width: 138,
        height: 138,
        disableDepthTestDistance: Number.POSITIVE_INFINITY,
      },
      point: {
        pixelSize: 10,
        color: heatColor,
        outlineColor: C.Color.WHITE,
        outlineWidth: 2,
        disableDepthTestDistance: Number.POSITIVE_INFINITY,
      },
      properties: {
        kind: "carbon-heat",
        heatRegionId: region.regionId,
        enterpriseId: region.enterpriseId,
      },
    });
  });
}
