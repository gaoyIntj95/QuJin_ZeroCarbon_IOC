import * as C from "cesium";
import { coordinate } from "./sceneUtils";

type V = [number, number, number];
type TextureKind =
  | "wall"
  | "roof"
  | "glass"
  | "solar"
  | "concrete"
  | "asphalt"
  | "grass"
  | "water";
const textures = new Map<string, HTMLCanvasElement>();

/** Small repeatable material maps. Geometry and business metadata stay independent. */
export function parkTexture(kind: TextureKind) {
  if (textures.has(kind)) return textures.get(kind)!;
  const canvas = document.createElement("canvas");
  canvas.width = canvas.height = 256;
  const ctx = canvas.getContext("2d")!;
  const bases: Record<TextureKind, string> = {
    wall: "#bbc0bf",
    roof: "#919b9e",
    glass: "#536774",
    solar: "#233b4b",
    concrete: "#92958d",
    asphalt: "#535a5c",
    grass: "#747c66",
    water: "#3b6069",
  };
  ctx.fillStyle = bases[kind];
  ctx.fillRect(0, 0, 256, 256);
  let seed = 371;
  const random = () => {
    seed = (seed * 16807) % 2147483647;
    return seed / 2147483647;
  };
  const grain = ctx.getImageData(0, 0, 256, 256);
  for (let i = 0; i < grain.data.length; i += 4) {
    const n =
      (random() - 0.5) * (kind === "grass" ? 3 : kind === "water" ? 2 : 5);
    grain.data[i] += n;
    grain.data[i + 1] += n;
    grain.data[i + 2] += n;
  }
  ctx.putImageData(grain, 0, 0);
  if (kind === "wall" || kind === "roof") {
    for (let x = 0; x < 256; x += 8) {
      ctx.fillStyle = "#ffffff17";
      ctx.fillRect(x, 0, 2, 256);
      ctx.fillStyle = "#24333a20";
      ctx.fillRect(x + 2, 0, 1, 256);
    }
    ctx.strokeStyle = "#33454b38";
    ctx.lineWidth = 1;
    for (let y = 0; y < 256; y += 64) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(256, y);
      ctx.stroke();
    }
  }
  if (kind === "solar") {
    ctx.fillStyle = "#102638";
    ctx.fillRect(3, 3, 250, 250);
    for (let r = 0; r < 8; r++)
      for (let c = 0; c < 6; c++) {
        ctx.fillStyle = (r + c) % 4 === 0 ? "#2f4b5a" : "#253d50";
        ctx.fillRect(6 + c * 41, 6 + r * 31, 38, 28);
        ctx.fillStyle = "#8d9ea242";
        ctx.fillRect(10 + c * 41, 6 + r * 31, 1, 28);
      }
    ctx.strokeStyle = "#9da9aa";
    ctx.lineWidth = 3;
    ctx.strokeRect(1.5, 1.5, 253, 253);
  }
  if (kind === "glass") {
    for (let r = 0; r < 4; r++)
      for (let c = 0; c < 6; c++) {
        const grad = ctx.createLinearGradient(0, r * 64, 0, r * 64 + 48);
        grad.addColorStop(0, "#708592");
        grad.addColorStop(1, (r + c) % 3 ? "#3c5363" : "#647783");
        ctx.fillStyle = grad;
        ctx.fillRect(c * 43 + 3, r * 64 + 3, 37, 46);
        ctx.fillStyle = "#b6bfbd";
        ctx.fillRect(c * 43, r * 64, 2, 64);
        ctx.fillRect(0, r * 64 + 51, 256, 13);
      }
  }
  if (kind === "concrete") {
    ctx.strokeStyle = "#484f4b30";
    for (let i = 0; i <= 256; i += 64) {
      ctx.beginPath();
      ctx.moveTo(i, 0);
      ctx.lineTo(i, 256);
      ctx.moveTo(0, i);
      ctx.lineTo(256, i);
      ctx.stroke();
    }
  }
  if (kind === "grass") {
    for (let i = 0; i < 18; i++) {
      const x = random() * 256,
        y = random() * 256;
      const shade = ctx.createRadialGradient(x, y, 0, x, y, 60);
      shade.addColorStop(0, i % 2 ? "#59684b18" : "#bdbaa010");
      shade.addColorStop(1, "#747c6600");
      ctx.fillStyle = shade;
      ctx.fillRect(0, 0, 256, 256);
    }
  }
  if (kind === "water") {
    for (let i = 0; i < 100; i++) {
      ctx.strokeStyle = "#a3b8b60d";
      const x = random() * 256,
        y = random() * 256;
      ctx.beginPath();
      ctx.moveTo(x, y);
      ctx.lineTo(x + 8 + random() * 25, y + 1);
      ctx.stroke();
    }
  }
  textures.set(kind, canvas);
  return canvas;
}

type Material = {
  base: [number, number, number, number];
  texture?: TextureKind;
  roughness?: number;
  metal?: number;
};
const materials: Material[] = [
  { base: [1, 1, 1, 1], texture: "wall", roughness: 0.85 },
  { base: [1, 1, 1, 1], texture: "roof", roughness: 0.67 },
  { base: [1, 1, 1, 1], texture: "glass", roughness: 0.3, metal: 0.25 },
  { base: [1, 1, 1, 1], texture: "solar", roughness: 0.38, metal: 0.18 },
  { base: [0.7, 0.73, 0.72, 1], roughness: 0.9 },
  { base: [0.31, 0.36, 0.39, 1], roughness: 0.75 },
  { base: [0.77, 0.78, 0.74, 1], roughness: 0.8 },
];
class Mesh {
  groups = new Map<
    number,
    { p: number[]; n: number[]; uv: number[]; indices: number[] }
  >();
  quad(a: V, b: V, c: V, d: V, mat: number, repeat: [number, number] = [1, 1]) {
    let g = this.groups.get(mat);
    if (!g) {
      g = { p: [], n: [], uv: [], indices: [] };
      this.groups.set(mat, g);
    }
    const u = b.map((n, i) => n - a[i]),
      v = c.map((n, i) => n - a[i]);
    const n = [
        u[1] * v[2] - u[2] * v[1],
        u[2] * v[0] - u[0] * v[2],
        u[0] * v[1] - u[1] * v[0],
      ],
      length = Math.hypot(...n) || 1;
    const offset = g.p.length / 3;
    for (const pt of [a, b, c, d]) {
      g.p.push(...pt);
      g.n.push(...n.map((x) => x / length));
    }
    g.uv.push(0, 0, repeat[0], 0, repeat[0], repeat[1], 0, repeat[1]);
    g.indices.push(
      offset,
      offset + 1,
      offset + 2,
      offset,
      offset + 2,
      offset + 3,
    );
  }
  block(
    x: number,
    y: number,
    z: number,
    w: number,
    h: number,
    d: number,
    mat: number,
    wall = mat,
  ) {
    const l = x - w / 2,
      r = x + w / 2,
      b = y,
      t = y + h,
      f = z + d / 2,
      k = z - d / 2;
    this.quad([l, b, f], [r, b, f], [r, t, f], [l, t, f], wall, [
      w / 35,
      h / 35,
    ]);
    this.quad([r, b, k], [l, b, k], [l, t, k], [r, t, k], wall, [
      w / 35,
      h / 35,
    ]);
    this.quad([l, b, k], [l, b, f], [l, t, f], [l, t, k], wall, [
      d / 35,
      h / 35,
    ]);
    this.quad([r, b, f], [r, b, k], [r, t, k], [r, t, f], wall, [
      d / 35,
      h / 35,
    ]);
    this.quad([l, t, f], [r, t, f], [r, t, k], [l, t, k], mat, [
      w / 35,
      d / 35,
    ]);
  }
  solar(x: number, z: number, w: number, d: number, height: number) {
    // Tilted racks with visible separation, frames and individual cell texture.
    this.quad(
      [x - w / 2, height, z + d / 2],
      [x + w / 2, height, z + d / 2],
      [x + w / 2, height + d * 0.1, z - d / 2],
      [x - w / 2, height + d * 0.1, z - d / 2],
      3,
      [Math.max(1, w / 8), Math.max(1, d / 6)],
    );
    this.block(x, height - 1, z, w, 1, 1, 5);
  }
  uri() {
    const chunks: Uint8Array[] = [],
      views: object[] = [],
      accessors: object[] = [],
      primitives: object[] = [];
    let byteLength = 0;
    const add = (
      array: Float32Array | Uint32Array,
      type: string,
      min?: number[],
      max?: number[],
    ) => {
      const bytes = new Uint8Array(array.buffer);
      const view = views.length;
      views.push({
        buffer: 0,
        byteOffset: byteLength,
        byteLength: bytes.length,
      });
      chunks.push(bytes);
      byteLength += bytes.length;
      const index = accessors.length;
      accessors.push({
        bufferView: view,
        componentType: array instanceof Float32Array ? 5126 : 5125,
        count: array.length / (type === "VEC3" ? 3 : type === "VEC2" ? 2 : 1),
        type,
        ...(min ? { min, max } : {}),
      });
      return index;
    };
    for (const [material, g] of this.groups) {
      const min = [Infinity, Infinity, Infinity],
        max = [-Infinity, -Infinity, -Infinity];
      g.p.forEach((x, i) => {
        min[i % 3] = Math.min(min[i % 3], x);
        max[i % 3] = Math.max(max[i % 3], x);
      });
      const POSITION = add(new Float32Array(g.p), "VEC3", min, max),
        NORMAL = add(new Float32Array(g.n), "VEC3"),
        TEXCOORD_0 = add(new Float32Array(g.uv), "VEC2"),
        indices = add(new Uint32Array(g.indices), "SCALAR");
      primitives.push({
        attributes: { POSITION, NORMAL, TEXCOORD_0 },
        indices,
        material,
      });
    }
    const buffer = new Uint8Array(byteLength);
    let cursor = 0;
    for (const chunk of chunks) {
      buffer.set(chunk, cursor);
      cursor += chunk.length;
    }
    let binary = "";
    for (let i = 0; i < buffer.length; i += 8192)
      binary += String.fromCharCode(...buffer.subarray(i, i + 8192));
    const kinds = ["wall", "roof", "glass", "solar"] as TextureKind[];
    const gltf = {
      asset: { version: "2.0", generator: "Park low-poly assets" },
      scene: 0,
      scenes: [{ nodes: [0] }],
      nodes: [{ mesh: 0 }],
      meshes: [{ primitives }],
      buffers: [
        {
          byteLength,
          uri: "data:application/octet-stream;base64," + btoa(binary),
        },
      ],
      bufferViews: views,
      accessors,
      samplers: [
        { magFilter: 9729, minFilter: 9987, wrapS: 10497, wrapT: 10497 },
      ],
      images: kinds.map((k) => ({ uri: parkTexture(k).toDataURL() })),
      textures: kinds.map((_, i) => ({ sampler: 0, source: i })),
      materials: materials.map((m) => ({
        doubleSided: true,
        pbrMetallicRoughness: {
          baseColorFactor: m.base,
          roughnessFactor: m.roughness ?? 0.8,
          metallicFactor: m.metal ?? 0,
          ...(m.texture
            ? { baseColorTexture: { index: kinds.indexOf(m.texture) } }
            : {}),
        },
      })),
    };
    return "data:model/gltf+json;base64," + btoa(JSON.stringify(gltf));
  }
}
const models = new Map<string, string>();
export function buildingModel(
  type: string,
  w: number,
  d: number,
  h: number,
  solar = false,
) {
  const key = [type, w, d, h, solar].join(":");
  if (models.has(key)) return models.get(key)!;
  const m = new Mesh();
  if (type === "factory") {
    m.block(0, 0, 0, w, h, d, 1, 0);
    const bays = 3,
      bay = d / bays,
      rise = 4.5;
    for (let b = 0; b < bays; b++) {
      const z = -d / 2 + b * bay;
      m.quad(
        [-w / 2 - 2, h, z],
        [-w / 2 - 2, h + rise, z + bay / 2],
        [w / 2 + 2, h + rise, z + bay / 2],
        [w / 2 + 2, h, z],
        1,
        [bay / 40, w / 40],
      );
      m.quad(
        [-w / 2 - 2, h + rise, z + bay / 2],
        [-w / 2 - 2, h, z + bay],
        [w / 2 + 2, h, z + bay],
        [w / 2 + 2, h + rise, z + bay / 2],
        1,
        [bay / 40, w / 40],
      );
      for (let i = 0; i < 6; i++) {
        const x = ((i - 2.5) * w) / 6;
        if (solar)
          m.solar(x, z + bay * 0.27, w / 6 - 8, bay * 0.35, h + rise + 1);
        else m.block(x, h + rise, z + bay / 2, w / 12, 2, 5, 2);
      }
    }
    for (let i = 0; i < 10; i++) {
      const x = ((i - 4.5) * w) / 10;
      m.block(x, 3, d / 2 + 0.2, 17, 16, 1, 5);
      m.block(x, 20, d / 2 + 5, 22, 1.4, 12, 4);
      m.block(x, h * 0.68, d / 2 + 0.4, 27, 6, 1, 2);
      m.block(x, 0, d / 2 + 12, 22, 2, 17, 4);
    }
    for (let i = 0; i < 7; i++)
      m.block(((i - 3) * w) / 8, h + 5, -d / 2 + 8, 9, 5, 9, 5);
  } else if (type === "office") {
    m.block(0, 0, 0, w, h, d, 6, 2);
    // Vertical concrete piers break the glass facade into bays.
    for (let x = -w / 2; x <= w / 2; x += w / 8)
      m.block(x, 0, d / 2 + 0.5, 3, h, 2, 6);
    m.block(0, h, 0, w + 4, 2, d + 4, 6);
    m.block(0, h + 2, 0, w * 0.32, 7, d * 0.35, 5);
    m.block(0, 0, d / 2 + 5, w * 0.3, 9, 15, 2);
    m.block(0, 9, d / 2 + 8, w * 0.4, 1.5, 23, 6);
  } else {
    m.block(0, 0, 0, w, h, d, 1, 0);
    m.block(0, h, 0, w + 2, 2, d + 2, 4);
    for (let x = -w * 0.35; x < w * 0.4; x += w * 0.2)
      m.block(x, h * 0.45, d / 2 + 0.5, w * 0.1, h * 0.3, 1, 2);
  }
  const uri = m.uri();
  models.set(key, uri);
  return uri;
}
export function facilityModel(type: string) {
  if (models.has(type)) return models.get(type)!;
  const m = new Mesh();
  if (type === "storage") {
    for (let row = 0; row < 2; row++)
      for (let col = 0; col < 4; col++) {
        const x = (col - 1.5) * 57,
          z = (row - 0.5) * 82;
        m.block(x, 1, z, 40, 25, 64, 6, 0);
        m.block(x, 5, z + 32.5, 35, 17, 1, 4);
        for (let i = 0; i < 7; i++)
          m.block(x, 7 + i * 1.5, z + 33, 26, 0.6, 1, 5);
        m.block(x, 26, z - 10, 20, 3, 20, 5);
      }
  } else if (type === "substation") {
    for (let i = 0; i < 3; i++) {
      const x = (i - 1) * 85;
      m.block(x, 0, 15, 55, 5, 65, 4);
      m.block(x, 5, 15, 35, 25, 44, 5);
      for (let f = 0; f < 8; f++) m.block(x - 25 + f * 7, 9, 15, 2, 19, 58, 4);
      for (let k = 0; k < 3; k++) {
        m.block(x + (k - 1) * 10, 30, 15, 3, 12, 3, 6);
        m.block(x + (k - 1) * 10, 34, 15, 6, 1, 6, 5);
      }
      for (const side of [-1, 1]) m.block(x + side * 28, 0, -60, 3, 45, 3, 4);
      m.block(x, 43, -60, 62, 3, 4, 4);
      m.block(x, 32, -25, 3, 2, 75, 5);
    }
    for (let i = 0; i < 8; i++) {
      m.block((i - 3.5) * 32, 0, 105, 1.3, 14, 1.3, 5);
    }
    m.block(0, 13, 105, 245, 1, 1, 5);
  } else if (type === "solar") {
    for (let r = 0; r < 5; r++)
      for (let c = 0; c < 7; c++)
        m.solar((c - 3) * 60, (r - 2) * 42, 54, 31, 5);
  }
  const uri = m.uri();
  models.set(type, uri);
  return uri;
}
export function addParkModel(
  v: C.Viewer,
  id: string,
  x: number,
  y: number,
  uri: string,
  properties: Record<string, unknown>,
) {
  const position = coordinate(x, y, 3);
  return v.entities.add({
    id,
    position,
    orientation: C.Transforms.headingPitchRollQuaternion(
      position,
      // Cesium aligns glTF forward to local X; restore the authored east-west footprint.
      new C.HeadingPitchRoll(Math.PI / 2, 0, 0),
    ),
    model: {
      uri,
      shadows: C.ShadowMode.ENABLED,
      enableVerticalExaggeration: false,
    },
    properties,
  });
}
