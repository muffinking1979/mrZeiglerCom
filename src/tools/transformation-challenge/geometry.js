// Pure geometry + puzzle generation for the transformation game.
// A triangle is an array of three points [{x, y}, {x, y}, {x, y}] whose
// order matches the vertex labels A, B, C.

export const GRID_MIN = -10;
export const GRID_MAX = 10;
export const LABELS = ['A', 'B', 'C'];

const randInt = (lo, hi) => lo + Math.floor(Math.random() * (hi - lo + 1));
const pick = (arr) => arr[Math.floor(Math.random() * arr.length)];

export const primes = (n) => ['', '′', '″', '‴'][n] ?? '′'.repeat(n);

// ---------- basic point operations ----------

export function reflectPoint(p, axis) {
  switch (axis) {
    case 'x':
      return { x: p.x, y: -p.y };
    case 'y':
      return { x: -p.x, y: p.y };
    case 'y=x':
      return { x: p.y, y: p.x };
    case 'y=-x':
      return { x: -p.y, y: -p.x };
    default:
      throw new Error(`Unknown axis ${axis}`);
  }
}

// Rotate p about c by `deg` degrees counterclockwise (negative = clockwise).
export function rotatePoint(p, c, deg) {
  const r = (deg * Math.PI) / 180;
  const cos = Math.cos(r);
  const sin = Math.sin(r);
  const dx = p.x - c.x;
  const dy = p.y - c.y;
  return { x: c.x + dx * cos - dy * sin, y: c.y + dx * sin + dy * cos };
}

const snap = (p) => ({ x: Math.round(p.x), y: Math.round(p.y) });

// ---------- transformations ----------
// { kind: 'reflect', axis: 'x' | 'y' | 'y=x' | 'y=-x' }
// { kind: 'rotate', degrees: 90 | 180 | 270, dir: 'cw' | 'ccw', center: 'origin' | 0 | 1 | 2 }

export function signedAngle(t) {
  return t.dir === 'cw' ? -t.degrees : t.degrees;
}

export function rotationCenter(t, tri) {
  return t.center === 'origin' ? { x: 0, y: 0 } : tri[t.center];
}

export function applyTransform(tri, t) {
  if (t.kind === 'reflect') return tri.map((p) => reflectPoint(p, t.axis));
  const c = rotationCenter(t, tri);
  return tri.map((p) => snap(rotatePoint(p, c, signedAngle(t))));
}

// Intermediate shape for animation, progress u in [0, 1].
export function interpolateTransform(tri, t, u) {
  if (t.kind === 'reflect') {
    // Points travel straight toward their mirror images: looks like a flip.
    return tri.map((p) => {
      const q = reflectPoint(p, t.axis);
      return { x: p.x + (q.x - p.x) * u, y: p.y + (q.y - p.y) * u };
    });
  }
  const c = rotationCenter(t, tri);
  return tri.map((p) => rotatePoint(p, c, signedAngle(t) * u));
}

// stepIndex is 0-based; the pre-image of step k has k primes.
export function describeTransform(t, stepIndex) {
  if (t.kind === 'reflect') {
    const what = {
      x: 'the x-axis',
      y: 'the y-axis',
      'y=x': 'the line y = x',
      'y=-x': 'the line y = −x',
    }[t.axis];
    return `Reflect across ${what}`;
  }
  const amount = t.degrees === 180 ? '180°' : `${t.degrees}° ${t.dir === 'cw' ? 'clockwise' : 'counterclockwise'}`;
  const about =
    t.center === 'origin' ? 'the origin' : `vertex ${LABELS[t.center]}${primes(stepIndex)}`;
  return `Rotate ${amount} about ${about}`;
}

// ---------- helpers ----------

export const inBounds = (tri, lo = GRID_MIN, hi = GRID_MAX) =>
  tri.every((p) => p.x >= lo && p.x <= hi && p.y >= lo && p.y <= hi);

export const sameTriangle = (a, b) =>
  a.every((p, i) => Math.round(p.x) === Math.round(b[i].x) && Math.round(p.y) === Math.round(b[i].y));

// Shift a triangle by whole units so it fits inside the grid.
export function clampIntoGrid(tri) {
  const xs = tri.map((p) => p.x);
  const ys = tri.map((p) => p.y);
  let dx = 0;
  let dy = 0;
  if (Math.min(...xs) < GRID_MIN) dx = GRID_MIN - Math.min(...xs);
  if (Math.max(...xs) > GRID_MAX) dx = GRID_MAX - Math.max(...xs);
  if (Math.min(...ys) < GRID_MIN) dy = GRID_MIN - Math.min(...ys);
  if (Math.max(...ys) > GRID_MAX) dy = GRID_MAX - Math.max(...ys);
  return tri.map((p) => ({ x: p.x + dx, y: p.y + dy }));
}

export const translate = (tri, dx, dy) => tri.map((p) => ({ x: p.x + dx, y: p.y + dy }));

// Student tool: reflect across the vertical line through vertex A.
export function studentReflect(tri) {
  const ax = tri[0].x;
  return tri.map((p) => ({ x: 2 * ax - p.x, y: p.y }));
}

// Student tool: rotate 90° clockwise about vertex A.
export function studentRotate(tri) {
  return applyTransform(tri, { kind: 'rotate', degrees: 90, dir: 'cw', center: 0 });
}

// ---------- puzzle generation ----------

const dist2 = (p, q) => (p.x - q.x) ** 2 + (p.y - q.y) ** 2;

function isScalene(tri) {
  const [a, b, c] = tri;
  const area2 = Math.abs((b.x - a.x) * (c.y - a.y) - (c.x - a.x) * (b.y - a.y));
  if (area2 < 6) return false; // degenerate or too skinny/small
  const s = [dist2(a, b), dist2(b, c), dist2(c, a)];
  return s[0] !== s[1] && s[1] !== s[2] && s[0] !== s[2];
}

function randomTriangle() {
  for (;;) {
    const a = { x: randInt(-7, 7), y: randInt(-7, 7) };
    const tri = [a, { x: a.x + randInt(-4, 4), y: a.y + randInt(-4, 4) }, { x: a.x + randInt(-4, 4), y: a.y + randInt(-4, 4) }];
    if (isScalene(tri) && inBounds(tri, -8, 8)) return tri;
  }
}

function randomTransform() {
  if (Math.random() < 0.45) {
    return { kind: 'reflect', axis: pick(['x', 'y', 'y=x', 'y=-x']) };
  }
  return {
    kind: 'rotate',
    degrees: pick([90, 180, 270]),
    dir: pick(['cw', 'ccw']),
    center: Math.random() < 0.5 ? 'origin' : randInt(0, 2),
  };
}

const sameT = (a, b) =>
  a.kind === b.kind &&
  (a.kind === 'reflect' ? a.axis === b.axis : a.center === b.center);

export function generatePuzzle(count) {
  // Keep every intermediate image comfortably on the grid.
  for (let attempt = 0; attempt < 5000; attempt++) {
    const original = randomTriangle();
    const transforms = [];
    const images = [original];
    let ok = true;
    for (let i = 0; i < count; i++) {
      let t;
      let guard = 0;
      do {
        t = randomTransform();
        guard++;
      } while (i > 0 && sameT(t, transforms[i - 1]) && guard < 20);
      const next = applyTransform(images[i], t);
      if (!inBounds(next, -9, 9)) {
        ok = false;
        break;
      }
      transforms.push(t);
      images.push(next);
    }
    if (!ok) continue;
    const final = images[images.length - 1];
    if (sameTriangle(final, original)) continue;
    // Avoid answers that overlap the original too closely to be interesting.
    if (final.filter((p) => original.some((q) => q.x === p.x && q.y === p.y)).length >= 2 && count > 1) continue;
    return { original, transforms, images, final };
  }
  throw new Error('Could not generate puzzle');
}
