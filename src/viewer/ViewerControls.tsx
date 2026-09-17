import { Factory, Flame, Leaf, Maximize, Navigation, RotateCcw, Waves, Zap, ZoomIn, ZoomOut } from "lucide-react";
import type { Facility, Enterprise, ParkViewerMode } from "./types";

export function ViewerControls({
  title,
  modeLabel,
  sourceLabel,
  cameraMode,
  showBackToMacro = false,
  selectedEnterprise,
  enterpriseCardPosition,
  dataMode,
  energyFactor = 1,
  selectedFacility,
  onZoomIn,
  onZoomOut,
  onReset,
  onNorth,
  onFullscreen,
  onBackToMacro,
  onClearFacility,
}: {
  title: string;
  modeLabel: string;
  sourceLabel?: string;
  cameraMode: "macro" | "park";
  showBackToMacro?: boolean;
  selectedEnterprise?: Enterprise | null;
  enterpriseCardPosition?: { left: number; top: number } | null;
  dataMode?: ParkViewerMode;
  energyFactor?: number;
  selectedFacility?: Facility | null;
  onZoomIn: () => void;
  onZoomOut: () => void;
  onReset: () => void;
  onNorth: () => void;
  onFullscreen: () => void;
  onBackToMacro?: () => void;
  onClearFacility: () => void;
}) {
  return (
    <>
      <div className="viewer-statusbar">
        <span className="viewer-mode-mark">
          <i /> {modeLabel}
        </span>
        {showBackToMacro && onBackToMacro && (
          <button
            type="button"
            className="viewer-back-button"
            onClick={onBackToMacro}
          >
            ← 返回区域总览
          </button>
        )}
        {sourceLabel && (
          <span className="viewer-source-mark">{sourceLabel}</span>
        )}
      </div>
      <div className="map-title">{title}</div>
      <div className="compass">
        <span>N</span>
        <Navigation size={26} />
      </div>
      <div className="map-tools viewer-toolbar" aria-label="园区视图工具栏">
        <button type="button" aria-label="放大园区" onClick={onZoomIn}>
          <ZoomIn size={17} />
        </button>
        <button type="button" aria-label="缩小园区" onClick={onZoomOut}>
          <ZoomOut size={17} />
        </button>
        <button type="button" aria-label="回到园区默认视角" onClick={onReset}>
          <RotateCcw size={16} />
        </button>
        <button type="button" aria-label="指北" onClick={onNorth}>
          <Navigation size={15} />
        </button>
        <button type="button" aria-label="全屏园区视图" onClick={onFullscreen}>
          <Maximize size={15} />
        </button>
      </div>
      <div className="viewer-help">
        {cameraMode === "macro"
          ? "悬停南海子片区查看摘要 · 点击进入园区"
          : "悬停或点击企业查看信息 · 方标：能源设施"}{" "}
      </div>
      {selectedEnterprise && (
        <div
          className="viewer-enterprise-card"
          style={
            enterpriseCardPosition
              ? {
                  left: enterpriseCardPosition.left,
                  top: enterpriseCardPosition.top,
                }
              : undefined
          }
        >
          <b>{selectedEnterprise.name}</b>
          <span>
            {selectedEnterprise.industry}
            {dataMode === "energy" && <em>● 运行中</em>}
          </span>
          <div className="enterprise-card-metrics">
            <small>年度碳排 {selectedEnterprise.carbon.toFixed(1)} 万tCO₂</small>
            {dataMode === "energy" ? (
              <>
                <small className="enterprise-energy-total">
                  综合能源消费（折标）<strong>{(selectedEnterprise.energy * energyFactor).toFixed(2)} 万tce</strong>
                </small>
                <div className="enterprise-energy-list">
                  {[
                    [Zap, "用电量", selectedEnterprise.energy * 0.925, "亿kWh"],
                    [Flame, "天然气", selectedEnterprise.energy * 0.029, "万Nm³"],
                    [Waves, "热力", selectedEnterprise.energy * 0.023, "万GJ"],
                    [Factory, "其他能源", selectedEnterprise.energy * 0.022, "万tce"],
                  ].map(([Icon, label, value, unit]) => {
                    const EnergyIcon = Icon as typeof Zap;
                    return (
                      <small key={label as string}>
                        <EnergyIcon size={13} />
                        {label as string}
                        <strong>{(value as number * energyFactor).toFixed(2)} {unit as string}</strong>
                      </small>
                    );
                  })}
                </div>
              </>
            ) : (
              <small>综合能耗 {selectedEnterprise.energy.toFixed(1)} 万tce</small>
            )}
            <small>绿电占比 {selectedEnterprise.green.toFixed(1)}% · 碳排强度 {selectedEnterprise.intensity.toFixed(2)}</small>
          </div>
          <div className="enterprise-card-tags">
            {selectedEnterprise.isGreenFactory && <i>绿色工厂</i>}
            {selectedEnterprise.isZeroCarbonFactory && <i>零碳工厂</i>}
            {selectedEnterprise.isKeyEnterprise && <i>重点企业</i>}
          </div>
        </div>
      )}
      {selectedFacility && (
        <button
          type="button"
          className="viewer-selection-note"
          onClick={onClearFacility}
        >
          <span>
            <b>{selectedFacility.name}</b>
            <small>{selectedFacility.info}</small>
          </span>
        </button>
      )}
    </>
  );
}
