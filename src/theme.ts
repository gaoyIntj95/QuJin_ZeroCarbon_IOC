export const visualTheme = {
  colors: {
    background: "#020b19",
    panel: "#03192c",
    panelRaised: "#06243b",
    border: "#155271",
    divider: "#123b55",
    title: "#e8f5ff",
    text: "#c3d7e7",
    muted: "#86a5ba",
    energy: "#42d7f5",
    green: "#55dfad",
    power: "#6ac9ff",
    gas: "#d6dc70",
    heat: "#ffbd62",
    carbon: "#ff7370",
    alert: "#ff656c",
  },
} as const;

export const chartTheme = {
  lineTrend: {
    grid: "#17415e",
    axis: "#a2bdd5",
    crosshair: "#78ccff",
    areaOpacity: 0.17,
    lineWidth: 2.2,
  },
  donutStructure: {
    track: "#0c2944",
    width: 23,
    hoverWidth: 28,
  },
  rankingBar: {
    track: "#12364d",
    start: "#246486",
    end: "#58d9e8",
  },
  progressBar: {
    track: "#18384f",
    highlight: "#ffffff22",
  },
  tooltipTheme: {
    background: "#03182df5",
    border: "#217998",
    text: "#e8f5ff",
  },
} as const;
