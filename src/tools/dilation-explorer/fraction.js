// Small exact-rational helpers so image coordinates stay exact (e.g. 7/3, not 2.3333).

const gcd = (a, b) => {
  a = Math.abs(a);
  b = Math.abs(b);
  while (b) [a, b] = [b, a % b];
  return a || 1;
};

export function frac(n, d = 1) {
  if (d < 0) {
    n = -n;
    d = -d;
  }
  const g = gcd(n, d);
  return { n: n / g, d: d / g };
}

const MAX_DECIMALS = 6;

// "1.25" -> {n:5, d:4}; returns null if not a plain non-negative decimal.
function decimalToFrac(str) {
  const m = /^(\d*)(?:\.(\d*))?$/.exec(str);
  if (!m || (m[1] === '' && !m[2])) return null;
  const fracPart = m[2] || '';
  if (fracPart.length > MAX_DECIMALS) return null;
  const d = 10 ** fracPart.length;
  const n = parseInt((m[1] || '0') + fracPart, 10);
  return frac(n, d);
}

/**
 * Parse a scale factor typed by a student.
 * Accepts integers, decimals (".5", "1.5"), fractions ("3/4", "-2/3"),
 * and mixed numbers ("1 1/2").
 * Returns { ok: true, value: {n, d}, style: 'fraction' | 'decimal' } or { ok: false, error }.
 */
export function parseScale(raw) {
  let s = String(raw).trim().replace(/[−–]/g, '-'); // unicode minus/dash
  if (s === '') return { ok: false, error: 'Enter a scale factor.' };

  let sign = 1;
  if (s[0] === '-' || s[0] === '+') {
    if (s[0] === '-') sign = -1;
    s = s.slice(1).trim();
  }

  // Mixed number: "1 1/2"
  let m = /^(\d+)\s+(\d+)\s*\/\s*(\d+)$/.exec(s);
  if (m) {
    const whole = parseInt(m[1], 10);
    const num = parseInt(m[2], 10);
    const den = parseInt(m[3], 10);
    if (den === 0) return { ok: false, error: 'The denominator can’t be 0.' };
    return { ok: true, value: frac(sign * (whole * den + num), den), style: 'fraction' };
  }

  // Fraction: "a/b" (a and b may be decimals)
  m = /^([\d.]+)\s*\/\s*([\d.]+)$/.exec(s);
  if (m) {
    const top = decimalToFrac(m[1]);
    const bottom = decimalToFrac(m[2]);
    if (!top || !bottom) return { ok: false, error: 'That fraction doesn’t look right.' };
    if (bottom.n === 0) return { ok: false, error: 'The denominator can’t be 0.' };
    return { ok: true, value: frac(sign * top.n * bottom.d, top.d * bottom.n), style: 'fraction' };
  }

  const dec = decimalToFrac(s);
  if (dec) return { ok: true, value: frac(sign * dec.n, dec.d), style: 'decimal' };

  return { ok: false, error: 'Use a number like 2, 0.5, or 3/4.' };
}

export function toNumber(f) {
  return f.n / f.d;
}

export function formatFrac(f) {
  return f.d === 1 ? String(f.n) : `${f.n}/${f.d}`;
}

export function formatDecimal(f) {
  const v = Math.round((f.n / f.d) * 1000) / 1000;
  return String(Object.is(v, -0) ? 0 : v);
}

export function formatValue(f, style) {
  return style === 'decimal' ? formatDecimal(f) : formatFrac(f);
}

/** Image of integer point p under dilation centered at integer point c with scale k = {n, d}. */
export function dilatePoint(p, c, k) {
  return {
    x: frac(c.x * k.d + k.n * (p.x - c.x), k.d),
    y: frac(c.y * k.d + k.n * (p.y - c.y), k.d),
  };
}
