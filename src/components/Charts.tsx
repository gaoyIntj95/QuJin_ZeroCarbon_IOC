import { useId, useState } from "react";

export type Slice = { name: string; value: number; color: string };
export function Donut({
  data,
  value,
  label,
  onSelect,
}: {
  data: Slice[];
  value: string;
  label: string;
  onSelect?: (slice: Slice) => void;
}) {
  const [hover, setHover] = useState<Slice | null>(null);
  const total = data.reduce((s, d) => s + d.value, 0);
  let accumulated = 0;
  return (
    <div className="donut">
      <svg viewBox="0 0 160 160" role="group" aria-label={`${label} ${value}`}>
        <circle
          cx="80"
          cy="80"
          r="61"
          fill="none"
          stroke="#0c2944"
          strokeWidth="23"
        />
        {data.map((d) => {
          const length = (d.value / total) * 383.27;
          const offset = -accumulated;
          accumulated += length;
          return (
            <circle
              key={d.name}
              cx="80"
              cy="80"
              r="61"
              fill="none"
              stroke={d.color}
              strokeWidth={hover?.name === d.name ? 28 : 23}
              strokeDasharray={`${length - 1} ${384 - length}`}
              strokeDashoffset={offset}
              transform="rotate(-90 80 80)"
              onMouseEnter={() => setHover(d)}
              onMouseLeave={() => setHover(null)}
              onFocus={() => setHover(d)}
              onBlur={() => setHover(null)}
              onClick={() => onSelect?.(d)}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                  e.preventDefault();
                  onSelect?.(d);
                }
              }}
              tabIndex={0}
              role="button"
              aria-label={`${d.name} ${d.value}`}
            >
              <title>
                {d.name}：{d.value}（{((d.value / total) * 100).toFixed(1)}%）
              </title>
            </circle>
          );
        })}
      </svg>
      <div className="donut-center">
        <small>{hover?.name ?? label}</small>
        <strong>
          {hover ? `${((hover.value / total) * 100).toFixed(1)}%` : value}
        </strong>
      </div>
    </div>
  );
}
type Line = {
  name: string;
  color: string;
  data: number[];
  unit?: string;
  displayScale?: number;
};
export function LineChart({
  lines,
  labels,
  max = 100,
  unit,
  onPoint,
}: {
  lines: Line[];
  labels: string[];
  max?: number;
  unit: string;
  onPoint?: (index: number) => void;
}) {
  const [hover, setHover] = useState<number | null>(null);
  const [hidden, setHidden] = useState<string[]>([]);
  const uid = useId().replace(/:/g, "");
  const x = (i: number) => 36 + (i * 356) / (labels.length - 1);
  const y = (v: number) => 184 - (v / max) * 150;
  return (
    <div className="line-chart">
      <div className="chart-legend">
        {lines.map((l) => (
          <button
            key={l.name}
            className={hidden.includes(l.name) ? "muted-series" : ""}
            onClick={() =>
              setHidden((h) =>
                h.includes(l.name)
                  ? h.filter((n) => n !== l.name)
                  : [...h, l.name],
              )
            }
            aria-pressed={!hidden.includes(l.name)}
          >
            <i style={{ background: l.color }} />
            {l.name}
          </button>
        ))}
      </div>
      <svg
        viewBox="0 0 410 215"
        preserveAspectRatio="none"
        aria-label={`${unit}趋势图`}
        role="group"
      >
        <defs>
          {lines.map((l, i) => (
            <linearGradient
              key={l.name}
              id={`${uid}-${i}`}
              x1="0"
              y1="0"
              x2="0"
              y2="1"
            >
              <stop offset="0%" stopColor={l.color} stopOpacity=".17" />
              <stop offset="100%" stopColor={l.color} stopOpacity="0" />
            </linearGradient>
          ))}
        </defs>
        {Array.from({ length: 6 }, (_, i) => (
          <g key={i}>
            <line
              x1="36"
              x2="392"
              y1={y((i * max) / 5)}
              y2={y((i * max) / 5)}
              stroke="#17415e"
              strokeOpacity=".5"
            />
            <text x="29" y={y((i * max) / 5) + 4} textAnchor="end">
              {Math.round((i * max) / 5)}
            </text>
          </g>
        ))}
        {labels.map((l, i) => (
          <text key={l} x={x(i)} y="207" textAnchor="middle">
            {l}
          </text>
        ))}
        {lines.map((l, index) =>
          hidden.includes(l.name) ? null : (
            <g key={l.name}>
              <path
                d={`M ${x(0)} 184 ${l.data.map((v, i) => `L ${x(i)} ${y(v)}`).join(" ")} L ${x(l.data.length - 1)} 184 Z`}
                fill={`url(#${uid}-${index})`}
              />
              <polyline
                points={l.data.map((v, i) => `${x(i)},${y(v)}`).join(" ")}
                fill="none"
                stroke={l.color}
                strokeWidth="2.2"
              />
              {l.data.map((v, i) => (
                <circle
                  key={i}
                  cx={x(i)}
                  cy={y(v)}
                  r={hover === i ? 4 : 2.7}
                  fill={l.color}
                />
              ))}
            </g>
          ),
        )}
        {hover !== null && (
          <line
            x1={x(hover)}
            x2={x(hover)}
            y1="25"
            y2="185"
            stroke="#78ccff"
            strokeDasharray="4 4"
          />
        )}
        {labels.map((l, i) => (
          <rect
            key={l}
            x={x(i) - 12}
            y="23"
            width="24"
            height="168"
            fill="transparent"
            tabIndex={0}
            role="button"
            aria-label={`${l} ${lines.map((line) => `${line.name}${line.data[i]}`).join("，")}`}
            onMouseEnter={() => setHover(i)}
            onMouseLeave={() => setHover(null)}
            onFocus={() => setHover(i)}
            onBlur={() => setHover(null)}
            onClick={() => onPoint?.(i)}
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === " ") {
                e.preventDefault();
                onPoint?.(i);
              }
            }}
          />
        ))}
      </svg>
      {hover !== null && (
        <div
          className="chart-tooltip"
          style={{ left: `${Math.min((hover / labels.length) * 80 + 8, 53)}%` }}
        >
          <b>{labels[hover]}</b>
          {lines
            .filter((l) => !hidden.includes(l.name))
            .map((l) => (
              <span key={l.name}>
                <i style={{ background: l.color }} />
                {l.name}
                <strong>
                  {+(l.data[hover] / (l.displayScale ?? 1)).toFixed(2)}{" "}
                  {l.unit ?? unit}
                </strong>
              </span>
            ))}
        </div>
      )}
    </div>
  );
}
