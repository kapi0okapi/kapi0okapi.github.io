// The 67 hand features of hand-gesture-recognition (src/hand_gestures/landmarks.py), ported
// one to one: normalised coordinates (wrist at the origin, palm size 1), the 10 distances
// between fingertips and the bending angle at the 15 finger joints.

const WRIST = 0;
const FINGERS = [
  [1, 2, 3, 4],
  [5, 6, 7, 8],
  [9, 10, 11, 12],
  [13, 14, 15, 16],
  [17, 18, 19, 20],
];
const TIPS = [4, 8, 12, 16, 20];
const PALM = [
  [0, 5],
  [0, 9],
  [0, 17],
  [5, 17],
];

/** points: 21 x (x, y), already in comparable units on both axes (x scaled by width / height). */
export function handFeatures(points: ArrayLike<number>): Float32Array {
  const x = (i: number) => points[2 * i];
  const y = (i: number) => points[2 * i + 1];
  let palm = 0;
  for (const [a, b] of PALM) palm += Math.hypot(x(a) - x(b), y(a) - y(b));
  palm = Math.max(palm / PALM.length, 1e-6);

  const norm = new Float64Array(42);
  for (let i = 0; i < 21; i++) {
    norm[2 * i] = (x(i) - x(WRIST)) / palm;
    norm[2 * i + 1] = (y(i) - y(WRIST)) / palm;
  }
  const nx = (i: number) => norm[2 * i];
  const ny = (i: number) => norm[2 * i + 1];

  const out = new Float32Array(67);
  out.set(norm, 0);
  let k = 42;
  for (let i = 0; i < 5; i++) {
    for (let j = i + 1; j < 5; j++) {
      out[k++] = Math.hypot(nx(TIPS[i]) - nx(TIPS[j]), ny(TIPS[i]) - ny(TIPS[j]));
    }
  }
  for (const finger of FINGERS) {
    const chain = [WRIST, ...finger];
    for (let j = 0; j + 2 < chain.length; j++) {
      const [a, b, c] = [chain[j], chain[j + 1], chain[j + 2]];
      const ux = nx(b) - nx(a), uy = ny(b) - ny(a);
      const vx = nx(c) - nx(b), vy = ny(c) - ny(b);
      const norms = Math.hypot(ux, uy) * Math.hypot(vx, vy);
      const cos = (ux * vx + uy * vy) / Math.max(norms, 1e-12);
      out[k++] = Math.acos(Math.min(1, Math.max(-1, cos)));
    }
  }
  return out;
}

export function softmax(logits: ArrayLike<number>, offset = 0, n = logits.length): Float32Array {
  let max = -Infinity;
  for (let i = 0; i < n; i++) max = Math.max(max, logits[offset + i]);
  const out = new Float32Array(n);
  let sum = 0;
  for (let i = 0; i < n; i++) sum += out[i] = Math.exp(logits[offset + i] - max);
  for (let i = 0; i < n; i++) out[i] /= sum;
  return out;
}
