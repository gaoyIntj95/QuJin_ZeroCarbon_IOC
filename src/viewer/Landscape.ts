import * as C from "cesium";
import { coordinate } from "./sceneUtils";

/** Batched low-poly vegetation; no camera-facing tree stickers. */
export function addLandscape(v: C.Viewer) {
  let seed = 211;
  const random = () => {
    seed = (seed * 16807) % 2147483647;
    return seed / 2147483647;
  };
  const instances: C.GeometryInstance[] = [];
  const crowns = [0, 1, 2].map(
    (i) =>
      C.EllipsoidGeometry.createGeometry(
        new C.EllipsoidGeometry({
          radii: new C.Cartesian3(10 + i * 2, 9 + i * 1.5, 12 + i),
          stackPartitions: 6,
          slicePartitions: 8,
          vertexFormat: C.PerInstanceColorAppearance.VERTEX_FORMAT,
        }),
      )!,
  );
  const trunk = C.CylinderGeometry.createGeometry(
    new C.CylinderGeometry({
      length: 14,
      topRadius: 0.6,
      bottomRadius: 1.1,
      slices: 6,
      vertexFormat: C.PerInstanceColorAppearance.VERTEX_FORMAT,
    }),
  )!;
  const colors = ["#4b5e47", "#5b6a4d", "#627250", "#546650"];
  const part = (
    geometry: C.Geometry,
    x: number,
    y: number,
    z: number,
    tint: string,
  ) => {
    instances.push(
      new C.GeometryInstance({
        geometry,
        modelMatrix: C.Transforms.eastNorthUpToFixedFrame(coordinate(x, y, z)),
        attributes: {
          color: C.ColorGeometryInstanceAttribute.fromColor(
            C.Color.fromCssColorString(tint),
          ),
        },
      }),
    );
  };
  const put = (x: number, y: number) => {
    const type = Math.floor(random() * 3);
    part(trunk, x, y, 7, "#66604e");
    part(crowns[type], x, y, 22, colors[Math.floor(random() * colors.length)]);
  };
  for (const y of [10, 46, 78, 94])
    for (let x = 7; x < 101; x += 2.5)
      if (random() > 0.17)
        put(x + (random() - 0.5) * 0.8, y + (random() - 0.5) * 0.35);
  for (const x of [6, 40, 70, 100])
    for (let y = 15; y < 92; y += 3.1)
      if (random() > 0.25)
        put(x + (random() - 0.5) * 0.4, y + (random() - 0.5));
  for (let i = 0; i < 155; i++) {
    const x = -5 + random() * 114,
      y =
        100 +
        Math.sin(x * 0.085) * 2.5 +
        Math.sin(x * 0.21) * 0.7 -
        random() * 2;
    if (Math.abs(x - 38) > 2) put(x, y);
  }
  for (let i = 0; i < 42; i++) {
    const x = 43 + random() * 22,
      y = 80 + random() * 10;
    if (x < 47 || x > 59) put(x, y);
  }
  for (let i = 0; i < 90; i++) put(-12 + random() * 126, -13 + random() * 17);
  const vegetation = new C.Primitive({
    geometryInstances: instances,
    appearance: new C.PerInstanceColorAppearance({
      flat: false,
      translucent: false,
    }),
    asynchronous: false,
    shadows: C.ShadowMode.ENABLED,
    allowPicking: false,
  });
  v.scene.primitives.add(vegetation);
  const columns = 65,
    rows = 28,
    positions: number[] = [],
    indices: number[] = [];
  for (let r = 0; r <= rows; r++)
    for (let c = 0; c <= columns; c++) {
      const x = -110 + c * 4.5,
        y = -150 + r * 5.2;
      const edge = Math.min(1, Math.max(0, (-14 - y) / 65));
      const ridge =
        160 +
        Math.sin(x * 0.026 + y * 0.012) * 90 +
        Math.sin(x * 0.065 - y * 0.017) * 45 +
        Math.sin(x * 0.13 + y * 0.06) * 14;
      const p = coordinate(x, y, Math.max(0, ridge * edge));
      positions.push(p.x, p.y, p.z);
    }
  for (let r = 0; r < rows; r++)
    for (let c = 0; c < columns; c++) {
      const a = r * (columns + 1) + c,
        b = a + 1,
        d = a + columns + 1;
      indices.push(a, d, b, b, d, d + 1);
    }
  const attributes = new C.GeometryAttributes();
  attributes.position = new C.GeometryAttribute({
    componentDatatype: C.ComponentDatatype.DOUBLE,
    componentsPerAttribute: 3,
    values: new Float64Array(positions),
  });
  const geometry = new C.Geometry({
    attributes,
    indices: new Uint16Array(indices),
    primitiveType: C.PrimitiveType.TRIANGLES,
    boundingSphere: C.BoundingSphere.fromVertices(positions),
  });
  C.GeometryPipeline.computeNormal(geometry);
  const terrain = new C.Primitive({
    geometryInstances: new C.GeometryInstance({
      geometry,
      attributes: {
        color: C.ColorGeometryInstanceAttribute.fromColor(
          C.Color.fromCssColorString("#727d68"),
        ),
      },
    }),
    appearance: new C.PerInstanceColorAppearance({
      flat: false,
      translucent: false,
    }),
    asynchronous: false,
    allowPicking: false,
  });
  v.scene.primitives.add(terrain);
  return () => {
    if (!v.isDestroyed()) {
      v.scene.primitives.remove(vegetation);
      v.scene.primitives.remove(terrain);
    }
  };
}
