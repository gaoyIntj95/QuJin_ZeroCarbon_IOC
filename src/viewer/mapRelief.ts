let relief: HTMLCanvasElement | undefined;
export function mapRelief() {
  if (relief) return relief;
  const canvas = document.createElement("canvas");
  canvas.width = 768;
  canvas.height = 768;
  const ctx = canvas.getContext("2d")!,
    image = ctx.createImageData(768, 768);
  const hash = (x: number, y: number) => {
    const n = Math.sin(x * 127.1 + y * 311.7) * 43758.5453;
    return n - Math.floor(n);
  };
  const noise = (x: number, y: number) => {
    const ix = Math.floor(x),
      iy = Math.floor(y),
      fx = x - ix,
      fy = y - iy,
      u = fx * fx * (3 - 2 * fx),
      v = fy * fy * (3 - 2 * fy);
    return (
      (hash(ix, iy) * (1 - u) + hash(ix + 1, iy) * u) * (1 - v) +
      (hash(ix, iy + 1) * (1 - u) + hash(ix + 1, iy + 1) * u) * v
    );
  };
  const heights = new Float32Array(770 * 770);
  for (let y = 0; y < 770; y++)
    for (let x = 0; x < 770; x++) {
      let h = 0;
      for (let o = 0; o < 5; o++)
        h += noise(x / (72 / 2 ** o), y / (72 / 2 ** o)) / 2 ** o;
      heights[y * 770 + x] = h;
    }
  for (let y = 0; y < 768; y++)
    for (let x = 0; x < 768; x++) {
      const h = heights[y * 770 + x],
        dx = heights[y * 770 + x + 1] - h,
        dy = heights[(y + 1) * 770 + x] - h;
      const light = Math.max(0, Math.min(1, 0.4 + (dx - dy) * 10)),
        contour = (h * 22) % 1 < 0.07 ? 6 : 0,
        i = (y * 768 + x) * 4;
      image.data[i] = 4 + light * 8;
      image.data[i + 1] = 16 + light * 25 + contour;
      image.data[i + 2] = 30 + light * 35 + contour;
      image.data[i + 3] = 255;
    }
  ctx.putImageData(image, 0, 0);
  relief = canvas;
  return canvas;
}
export function irregularBoundary(points: number[][]) {
  return points.flatMap((p, i) => {
    const q = points[(i + 1) % points.length],
      dx = q[0] - p[0],
      dy = q[1] - p[1],
      length = Math.hypot(dx, dy),
      steps = Math.ceil(length / 1.8);
    return Array.from({ length: steps }, (_, j) => {
      const t = j / steps,
        wave =
          j === 0
            ? 0
            : Math.sin((p[0] + dx * t) * 3.3 + (p[1] + dy * t) * 2.8) * 0.62;
      return [
        p[0] + dx * t - (dy / length) * wave,
        p[1] + dy * t + (dx / length) * wave,
      ];
    });
  });
}
