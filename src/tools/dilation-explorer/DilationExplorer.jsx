import { useEffect, useMemo, useRef, useState } from 'react';
import { dilatePoint, formatFrac, formatValue, parseScale, toNumber } from './fraction.js';
import { computeBounds, niceStep, sameBounds } from './viewport.js';
import './DilationExplorer.css';

// ---- SVG layout (user units; the SVG scales to its container) ----
const SIZE = 640;
const PAD = 26; // room for axis labels
const PLOT = SIZE - PAD * 2;

const HOME = 10; // the grid never shows less than -10..10
const DRAG_LIMIT = 20; // vertices and the center can be dragged within -20..20
const ANIM_MS = 350;

const LABELS = ['A', 'B', 'C', 'D'];

const DEFAULTS = {
  triangle: [
    { x: 1, y: 1 },
    { x: 4, y: 1 },
    { x: 2, y: 4 },
  ],
  quadrilateral: [
    { x: 1, y: 1 },
    { x: 4, y: 1 },
    { x: 5, y: 4 },
    { x: 2, y: 3 },
  ],
};
const DEFAULT_CENTER = { x: -3, y: -2 };

function describeScale(k) {
  const v = toNumber(k);
  if (v === 1) return 'k = 1: the image is the same size and in the same place.';
  if (v === 0) return 'k = 0: every point lands on the center of dilation.';
  if (v === -1) return 'k = −1: same size, rotated 180° about the center.';
  if (v > 1) return 'k > 1: an enlargement. The image is bigger and farther from the center.';
  if (v > 0) return '0 < k < 1: a reduction. The image is smaller and closer to the center.';
  if (v < -1) return 'k < −1: an enlargement on the opposite side of the center.';
  return '−1 < k < 0: a reduction on the opposite side of the center.';
}

const prefersReducedMotion = () =>
  typeof window !== 'undefined' && window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;

/** Eases the displayed window toward `target` so students can see the grid zoom and shift. */
function useAnimatedBounds(target) {
  const [shown, setShown] = useState(target);
  const shownRef = useRef(target);

  useEffect(() => {
    const from = shownRef.current;
    if (sameBounds(from, target)) return undefined;
    if (prefersReducedMotion()) {
      shownRef.current = target;
      setShown(target);
      return undefined;
    }
    const start = performance.now();
    let raf;
    const tick = (now) => {
      const t = Math.min(1, (now - start) / ANIM_MS);
      const e = 1 - (1 - t) ** 3; // ease-out
      const lerp = (a, b) => a + (b - a) * e;
      const next =
        t === 1
          ? target
          : {
              minX: lerp(from.minX, target.minX),
              maxX: lerp(from.maxX, target.maxX),
              minY: lerp(from.minY, target.minY),
              maxY: lerp(from.maxY, target.maxY),
            };
      shownRef.current = next;
      setShown(next);
      if (t < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [target]);

  return shown;
}

/** Multiples of `step` inside [lo, hi], computed by index to avoid float drift. */
function multiplesIn(lo, hi, step) {
  const out = [];
  for (let i = Math.ceil(lo / step - 1e-9); i * step <= hi + 1e-9; i++) out.push(i * step);
  return out;
}

export default function DilationExplorer() {
  const [shape, setShape] = useState('triangle');
  const [vertices, setVertices] = useState(DEFAULTS);
  const [center, setCenter] = useState(DEFAULT_CENTER);
  const [scaleText, setScaleText] = useState('1');
  const [scale, setScale] = useState({ value: { n: 1, d: 1 }, style: 'decimal' });
  const [dragging, setDragging] = useState(null);
  const [frozenBounds, setFrozenBounds] = useState(null);

  const svgRef = useRef(null);
  const dragRef = useRef(null);

  const pts = vertices[shape];
  const parsed = useMemo(() => parseScale(scaleText), [scaleText]);
  const k = scale.value;
  const images = useMemo(() => pts.map((p) => dilatePoint(p, center, k)), [pts, center, k]);
  const imgNum = useMemo(() => images.map((q) => ({ x: toNumber(q.x), y: toNumber(q.y) })), [images]);

  // ---- Visible window: fits the original, the image, and the center ----
  const fitKey = JSON.stringify(computeBounds([...pts, ...imgNum, center], HOME));
  const fitted = useMemo(() => JSON.parse(fitKey), [fitKey]);
  // While dragging, hold the window still so the grid doesn't slide under the pointer.
  const target = frozenBounds ?? fitted;
  const view = useAnimatedBounds(target);

  const span = view.maxX - view.minX;
  const unit = PLOT / span;
  const toSvgX = (x) => PAD + (x - view.minX) * unit;
  const toSvgY = (y) => PAD + (view.maxY - y) * unit;
  const fromSvgX = (sx) => (sx - PAD) / unit + view.minX;
  const fromSvgY = (sy) => view.maxY - (sy - PAD) / unit;

  // ---- Scale factor input ----
  const onScaleChange = (e) => {
    const text = e.target.value;
    setScaleText(text);
    const r = parseScale(text);
    if (r.ok) setScale({ value: r.value, style: r.style });
  };

  // ---- Pointer handling ----
  const gridPoint = (e) => {
    const svg = svgRef.current;
    const pt = svg.createSVGPoint();
    pt.x = e.clientX;
    pt.y = e.clientY;
    const p = pt.matrixTransform(svg.getScreenCTM().inverse());
    return { x: fromSvgX(p.x), y: fromSvgY(p.y) };
  };

  const startDrag = (e, target) => {
    e.preventDefault();
    e.stopPropagation();
    svgRef.current.setPointerCapture(e.pointerId);
    const frozen = view; // freeze exactly what the student sees right now
    const limits = {
      minX: Math.max(-DRAG_LIMIT, Math.ceil(frozen.minX)),
      maxX: Math.min(DRAG_LIMIT, Math.floor(frozen.maxX)),
      minY: Math.max(-DRAG_LIMIT, Math.ceil(frozen.minY)),
      maxY: Math.min(DRAG_LIMIT, Math.floor(frozen.maxY)),
    };
    dragRef.current = { target, start: gridPoint(e), startPts: pts, pointerId: e.pointerId, limits };
    setFrozenBounds(frozen);
    setDragging(target);
  };

  const onPointerMove = (e) => {
    const drag = dragRef.current;
    if (!drag || e.pointerId !== drag.pointerId) return;
    const g = gridPoint(e);
    const { target, limits: L } = drag;
    const snap = (p) => ({
      x: Math.max(L.minX, Math.min(L.maxX, Math.round(p.x))),
      y: Math.max(L.minY, Math.min(L.maxY, Math.round(p.y))),
    });

    if (target.type === 'center') {
      const next = snap(g);
      if (next.x !== center.x || next.y !== center.y) setCenter(next);
      return;
    }

    if (target.type === 'vertex') {
      const next = snap(g);
      const cur = pts[target.index];
      if (next.x === cur.x && next.y === cur.y) return;
      // Don't let two vertices land on the same point.
      if (pts.some((p, i) => i !== target.index && p.x === next.x && p.y === next.y)) return;
      setVertices((v) => ({
        ...v,
        [shape]: v[shape].map((p, i) => (i === target.index ? next : p)),
      }));
      return;
    }

    // Whole-shape drag: move by whole units, keeping every vertex inside the limits.
    const sp = drag.startPts;
    const xs = sp.map((p) => p.x);
    const ys = sp.map((p) => p.y);
    const dx = Math.max(L.minX - Math.min(...xs), Math.min(L.maxX - Math.max(...xs), Math.round(g.x - drag.start.x)));
    const dy = Math.max(L.minY - Math.min(...ys), Math.min(L.maxY - Math.max(...ys), Math.round(g.y - drag.start.y)));
    const moved = sp.map((p) => ({ x: p.x + dx, y: p.y + dy }));
    if (moved.some((p, i) => p.x !== pts[i].x || p.y !== pts[i].y)) {
      setVertices((v) => ({ ...v, [shape]: moved }));
    }
  };

  const endDrag = (e) => {
    const drag = dragRef.current;
    if (!drag || e.pointerId !== drag.pointerId) return;
    dragRef.current = null;
    setDragging(null);
    setFrozenBounds(null); // refit to the new positions
  };

  const reset = () => {
    setVertices(DEFAULTS);
    setCenter(DEFAULT_CENTER);
    setScaleText('1');
    setScale({ value: { n: 1, d: 1 }, style: 'decimal' });
  };

  // ---- Rendering helpers ----
  const polyStr = (arr) => arr.map((p) => `${toSvgX(p.x)},${toSvgY(p.y)}`).join(' ');
  const cx = toSvgX(center.x);
  const cy = toSvgY(center.y);

  // Centroids, used to push vertex labels outward.
  const centroid = (arr) => ({
    x: arr.reduce((s, p) => s + p.x, 0) / arr.length,
    y: arr.reduce((s, p) => s + p.y, 0) / arr.length,
  });
  const labelPos = (p, c, dist = 16) => {
    let ux = toSvgX(p.x) - toSvgX(c.x);
    let uy = toSvgY(p.y) - toSvgY(c.y);
    const len = Math.hypot(ux, uy);
    if (len < 1e-6) {
      ux = 0.7;
      uy = -0.7;
    } else {
      ux /= len;
      uy /= len;
    }
    return { x: toSvgX(p.x) + ux * dist, y: toSvgY(p.y) + uy * dist };
  };
  const origC = centroid(pts);
  const imgC = centroid(imgNum);
  const inView = (p) => p.x >= view.minX && p.x <= view.maxX && p.y >= view.minY && p.y <= view.maxY;

  // Grid lines and labels. Steps come from the target window so they don't flicker mid-animation.
  const targetSpan = target.maxX - target.minX;
  const gridStep = niceStep(targetSpan, 40);
  const labelStep = niceStep(targetSpan, 20);
  const gridXs = multiplesIn(view.minX, view.maxX, gridStep);
  const gridYs = multiplesIn(view.minY, view.maxY, gridStep);
  const labelXs = multiplesIn(view.minX, view.maxX, labelStep);
  const labelYs = multiplesIn(view.minY, view.maxY, labelStep);

  const left = PAD;
  const right = SIZE - PAD;
  const top = PAD;
  const bottom = SIZE - PAD;
  const axisSvgY = toSvgY(Math.min(Math.max(0, view.minY), view.maxY));
  const axisSvgX = toSvgX(Math.min(Math.max(0, view.minX), view.maxX));

  const coord = (p) => `(${p.x}, ${p.y})`;
  const imgCoord = (q) => `(${formatValue(q.x, scale.style)}, ${formatValue(q.y, scale.style)})`;

  const kValue = toNumber(k);
  const kDisplay =
    scale.style === 'fraction' && k.d !== 1
      ? `${formatFrac(k)} ≈ ${Math.round(kValue * 1000) / 1000}`
      : String(Math.round(kValue * 1000000) / 1000000);

  return (
    <div className="dx-root">
      <div className="dx-toolbar">
        <div className="dx-toggle" role="group" aria-label="Shape">
          {['triangle', 'quadrilateral'].map((s) => (
            <button
              key={s}
              type="button"
              className={shape === s ? 'dx-btn dx-btn-active' : 'dx-btn'}
              aria-pressed={shape === s}
              onClick={() => setShape(s)}
            >
              {s === 'triangle' ? 'Triangle' : 'Quadrilateral'}
            </button>
          ))}
        </div>
        <button type="button" className="dx-btn dx-btn-reset" onClick={reset}>
          Reset
        </button>
      </div>

      <div className="dx-board">
        <svg
          ref={svgRef}
          className={dragging ? 'dx-svg dx-svg-dragging' : 'dx-svg'}
          viewBox={`0 0 ${SIZE} ${SIZE}`}
          preserveAspectRatio="xMidYMid meet"
          onPointerMove={onPointerMove}
          onPointerUp={endDrag}
          onPointerCancel={endDrag}
        >
          <defs>
            <clipPath id="dx-clip">
              <rect x={left} y={top} width={PLOT} height={PLOT} />
            </clipPath>
          </defs>

          {/* Grid */}
          <rect className="dx-plane" x={left} y={top} width={PLOT} height={PLOT} />
          {gridXs.map((v) => (
            <line key={`gx${v}`} className="dx-gridline" x1={toSvgX(v)} y1={top} x2={toSvgX(v)} y2={bottom} />
          ))}
          {gridYs.map((v) => (
            <line key={`gy${v}`} className="dx-gridline" x1={left} y1={toSvgY(v)} x2={right} y2={toSvgY(v)} />
          ))}
          <line className="dx-axis" x1={left} y1={axisSvgY} x2={right} y2={axisSvgY} />
          <line className="dx-axis" x1={axisSvgX} y1={top} x2={axisSvgX} y2={bottom} />
          <g className="dx-ticklabel">
            {labelXs.map((v) => (
              <text key={`lx${v}`} x={toSvgX(v)} y={bottom + 16} textAnchor="middle">
                {v}
              </text>
            ))}
            {labelYs.map((v) => (
              <text key={`ly${v}`} x={left - 6} y={toSvgY(v) + 4} textAnchor="end">
                {v}
              </text>
            ))}
          </g>
          <text className="dx-axislabel" x={right + 8} y={axisSvgY + 5}>
            x
          </text>
          <text className="dx-axislabel" x={axisSvgX} y={top - 9} textAnchor="middle">
            y
          </text>

          <g clipPath="url(#dx-clip)">
            {/* Light lines from the center to each vertex and its image */}
            {pts.map((p, i) => (
              <g key={`ray${i}`} className="dx-ray">
                <line x1={cx} y1={cy} x2={toSvgX(p.x)} y2={toSvgY(p.y)} />
                <line x1={cx} y1={cy} x2={toSvgX(imgNum[i].x)} y2={toSvgY(imgNum[i].y)} />
              </g>
            ))}

            {/* Pre-image (draggable) */}
            <polygon
              className={dragging?.type === 'shape' ? 'dx-orig dx-orig-dragging' : 'dx-orig'}
              points={polyStr(pts)}
              onPointerDown={(e) => startDrag(e, { type: 'shape' })}
            />

            {/* Image */}
            <polygon className="dx-image" points={polyStr(imgNum)} />
            {imgNum.map((q, i) => (
              <circle key={`iv${i}`} className="dx-image-vertex" cx={toSvgX(q.x)} cy={toSvgY(q.y)} r={5} />
            ))}
          </g>

          {/* Image labels sit outside the clip so they stay readable near the edge,
              but are hidden while a vertex is off the grid (only possible mid-drag). */}
          {imgNum.map((q, i) => {
            if (!inView(q)) return null;
            const lp = labelPos(q, imgC);
            return (
              <text key={`il${i}`} className="dx-label dx-label-image" x={lp.x} y={lp.y + 5} textAnchor="middle">
                {LABELS[i]}′
              </text>
            );
          })}

          {/* Pre-image vertices (draggable) */}
          {pts.map((p, i) => {
            const lp = labelPos(p, origC);
            const active = dragging?.type === 'vertex' && dragging.index === i;
            return (
              <g key={`v${i}`}>
                <text className="dx-label dx-label-orig" x={lp.x} y={lp.y + 5} textAnchor="middle">
                  {LABELS[i]}
                </text>
                <circle
                  className={active ? 'dx-vertex dx-vertex-active' : 'dx-vertex'}
                  cx={toSvgX(p.x)}
                  cy={toSvgY(p.y)}
                  r={7}
                />
                <circle
                  className="dx-hit dx-hit-vertex"
                  cx={toSvgX(p.x)}
                  cy={toSvgY(p.y)}
                  r={16}
                  onPointerDown={(e) => startDrag(e, { type: 'vertex', index: i })}
                />
              </g>
            );
          })}

          {/* Center of dilation (draggable) */}
          <g>
            <circle className={dragging?.type === 'center' ? 'dx-center dx-center-active' : 'dx-center'} cx={cx} cy={cy} r={7} />
            <circle className="dx-center-dot" cx={cx} cy={cy} r={2.5} />
            <text className="dx-label dx-label-center" x={cx + 10} y={cy + 20}>
              P
            </text>
            <circle
              className="dx-hit dx-hit-center"
              cx={cx}
              cy={cy}
              r={14}
              onPointerDown={(e) => startDrag(e, { type: 'center' })}
            />
          </g>
        </svg>
      </div>

      <aside className="dx-panel">
        <h1 className="dx-title">Dilation Explorer</h1>

        <label className="dx-field">
          <span className="dx-field-label">Scale factor (k)</span>
          <input
            className={parsed.ok ? 'dx-input' : 'dx-input dx-input-error'}
            type="text"
            inputMode="decimal"
            autoComplete="off"
            spellCheck={false}
            value={scaleText}
            onChange={onScaleChange}
            aria-invalid={!parsed.ok}
          />
        </label>
        {parsed.ok ? (
          <p className="dx-hint">k = {kDisplay}</p>
        ) : (
          <p className="dx-error" role="alert">
            {parsed.error} Showing k = {kDisplay}.
          </p>
        )}
        <p className="dx-desc">{describeScale(k)}</p>

        <table className="dx-table">
          <thead>
            <tr>
              <th>Original</th>
              <th>Image</th>
            </tr>
          </thead>
          <tbody>
            {pts.map((p, i) => (
              <tr key={i}>
                <td>
                  <span className="dx-swatch dx-swatch-orig" />
                  {LABELS[i]} {coord(p)}
                </td>
                <td>
                  <span className="dx-swatch dx-swatch-image" />
                  {LABELS[i]}′ {imgCoord(images[i])}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        <p className="dx-center-readout">
          <span className="dx-swatch dx-swatch-center" />
          Center of dilation P {coord(center)}
        </p>

        <p className="dx-tip">
          Drag the shape to move it, drag a vertex to reshape it, or drag P to move the center of dilation. The grid
          zooms out to fit the image.
        </p>
      </aside>
    </div>
  );
}
