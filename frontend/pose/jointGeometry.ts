import type { Keypoint2D } from "./types";

function toVector(a: Keypoint2D, b: Keypoint2D) {
  return { x: b.x - a.x, y: b.y - a.y };
}

function dot(ax: number, ay: number, bx: number, by: number) {
  return ax * bx + ay * by;
}

function magnitude(x: number, y: number) {
  return Math.sqrt(x * x + y * y);
}

export function angleBetween(a: Keypoint2D, b: Keypoint2D, c: Keypoint2D): number {
  // Returns angle ABC in degrees, clamped to [0, 180].
  const v1 = toVector(b, a);
  const v2 = toVector(b, c);

  const mag1 = magnitude(v1.x, v1.y);
  const mag2 = magnitude(v2.x, v2.y);
  if (mag1 === 0 || mag2 === 0) return 0;

  const cosTheta = dot(v1.x, v1.y, v2.x, v2.y) / (mag1 * mag2);
  const clamped = Math.min(1, Math.max(-1, cosTheta));
  const radians = Math.acos(clamped);
  const degrees = (radians * 180) / Math.PI;
  return Math.max(0, Math.min(180, degrees));
}

