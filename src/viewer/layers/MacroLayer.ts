import * as C from "cesium";
import type { ParkViewerData } from "../types";
import { polygon, line, label, color } from "../geometry";
import { coordinate } from "../sceneUtils";
import { mapRelief, irregularBoundary } from "../mapRelief";

export const macroDistricts = [
  {
    id: "west",
    name: "西城片区",
    focus: "重点产业与企业分布",
    center: [22, 45],
    points: [[9, 37], [17, 34], [21, 39], [28, 31], [39, 37], [42, 49], [37, 57], [27, 61], [16, 56], [11, 48], [6, 45]],
  },
  {
    id: "battery",
    name: "新能源电池产业园",
    focus: "新能源电池产业集聚",
    center: [48, 26],
    points: [[28, 31], [33, 25], [36, 26], [38, 17], [43, 14], [42, 10], [48, 6], [55, 10], [57, 17], [65, 19], [67, 26], [62, 34], [53, 38], [39, 37]],
  },
  {
    id: "solar",
    name: "绿色硅光伏产业园",
    focus: "光伏产业集聚",
    center: [80, 39],
    points: [[62, 34], [67, 26], [73, 28], [79, 24], [84, 30], [91, 31], [93, 35], [99, 37], [96, 44], [91, 48], [83, 51], [76, 48], [69, 53], [61, 48], [53, 38]],
  },
  {
    id: "recycle",
    name: "循环利用产业区",
    focus: "资源循环与产业协同",
    center: [39, 72],
    points: [[27, 61], [37, 57], [42, 49], [53, 52], [61, 48], [64, 60], [59, 65], [64, 76], [55, 79], [48, 85], [39, 87], [32, 94], [26, 91], [18, 96], [18, 88], [24, 82], [20, 76], [25, 68]],
  },
  {
    id: "nanhai",
    name: "南海子片区",
    focus: "企业与能源设施 · 可进入园区",
    center: [80, 66],
    points: [[61, 48], [69, 53], [76, 48], [83, 51], [85, 56], [93, 57], [96, 65], [92, 73], [84, 77], [80, 82], [69, 80], [64, 76], [59, 65], [64, 60]],
  },
];

export function addMacroLayer(v: C.Viewer, _data: ParkViewerData) {
  const base = polygon(v, "macro-base", [[-35, -30], [135, -30], [135, 130], [-35, 130]], "#061c2c");
  base.polygon!.material = new C.ImageMaterialProperty({ image: mapRelief() });

  for (let i = -20; i < 130; i += 8) {
    line(v, "grid-x-" + i, [[i, -20], [i, 125]], "#12354a66", 1, 1);
    line(v, "grid-y-" + i, [[-25, i], [130, i]], "#12354a66", 1, 1);
  }
  for (let n = 0; n < 8; n++) {
    const pts = Array.from({ length: 66 }, (_, j) => {
      const a = (j / 65) * Math.PI * 2;
      const r = 20 + n * 2.7 + Math.sin(a * 5 + n * 0.2) * 3;
      return [50 + Math.cos(a) * r * 1.25, 50 + Math.sin(a) * r];
    });
    line(v, "contour-" + n, pts, "#17455a55", 1, 2);
  }

  macroDistricts.forEach((d, i) => {
    const props = { kind: "macro-district", districtId: d.id };
    const boundary = irregularBoundary(d.points);
    const focused = d.id === "nanhai";
    polygon(v, "district-" + d.id, boundary, focused ? "#14607599" : "#103e5588", 5, props);
    line(v, "district-border-" + d.id, [...boundary, boundary[0]], focused ? "#63f6df" : "#35bce6", 2, 8, false, props);
    for (let n = 0; n < 3; n++) {
      const x = d.center[0] + (n - 1) * 6;
      const y = d.center[1] + 11 + (n % 2) * 3;
      v.entities.add({
        id: `regional-facility-${d.id}-${n}`,
        position: coordinate(x, y, 18),
        point: {
          pixelSize: 7,
          color: color(n === 1 ? "#9bea8a" : "#66dcf6"),
          outlineWidth: 2,
          outlineColor: color("#103f53"),
          disableDepthTestDistance: Infinity,
        },
        properties: props,
      });
      line(v, `regional-feeder-${d.id}-${n}`, [[d.center[0], d.center[1] + 3], [x, y]], n === 1 ? "#a5ce6a" : "#4fadba", 1, 14, false, props);
    }
    label(v, "district-label-" + d.id, d.center[0], d.center[1] - 5, d.name, focused ? "#a1ffe7" : "#d0f3ff", 15, props);
    v.entities.add({
      id: "district-node-" + d.id,
      position: coordinate(d.center[0], d.center[1] + 3, 20),
      point: {
        pixelSize: 10,
        color: color(focused ? "#83ffbd" : "#55d8fa"),
        outlineWidth: 3,
        outlineColor: color("#114c67"),
        disableDepthTestDistance: Infinity,
      },
      properties: props,
    });
  });

  const links = [[0, 1], [1, 2], [0, 3], [2, 4], [3, 4]];
  links.forEach(([a, b], i) => {
    const s = macroDistricts[a].center;
    const t = macroDistricts[b].center;
    line(v, "macro-link-" + i, [[s[0], s[1] + 3], [(s[0] + t[0]) / 2, (s[1] + t[1]) / 2 + 7], [t[0], t[1] + 3]], i % 2 ? "#75deb1" : "#4eacdb", 2, 12, true, { kind: "macro-link" });
  });

  const perimeter = irregularBoundary([
    [9, 37], [17, 34], [21, 39], [28, 31], [33, 25], [36, 26], [38, 17], [43, 14], [42, 10], [48, 6], [55, 10], [57, 17], [65, 19], [67, 26], [73, 28], [79, 24], [84, 30], [91, 31], [93, 35], [99, 37], [96, 44], [91, 48], [83, 51], [85, 56], [93, 57], [96, 65], [92, 73], [84, 77], [80, 82], [69, 80], [64, 76], [55, 79], [48, 85], [39, 87], [32, 94], [26, 91], [18, 96], [18, 88], [24, 82], [20, 76], [25, 68], [27, 61], [16, 56], [11, 48], [6, 45],
  ]);
  line(v, "macro-outline-glow", [...perimeter, perimeter[0]], "#21c5ff", 13, 9, true);
  line(v, "macro-outline-core", [...perimeter, perimeter[0]], "#acffff", 2, 10);
  polygon(v, "macro-region-fill", perimeter, "#12485b66", 3);
  label(v, "macro-note", 52, 101, "产业空间与园区位置为展示示意", "#678e9f", 11);
}
