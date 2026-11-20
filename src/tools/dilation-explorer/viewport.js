// Fitting the visible window of the coordinate plane to the shapes on it.

const NICE_STEPS = [1, 2, 5];

/** Smallest "nice" step (1, 2, 5, 10, 20, 50, ...) giving at most maxCount intervals. */
export function niceStep(span, maxCount) {
  let magnitude = 1;
  for (;;) {
    for (const s of NICE_STEPS) {
      const step = s * magnitude;
      if (span / step <= maxCount) return step;
    }
    magnitude *= 10;
  }
}

/**
 * Square window containing every point, always at least -minHalfSpan..minHalfSpan,
 * with a little padding, snapped to whole numbers.
 */
export function computeBounds(points, minHalfSpan = 10) {
  let minX = -minHalfSpan;
  let maxX = minHalfSpan;
  let minY = -minHalfSpan;
  let maxY = minHalfSpan;
  for (const p of points) {
    if (!Number.isFinite(p.x) || !Number.isFinite(p.y)) continue;
    minX = Math.min(minX, p.x);
    maxX = Math.max(maxX, p.x);
    minY = Math.min(minY, p.y);
    maxY = Math.max(maxY, p.y);
  }
  const rawSpan = Math.max(maxX - minX, maxY - minY);
  const fits = minX >= -minHalfSpan && maxX <= minHalfSpan && minY >= -minHalfSpan && maxY <= minHalfSpan;
  if (fits) return { minX: -minHalfSpan, maxX: minHalfSpan, minY: -minHalfSpan, maxY: minHalfSpan };

  const pad = Math.max(1, Math.ceil(rawSpan * 0.06));
  const span = Math.ceil(rawSpan) + pad * 2;
  const cx = (minX + maxX) / 2;
  const cy = (minY + maxY) / 2;
  const left = Math.floor(cx - span / 2);
  const bottom = Math.floor(cy - span / 2);
  return { minX: left, maxX: left + span, minY: bottom, maxY: bottom + span };
}

export const sameBounds = (a, b) =>
  a.minX === b.minX && a.maxX === b.maxX && a.minY === b.minY && a.maxY === b.maxY;
