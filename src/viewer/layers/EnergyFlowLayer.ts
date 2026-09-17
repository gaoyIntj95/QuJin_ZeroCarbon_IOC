import * as Cesium from "cesium";
import type { EnergyMode } from "../../data";
import type { ParkViewerData } from "../types";
import { coordinate, flowColor } from "../sceneUtils";

const trunkY = {
  electric: 70,
  green: 43,
  gas: 54,
  heat: 78,
} as const;

export function addEnergyFlowLayer(
  viewer: Cesium.Viewer,
  data: ParkViewerData,
  energyMode: EnergyMode,
  selected: number | null,
) {
  const allObjects = [...data.enterprises, ...data.facilities];
  const selectedId =
    typeof selected === "number"
      ? data.enterprises[selected]?.enterpriseId
      : undefined;
  data.energyFlows.forEach((flow) => {
    const source = allObjects.find((item) =>
      "enterpriseId" in item
        ? item.enterpriseId === flow.sourceId
        : item.facilityId === flow.sourceId,
    );
    const target = allObjects.find((item) =>
      "enterpriseId" in item
        ? item.enterpriseId === flow.targetId
        : item.facilityId === flow.targetId,
    );
    if (!source || !target) return;
    const energyMatches =
      energyMode === "all" || energyMode === flow.energyType;
    const related =
      !selectedId ||
      flow.sourceId === selectedId ||
      flow.targetId === selectedId;
    const color = Cesium.Color.fromCssColorString(flowColor(flow.energyType));
    const alpha = !energyMatches ? 0.06 : related ? 0.78 : 0.12;
    const corridor = trunkY[flow.energyType];
    viewer.entities.add({
      id: flow.flowId,
      polyline: {
        positions: [
          coordinate(source.position.x, source.position.y, 34),
          coordinate(source.position.x, corridor, 34),
          coordinate(target.position.x, corridor, 34),
          coordinate(target.position.x, target.position.y, 68),
        ],
        width: related ? 5 : 2,
        material: new Cesium.PolylineGlowMaterialProperty({
          glowPower: related ? 0.18 : 0.04,
          color: color.withAlpha(alpha),
        }),
        clampToGround: false,
      },
      properties: {
        kind: "energy-flow",
        flowId: flow.flowId,
        energyType: flow.energyType,
      },
    });
  });
}
