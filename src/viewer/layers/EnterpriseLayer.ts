import * as Cesium from "cesium";
import { energyViews, type EnergyMode } from "../../data";
import type { ParkViewerData } from "../types";
import { coordinate, severityColor } from "../sceneUtils";

export function addEnterpriseLayer(
  viewer: Cesium.Viewer,
  data: ParkViewerData,
  selected: number | null,
  mode: "overview" | "energy" | "carbon",
  energyMode: EnergyMode,
  factor: number,
  level: string,
) {
  data.enterprises.forEach((enterprise, index) => {
    const severity =
      enterprise.intensity >= 0.4
        ? "high"
        : enterprise.intensity >= 0.35
          ? "medium"
          : "low";
    const filtered = mode === "carbon" && level !== "all" && severity !== level;
    const active = selected === index;
    const color =
      mode === "carbon"
        ? severityColor(enterprise.intensity)
        : Cesium.Color.fromCssColorString(active ? "#7ee8eb" : "#49b9d4");
    const energyValue =
      enterprise.energy *
      factor *
      (energyMode === "all"
        ? 1
        : energyMode === "electric"
          ? 0.925
          : energyMode === "gas"
            ? 0.029
            : energyMode === "heat"
              ? 0.023
              : (0.925 * enterprise.green) / 100);
    const position = coordinate(
      enterprise.position.x,
      enterprise.position.y,
      68,
    );
    const factoryTag = enterprise.isZeroCarbonFactory
      ? "零碳工厂"
      : enterprise.isGreenFactory
        ? "绿色工厂"
        : "重点企业";
    const labelText =
      mode === "carbon"
        ? `${enterprise.name}\n${enterprise.carbon.toFixed(1)} 万tCO₂ · 强度 ${enterprise.intensity.toFixed(2)}`
        : mode === "overview"
          ? `${enterprise.name}\n${factoryTag}`
          : `${enterprise.name}\n${energyValue.toFixed(2)} ${energyViews[energyMode].unit}`;

    viewer.entities.add({
      id: enterprise.enterpriseId,
      position,
      point: {
        pixelSize: active ? 11 : 7,
        color: color.withAlpha(filtered ? 0.2 : 0.96),
        outlineColor: Cesium.Color.WHITE.withAlpha(active ? 0.9 : 0.58),
        outlineWidth: active ? 2 : 1,
        disableDepthTestDistance: Number.POSITIVE_INFINITY,
      },
      label: {
        text: labelText,
        font: "12px Microsoft YaHei",
        fillColor: Cesium.Color.WHITE,
        outlineColor: Cesium.Color.fromCssColorString("#17333b"),
        outlineWidth: 4,
        style: Cesium.LabelStyle.FILL_AND_OUTLINE,
        showBackground: mode === "overview",
        backgroundColor: Cesium.Color.fromCssColorString(
          enterprise.isZeroCarbonFactory ? "#2a604be8" : "#123b4de8",
        ),
        verticalOrigin: Cesium.VerticalOrigin.BOTTOM,
        pixelOffset: new Cesium.Cartesian2(0, -18),
        show: true,
        disableDepthTestDistance: Number.POSITIVE_INFINITY,
      },
      properties: {
        kind: "enterprise",
        index,
        enterpriseId: enterprise.enterpriseId,
      },
    });

    if (active) {
      viewer.entities.add({
        id: `${enterprise.enterpriseId}-halo`,
        position: coordinate(enterprise.position.x, enterprise.position.y, 8),
        ellipse: {
          semiMajorAxis: 180,
          semiMinorAxis: 120,
          material: color.withAlpha(0.13),
          outline: true,
          outlineColor: color.withAlpha(0.62),
          outlineWidth: 2,
          height: 8,
        },
        properties: {
          kind: "enterprise-halo",
          enterpriseId: enterprise.enterpriseId,
        },
      });
    }
  });
}
