/** Vertex label for index i: A, B, ..., Z, A1, B1, ... */
export function vertexLabel(i) {
  const letter = String.fromCharCode(65 + (i % 26));
  const round = Math.floor(i / 26);
  return round === 0 ? letter : `${letter}${round}`;
}

/** Parse a coordinate text field. Returns a finite number or null. */
export function parseCoordinate(text) {
  const cleaned = String(text ?? '').trim().replace(/[−–]/g, '-');
  if (cleaned === '' || cleaned === '-' || cleaned === '.') return null;
  const n = Number(cleaned);
  return Number.isFinite(n) ? n : null;
}

/** Format a number for display: at most 3 decimals, no trailing zeros, no "-0". */
export function formatNumber(n) {
  const rounded = Math.round(n * 1000) / 1000;
  return Object.is(rounded, -0) ? '0' : String(rounded);
}

export function formatPoint({ x, y }) {
  return `(${formatNumber(x)}, ${formatNumber(y)})`;
}

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
 * Square viewing window that contains every point, always at least -10..10,
 * with a margin, snapped to whole numbers.
 */
export function computeBounds(points, minHalfSpan = 10) {
  let minX = -minHalfSpan;
  let maxX = minHalfSpan;
  let minY = -minHalfSpan;
  let maxY = minHalfSpan;
  for (const p of points) {
    minX = Math.min(minX, p.x);
    maxX = Math.max(maxX, p.x);
    minY = Math.min(minY, p.y);
    maxY = Math.max(maxY, p.y);
  }
  const rawSpan = Math.max(maxX - minX, maxY - minY);
  const pad = Math.max(1, Math.ceil(rawSpan * 0.06));
  const span = Math.ceil(rawSpan) + pad * 2;
  const cx = (minX + maxX) / 2;
  const cy = (minY + maxY) / 2;
  const left = Math.floor(cx - span / 2);
  const bottom = Math.floor(cy - span / 2);
  return { minX: left, maxX: left + span, minY: bottom, maxY: bottom + span };
}

/** Centroid (average of vertices); used to push labels outward. */
export function centroid(points) {
  if (points.length === 0) return { x: 0, y: 0 };
  const sum = points.reduce((acc, p) => ({ x: acc.x + p.x, y: acc.y + p.y }), { x: 0, y: 0 });
  return { x: sum.x / points.length, y: sum.y / points.length };
}
