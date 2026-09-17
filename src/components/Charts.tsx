import { init, use, type ECharts } from "echarts/core";
import { LineChart as EChartsLineChart, PieChart } from "echarts/charts";
import {
  GridComponent,
  MarkPointComponent,
  TooltipComponent,
} from "echarts/components";
import { CanvasRenderer } from "echarts/renderers";
import { useEffect, useRef, useState, type RefObject } from "react";
import { chartTheme } from "../theme";

use([EChartsLineChart, PieChart, GridComponent, MarkPointComponent, TooltipComponent, CanvasRenderer]);

export type Slice = { name: string; value: number; color: string };

function useChartResize(chartRef: RefObject<ECharts | null>, hostRef: RefObject<HTMLDivElement | null>) {
  useEffect(() => {
    const host = hostRef.current;
    const chart = chartRef.current;
    if (!host || !chart) return;
    const observer = new ResizeObserver(() => chart.resize());
    observer.observe(host);
    return () => observer.disconnect();
  }, [chartRef, hostRef]);
}

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
  const hostRef = useRef<HTMLDivElement>(null);
  const chartRef = useRef<ECharts | null>(null);
  const [hover, setHover] = useState<Slice | null>(null);

  useEffect(() => {
    const host = hostRef.current;
    if (!host) return;
    const chart = init(host);
    chartRef.current = chart;
    chart.setOption({
      animationDuration: 750,
      animationEasing: "cubicOut",
      tooltip: {
        trigger: "item",
        backgroundColor: chartTheme.tooltipTheme.background,
        borderColor: chartTheme.tooltipTheme.border,
        textStyle: { color: chartTheme.tooltipTheme.text, fontSize: 11 },
        formatter: (params: { name: string; value: number; percent: number }) =>
          `${params.name}<br/><strong>${params.value}（${params.percent.toFixed(1)}%）</strong>`,
      },
      series: [
        {
          type: "pie",
          radius: ["65%", "85%"],
          center: ["50%", "50%"],
          avoidLabelOverlap: true,
          label: { show: false },
          labelLine: { show: false },
          itemStyle: {
            borderColor: "#03182d",
            borderWidth: 2,
            borderRadius: 3,
          },
          emphasis: {
            scale: true,
            scaleSize: 5,
            itemStyle: { shadowBlur: 12, shadowColor: "#46d9e166" },
          },
          data: data.map((slice) => ({
            name: slice.name,
            value: slice.value,
            itemStyle: { color: slice.color },
          })),
        },
      ],
    });
    chart.on("mouseover", (params: { dataIndex: number }) => setHover(data[params.dataIndex] ?? null));
    chart.on("mouseout", () => setHover(null));
    chart.on("click", (params: { dataIndex: number }) => {
      const slice = data[params.dataIndex];
      if (slice) onSelect?.(slice);
    });
    return () => {
      chart.dispose();
      chartRef.current = null;
    };
  }, [data, onSelect]);
  useChartResize(chartRef, hostRef);

  const total = data.reduce((sum, slice) => sum + slice.value, 0);
  return (
    <div className="donut" role="img" aria-label={`${label} ${value}`}>
      <div ref={hostRef} className="echart-canvas" />
      <div className="donut-center">
        <small>{hover?.name ?? label}</small>
        <strong>{hover ? `${((hover.value / total) * 100).toFixed(1)}%` : value}</strong>
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
  const [hidden, setHidden] = useState<string[]>([]);
  const hostRef = useRef<HTMLDivElement>(null);
  const chartRef = useRef<ECharts | null>(null);

  useEffect(() => {
    const host = hostRef.current;
    if (!host) return;
    const chart = init(host);
    chartRef.current = chart;
    chart.setOption({
      animationDuration: 800,
      animationEasing: "cubicOut",
      grid: { left: 34, right: 9, top: 12, bottom: 22 },
      tooltip: {
        trigger: "axis",
        backgroundColor: chartTheme.tooltipTheme.background,
        borderColor: chartTheme.tooltipTheme.border,
        textStyle: { color: chartTheme.tooltipTheme.text, fontSize: 11 },
        axisPointer: { type: "line", lineStyle: { color: chartTheme.lineTrend.crosshair, type: "dashed" } },
        formatter: (params: Array<{ seriesName: string; data: number; color: string; axisValue: string }>) => {
          const title = params[0]?.axisValue ?? "";
          return [title, ...params.map((item) => {
            const line = lines.find((entry) => entry.name === item.seriesName);
            const scaled = line?.displayScale ? item.data / line.displayScale : item.data;
            return `<span style="color:${item.color}">●</span> ${item.seriesName} <strong>${Number(scaled).toFixed(2)} ${line?.unit ?? unit}</strong>`;
          })].join("<br/>");
        },
      },
      xAxis: {
        type: "category",
        boundaryGap: false,
        data: labels,
        axisLine: { lineStyle: { color: "#20506a" } },
        axisTick: { show: false },
        axisLabel: { color: chartTheme.lineTrend.axis, fontSize: 10 },
      },
      yAxis: {
        type: "value",
        max,
        splitNumber: 5,
        axisLine: { show: false },
        axisTick: { show: false },
        axisLabel: { color: chartTheme.lineTrend.axis, fontSize: 10 },
        splitLine: { lineStyle: { color: chartTheme.lineTrend.grid, opacity: 0.38 } },
      },
      series: lines.map((line) => ({
        name: line.name,
        type: "line",
        smooth: true,
        showSymbol: true,
        symbol: "circle",
        symbolSize: 5,
        data: line.data,
        itemStyle: { color: line.color },
        lineStyle: { color: line.color, width: chartTheme.lineTrend.lineWidth, shadowBlur: 5, shadowColor: line.color },
        areaStyle: { color: line.color, opacity: chartTheme.lineTrend.areaOpacity },
        emphasis: { focus: "series", symbolSize: 8 },
        markPoint: {
          symbol: "circle",
          symbolSize: 8,
          data: [{ coord: [labels.length - 1, line.data[line.data.length - 1]] }],
          itemStyle: { color: line.color, shadowBlur: 10, shadowColor: line.color },
          label: { show: false },
        },
        silent: hidden.includes(line.name),
      })),
    });
    chart.on("click", (params: { dataIndex?: number }) => {
      if (typeof params.dataIndex === "number") onPoint?.(params.dataIndex);
    });
    return () => {
      chart.dispose();
      chartRef.current = null;
    };
  }, [hidden, labels, lines, max, onPoint, unit]);
  useChartResize(chartRef, hostRef);

  return (
    <div className="line-chart">
      <div className="chart-legend">
        {lines.map((line) => (
          <button
            type="button"
            key={line.name}
            className={hidden.includes(line.name) ? "muted-series" : ""}
            onClick={() => setHidden((current) => current.includes(line.name) ? current.filter((name) => name !== line.name) : [...current, line.name])}
            aria-pressed={!hidden.includes(line.name)}
          >
            <i style={{ background: line.color }} />
            {line.name}
          </button>
        ))}
      </div>
      <div ref={hostRef} className="echart-canvas line-echart" role="img" aria-label={`${unit}趋势图`} />
    </div>
  );
}
