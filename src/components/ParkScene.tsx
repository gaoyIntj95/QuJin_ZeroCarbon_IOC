import { useState, type CSSProperties } from "react";
import {
  BatteryCharging,
  Building2,
  Factory,
  Leaf,
  Navigation,
  Network,
  Sun,
  Wind,
  Zap,
  ZoomIn,
  ZoomOut,
  RotateCcw,
} from "lucide-react";
import { enterprises, energyModes, energyViews, type EnergyMode } from "../data";

const facilities = [
  {
    name: "分布式光伏",
    info: "装机 240 MW",
    x: 16,
    y: 19,
    icon: Sun,
    category: "新能源设施",
  },
  {
    name: "隆基股份",
    info: "绿电占比 86%",
    factoryType: "绿色工厂",
    x: 42,
    y: 31,
    icon: Factory,
    category: "重点企业",
  },
  {
    name: "风力发电",
    info: "装机 548 MW",
    x: 78,
    y: 19,
    icon: Wind,
    category: "新能源设施",
  },
  {
    name: "储能电站",
    info: "容量 120 MWh",
    x: 87,
    y: 36,
    icon: BatteryCharging,
    category: "储能设施",
  },
  {
    name: "变电站",
    info: "220 kV / 500 kV",
    x: 15,
    y: 63,
    icon: Zap,
    category: "储能设施",
  },
  {
    name: "晶澳太阳能",
    info: "绿电占比 82%",
    factoryType: "绿色工厂",
    x: 74,
    y: 32,
    icon: Factory,
    category: "重点企业",
  },
  {
    name: "亿纬锂能",
    info: "绿电占比 85%",
    factoryType: "零碳工厂",
    x: 49,
    y: 54,
    icon: Factory,
    category: "重点企业",
  },
  {
    name: "绿电直连线路",
    info: "已建 2 条",
    x: 80,
    y: 54,
    icon: Network,
    category: "绿电直连",
  },
];
const paths = [
  "M 82 220 C 205 252 302 348 430 426 S 660 508 850 355",
  "M 220 150 C 316 224 414 295 515 302 S 700 270 790 380",
  "M 168 475 C 286 425 395 384 505 405 S 700 422 850 335",
  "M 140 310 C 275 366 386 430 505 476 S 720 454 790 315 C 642 242 395 198 140 310 Z",
];
export function ParkScene({
  kind,
  mode = "electric",
  selected = 0,
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
  const [zoom, setZoom] = useState(1);
  const [category, setCategory] = useState("全部");
  const colors = ["#46b7ff", "#a7e871", "#ffb63f", "#48e4a6"];
  const activeIndex = mode === "all" ? -1 : Object.keys(energyModes).indexOf(mode);
  return (
    <section className={`park-scene park-${kind}`} aria-label="园区交互场景">
      <div className="park-world" style={{ transform: `scale(${zoom})` }}>
        <img
          className="park-image"
          src={`${import.meta.env.BASE_URL}assets/park-aerial.png`}
          alt="曲靖南海子工业园区鸟瞰示意图"
          draggable={false}
        />
        <svg
          className="map-overlay"
          viewBox="0 0 1000 700"
          preserveAspectRatio="none"
          aria-hidden="true"
        >
          <defs>
            <filter id={`glow-${kind}`}>
              <feGaussianBlur stdDeviation="4" />
            </filter>
            <radialGradient id={`heat-${kind}-high`}>
              <stop offset="0" stopColor="#ff5965" stopOpacity=".72" />
              <stop offset=".55" stopColor="#ff5965" stopOpacity=".24" />
              <stop offset="1" stopColor="#ff5965" stopOpacity="0" />
            </radialGradient>
            <radialGradient id={`heat-${kind}-medium`}>
              <stop offset="0" stopColor="#ffd25c" stopOpacity=".66" />
              <stop offset=".55" stopColor="#ffd25c" stopOpacity=".22" />
              <stop offset="1" stopColor="#ffd25c" stopOpacity="0" />
            </radialGradient>
            <radialGradient id={`heat-${kind}-low`}>
              <stop offset="0" stopColor="#45dfc2" stopOpacity=".62" />
              <stop offset=".55" stopColor="#45dfc2" stopOpacity=".2" />
              <stop offset="1" stopColor="#45dfc2" stopOpacity="0" />
            </radialGradient>
          </defs>
          {kind === "carbon"
            ? enterprises.map((e, i) => {
                const severity =
                  e.intensity >= 0.4
                    ? "high"
                    : e.intensity >= 0.35
                      ? "medium"
                      : "low";
                const color =
                  severity === "high"
                    ? "#ff574f"
                    : severity === "medium"
                      ? "#ffce4b"
                      : "#46eac1";
                return (
                  <g
                    key={e.name}
                    opacity={level === "all" || severity === level ? 1 : 0.08}
                  >
                    <ellipse
                      cx={e.x * 10}
                      cy={e.y * 7 + 50}
                      rx={i === selected ? 138 : 112}
                      ry={i === selected ? 88 : 72}
                      fill={`url(#heat-${kind}-${severity})`}
                    />
                    <ellipse
                      cx={e.x * 10}
                      cy={e.y * 7 + 50}
                      rx={i === selected ? 86 : 70}
                      ry={i === selected ? 53 : 45}
                      fill="none"
                      stroke={color}
                      strokeWidth="2"
                      strokeDasharray="6 8"
                      opacity=".62"
                    />
                    <circle
                      cx={e.x * 10}
                      cy={e.y * 7 + 50}
                      r={i === selected ? 8 : 5}
                      fill={color}
                      opacity=".9"
                      filter={`url(#glow-${kind})`}
                    />
                  </g>
                );
              })
            : paths.map((d, i) => (
                <g
                  key={d}
                  opacity={
                    kind === "overview"
                      ? i === 3
                        ? 0.85
                        : 0
                      : mode === "all" || i === activeIndex
                        ? 1
                        : 0.15
                  }
                  style={{ color: kind === "overview" ? "#66f8b2" : colors[i] }}
                >
                  <path
                    d={d}
                    className="flow-glow"
                    filter={`url(#glow-${kind})`}
                  />
                  <path d={d} className="flow-track" />
                  <path d={d} className="flow-particles" />
                </g>
              ))}
        </svg>
        {kind === "overview" ? (
          <>
            {facilities
              .filter((f) => category === "全部" || f.category === category)
              .map((f) => (
                <button
                  key={f.name}
                  className="map-pin facility-pin"
                  style={{ left: `${f.x}%`, top: `${f.y}%` }}
                  onClick={() => onFacility?.(f.name, f.info)}
                >
                  <f.icon size={27} />
                  <span>
                    <b>{f.name}</b>
                    <small>{f.info}</small>
                    {f.factoryType && (
                      <small
                        className={`factory-status ${f.factoryType === "零碳工厂" ? "zero-carbon" : "green-factory"}`}
                      >
                        {f.factoryType}
                      </small>
                    )}
                  </span>
                  <i />
                </button>
              ))}
            <div className="district-label">
              绿色硅光伏产业区<small>核心承载区</small>
            </div>
          </>
        ) : (
          enterprises.map((e, i) => {
            const severity =
              e.intensity >= 0.4
                ? "high"
                : e.intensity >= 0.35
                  ? "medium"
                  : "low";
            return (
              <button
                key={e.name}
                className={`map-pin enterprise-pin ${i === selected ? "selected" : ""} ${kind === "carbon" ? severity : ""}`}
                style={
                  {
                    left: `${e.x}%`,
                    top: `${e.y}%`,
                    opacity:
                      kind !== "carbon" || level === "all" || level === severity
                        ? 1
                        : 0.22,
                    "--pin-color":
                      kind === "energy" ? energyViews[mode].color : undefined,
                  } as CSSProperties
                }
                onClick={() => {
                  onSelect(i);
                  onHover?.(null);
                }}
                onMouseEnter={() => onHover?.(i)}
                onMouseLeave={() => onHover?.(null)}
                aria-pressed={selected === i}
              >
                <Building2 size={23} />
                <span>
                  <b>{e.name}</b>
                  <small>
                    {kind === "carbon"
                      ? `${e.carbon} 万tCO₂`
                      : `${(e.energy * factor * (mode === "all" ? 1 : mode === "electric" ? 0.925 : mode === "gas" ? 0.029 : mode === "heat" ? 0.023 : (0.925 * e.green) / 100)).toFixed(2)} ${energyViews[mode].unit}`}
                  </small>
                  {kind === "carbon" && (
                    <small>强度 {e.intensity.toFixed(2)}</small>
                  )}
                </span>
                <i />
              </button>
            );
          })
        )}
      </div>
      <div className="map-title">
        {kind === "overview"
          ? "曲靖经济技术开发区南海子工业园区"
          : kind === "carbon"
            ? "曲靖经开区南海子片区碳排放热力图"
            : "园区能源流向分布"}
      </div>
      <div className="compass">
        <span>N</span>
        <Navigation size={31} />
      </div>
      <div className="map-tools">
        <button
          aria-label="放大园区"
          disabled={zoom >= 1.4}
          onClick={() => setZoom((z) => Math.min(1.4, z + 0.1))}
        >
          <ZoomIn size={17} />
        </button>
        <button
          aria-label="缩小园区"
          disabled={zoom <= 1}
          onClick={() => setZoom((z) => Math.max(1, z - 0.1))}
        >
          <ZoomOut size={17} />
        </button>
        <button aria-label="重置园区视角" onClick={() => setZoom(1)}>
          <RotateCcw size={16} />
        </button>
      </div>
      <div className="map-legend">
        {kind === "overview" ? (
          ["全部", "重点企业", "新能源设施", "储能设施", "绿电直连"].map(
            (c, i) => (
              <button
                key={c}
                aria-pressed={category === c}
                className={category === c ? "active" : ""}
                onClick={() => setCategory(c)}
              >
                {i === 1 ? (
                  <Building2 size={17} />
                ) : i === 2 ? (
                  <Wind size={17} />
                ) : i === 3 ? (
                  <BatteryCharging size={17} />
                ) : (
                  <Leaf size={17} />
                )}
                {c}
              </button>
            ),
          )
        ) : kind === "energy" ? (
          Object.entries(energyModes).map(([key, m]) => (
            <span key={key} style={{ color: m.color }}>
              <i className="legend-flow" />
              {m.label}
            </span>
          ))
        ) : (
          <>
            <span>
              <Building2 size={16} /> 重点企业
            </span>
            <span>
              <Zap size={16} /> 绿电直连
            </span>
            <span>
              <Wind size={16} /> 风电设施
            </span>
            <span>
              <BatteryCharging size={16} /> 储能设施
            </span>
            <span>
              <Network size={16} /> 园区边界
            </span>
          </>
        )}
      </div>
    </section>
  );
}
