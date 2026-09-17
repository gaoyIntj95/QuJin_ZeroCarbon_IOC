import { lazy, Suspense } from "react";
import type { EnergyMode } from "../data";

const CesiumParkViewer = lazy(() =>
  import("../viewer/CesiumParkViewer").then(({ CesiumParkViewer: Viewer }) => ({
    default: Viewer,
  })),
);

export function ParkScene({
  kind,
  mode = "electric",
  selected = kind === "overview" ? null : 0,
  factor = 1,
  onSelect,
  onHover,
  onFacility,
  level = "all",
}: {
  kind: "overview" | "energy" | "carbon";
  mode?: EnergyMode;
  selected?: number | null;
  factor?: number;
  onSelect: (i: number) => void;
  onHover?: (i: number | null) => void;
  onFacility?: (name: string, info: string) => void;
  level?: string;
}) {
  return (
    <Suspense fallback={<section className="park-scene park-viewer-loading">正在加载园区 3D 场景…</section>}>
      <CesiumParkViewer
        mode={kind}
        energyMode={mode}
        selected={selected}
        factor={factor}
        level={level}
        onSelect={onSelect}
        onHover={onHover}
        onFacility={onFacility}
      />
    </Suspense>
  );
}
