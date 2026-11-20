import { useId, useMemo, useRef, useState } from 'react';
import './TransformationExplorer.css';

/* ---------- Grid geometry ---------- */
const R = 10; // grid runs from -R to R on both axes
const U = 30; // pixels per unit (SVG user units)
const PAD = 24;
const SIZE = 2 * R * U + 2 * PAD;

const toSvgX = (x) => PAD + (x + R) * U;
const toSvgY = (y) => PAD + (R - y) * U;
const clamp = (v, lo, hi) => Math.min(hi, Math.max(lo, v));

const STARTERS = {
  triangle: [
    [1, 2],
    [5, 3],
    [2, 6],
  ],
  quadrilateral: [
    [1, 1],
    [5, 2],
    [6, 5],
    [2, 6],
  ],
};

const LETTERS = ['A', 'B', 'C', 'D'];

/* ---------- Transformations (all about the origin) ---------- */
const TRANSFORMS = [
  { id: 'cw90', group: 'cw', label: '90°', name: '90° clockwise rotation', rule: '(y, −x)', f: ([x, y]) => [y, -x], angle: -90 },
  { id: 'cw180', group: 'cw', label: '180°', name: '180° clockwise rotation', rule: '(−x, −y)', f: ([x, y]) => [-x, -y], angle: -180 },
  { id: 'cw270', group: 'cw', label: '270°', name: '270° clockwise rotation', rule: '(−y, x)', f: ([x, y]) => [-y, x], angle: -270 },
  { id: 'ccw90', group: 'ccw', label: '90°', name: '90° counterclockwise rotation', rule: '(−y, x)', f: ([x, y]) => [-y, x], angle: 90 },
  { id: 'ccw180', group: 'ccw', label: '180°', name: '180° counterclockwise rotation', rule: '(−x, −y)', f: ([x, y]) => [-x, -y], angle: 180 },
  { id: 'ccw270', group: 'ccw', label: '270°', name: '270° counterclockwise rotation', rule: '(y, −x)', f: ([x, y]) => [y, -x], angle: 270 },
  { id: 'rx', group: 'ref', label: 'x-axis', name: 'Reflection across the x-axis', rule: '(x, −y)', f: ([x, y]) => [x, -y], line: [[-R, 0], [R, 0]] },
  { id: 'ry', group: 'ref', label: 'y-axis', name: 'Reflection across the y-axis', rule: '(−x, y)', f: ([x, y]) => [-x, y], line: [[0, -R], [0, R]] },
  { id: 'ryx', group: 'ref', label: 'y = x', name: 'Reflection across the line y = x', rule: '(y, x)', f: ([x, y]) => [y, x], line: [[-R, -R], [R, R]] },
  { id: 'rnyx', group: 'ref', label: 'y = −x', name: 'Reflection across the line y = −x', rule: '(−y, −x)', f: ([x, y]) => [-y, -x], line: [[-R, R], [R, -R]] },
];

const GROUPS = [
  { id: 'cw', title: 'Rotate clockwise ↻' },
  { id: 'ccw', title: 'Rotate counterclockwise ↺' },
  { id: 'ref', title: 'Reflect across' },
];

const fmt = (n) => (n === 0 ? '0' : n < 0 ? `−${Math.abs(n)}` : `${n}`);
const fmtPt = ([x, y]) => `(${fmt(x)}, ${fmt(y)})`;

/** Position a vertex label just outside the polygon, away from its centroid. */
function labelPos(pt, pts) {
  const cx = pts.reduce((s, p) => s + p[0], 0) / pts.length;
  const cy = pts.reduce((s, p) => s + p[1], 0) / pts.length;
  let dx = pt[0] - cx;
  let dy = pt[1] - cy;
  const len = Math.hypot(dx, dy) || 1;
  dx /= len;
  dy /= len;
  return [toSvgX(pt[0]) + dx * 16, toSvgY(pt[1]) - dy * 16];
}

/** Arc (in SVG coords) showing the rotation direction from point p by `angle` degrees. */
function rotationArc(p, angle) {
  const dist = Math.hypot(p[0], p[1]);
  if (dist === 0) return null;
  const r = Math.min(1.6, dist * 0.6) * U;
  const a0 = Math.atan2(p[1], p[0]);
  const a1 = a0 + (angle * Math.PI) / 180;
  const ox = toSvgX(0);
  const oy = toSvgY(0);
  const x0 = ox + r * Math.cos(a0);
  const y0 = oy - r * Math.sin(a0);
  const x1 = ox + r * Math.cos(a1);
  const y1 = oy - r * Math.sin(a1);
  const large = Math.abs(angle) > 180 ? 1 : 0;
  const sweep = angle > 0 ? 0 : 1; // SVG y points down: CCW on screen = sweep 0
  return `M ${x0} ${y0} A ${r} ${r} 0 ${large} ${sweep} ${x1} ${y1}`;
}

export default function TransformationExplorer() {
  const uid = useId().replace(/:/g, '');
  const svgRef = useRef(null);
  const dragRef = useRef(null);

  const [shapeType, setShapeType] = useState('quadrilateral');
  const [points, setPoints] = useState(STARTERS.quadrilateral);
  const [transformId, setTransformId] = useState('rx');
  const [showRule, setShowRule] = useState(false);
  const [dragging, setDragging] = useState(null); // 'shape' | vertex index | null

  const transform = TRANSFORMS.find((t) => t.id === transformId);
  const image = useMemo(() => points.map(transform.f), [points, transform]);

  const selectShape = (type) => {
    setShapeType(type);
    setPoints(STARTERS[type]);
  };

  /* ---------- Dragging ---------- */
  const eventToGrid = (e) => {
    const svg = svgRef.current;
    const pt = svg.createSVGPoint();
    pt.x = e.clientX;
    pt.y = e.clientY;
    const p = pt.matrixTransform(svg.getScreenCTM().inverse());
    return [(p.x - PAD) / U - R, R - (p.y - PAD) / U];
  };

  const startDrag = (e, mode) => {
    e.preventDefault();
    e.stopPropagation();
    svgRef.current.setPointerCapture(e.pointerId);
    dragRef.current = { mode, start: eventToGrid(e), orig: points };
    setDragging(mode);
  };

  const onPointerMove = (e) => {
    const drag = dragRef.current;
    if (!drag) return;
    const [gx, gy] = eventToGrid(e);

    if (drag.mode === 'shape') {
      const xs = drag.orig.map((p) => p[0]);
      const ys = drag.orig.map((p) => p[1]);
      const dx = clamp(Math.round(gx - drag.start[0]), -R - Math.min(...xs), R - Math.max(...xs));
      const dy = clamp(Math.round(gy - drag.start[1]), -R - Math.min(...ys), R - Math.max(...ys));
      setPoints(drag.orig.map(([x, y]) => [x + dx, y + dy]));
    } else {
      const i = drag.mode;
      const nx = clamp(Math.round(gx), -R, R);
      const ny = clamp(Math.round(gy), -R, R);
      setPoints((prev) => {
        if (prev[i][0] === nx && prev[i][1] === ny) return prev;
        // Don't let two corners land on the same point.
        if (prev.some((p, j) => j !== i && p[0] === nx && p[1] === ny)) return prev;
        return prev.map((p, j) => (j === i ? [nx, ny] : p));
      });
    }
  };

  const endDrag = (e) => {
    if (!dragRef.current) return;
    dragRef.current = null;
    setDragging(null);
    if (svgRef.current.hasPointerCapture(e.pointerId)) {
      svgRef.current.releasePointerCapture(e.pointerId);
    }
  };

  /* ---------- Static grid ---------- */
  const gridLines = useMemo(() => {
    const lines = [];
    for (let i = -R; i <= R; i++) {
      lines.push(
        <line key={`v${i}`} x1={toSvgX(i)} y1={toSvgY(R)} x2={toSvgX(i)} y2={toSvgY(-R)} className="tx-gridline" />,
        <line key={`h${i}`} x1={toSvgX(-R)} y1={toSvgY(i)} x2={toSvgX(R)} y2={toSvgY(i)} className="tx-gridline" />
      );
      if (i !== 0) {
        lines.push(
          <text key={`tx${i}`} x={toSvgX(i)} y={toSvgY(0) + 14} className="tx-ticklabel" textAnchor="middle">
            {fmt(i)}
          </text>,
          <text key={`ty${i}`} x={toSvgX(0) - 6} y={toSvgY(i) + 4} className="tx-ticklabel" textAnchor="end">
            {fmt(i)}
          </text>
        );
      }
    }
    return lines;
  }, []);

  const polyStr = (pts) => pts.map(([x, y]) => `${toSvgX(x)},${toSvgY(y)}`).join(' ');
  const arrowId = `tx-arrow-${uid}`;
  const axisArrowId = `tx-axis-arrow-${uid}`;
  const isRotation = transform.angle !== undefined;
  const arc = isRotation ? rotationArc(points[0], transform.angle) : null;

  return (
    <div className="tx-root">
      <h2 className="tx-title">Rotations &amp; Reflections</h2>

      <div className="tx-layout">
      <div className="tx-left">
      <div className="tx-top">
      <div className="tx-shape-toggle" role="group" aria-label="Starter shape">
        {['triangle', 'quadrilateral'].map((type) => (
          <button
            key={type}
            type="button"
            className={`tx-seg ${shapeType === type ? 'is-active' : ''}`}
            aria-pressed={shapeType === type}
            onClick={() => selectShape(type)}
          >
            {type === 'triangle' ? 'Triangle' : 'Quadrilateral'}
          </button>
        ))}
      </div>
      <p className="tx-hint">Drag the inside of the blue shape to move it. Drag a corner to reshape it.</p>
      </div>

      <div className="tx-plane-wrap">
        <svg
          ref={svgRef}
          className={`tx-plane ${dragging !== null ? 'is-dragging' : ''}`}
          viewBox={`0 0 ${SIZE} ${SIZE}`}
          onPointerMove={onPointerMove}
          onPointerUp={endDrag}
          onPointerCancel={endDrag}
          role="img"
          aria-label={`Coordinate plane showing the original shape and its image after a ${transform.name.toLowerCase()}`}
        >
          <defs>
            <marker id={arrowId} viewBox="0 0 10 10" refX="7" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse">
              <path d="M0,0 L10,5 L0,10 z" className="tx-arrowhead" />
            </marker>
            <marker id={axisArrowId} viewBox="0 0 10 10" refX="5" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
              <path d="M0,0 L10,5 L0,10 z" className="tx-axis-arrowhead" />
            </marker>
          </defs>

          {gridLines}
          <line x1={toSvgX(-R) - 12} y1={toSvgY(0)} x2={toSvgX(R) + 12} y2={toSvgY(0)} className="tx-axis"
            markerStart={`url(#${axisArrowId})`} markerEnd={`url(#${axisArrowId})`} />
          <line x1={toSvgX(0)} y1={toSvgY(-R) + 12} x2={toSvgX(0)} y2={toSvgY(R) - 12} className="tx-axis"
            markerStart={`url(#${axisArrowId})`} markerEnd={`url(#${axisArrowId})`} />
          <text x={toSvgX(R) + 4} y={toSvgY(0) - 8} className="tx-axislabel">x</text>
          <text x={toSvgX(0) + 8} y={toSvgY(R) - 4} className="tx-axislabel">y</text>

          {/* Line of reflection */}
          {transform.line && (
            <>
              <line
                x1={toSvgX(transform.line[0][0])} y1={toSvgY(transform.line[0][1])}
                x2={toSvgX(transform.line[1][0])} y2={toSvgY(transform.line[1][1])}
                className="tx-mirror"
              />
              {(transform.id === 'ryx' || transform.id === 'rnyx') && (
                <text
                  x={toSvgX(transform.id === 'ryx' ? 8.6 : -8.6) + (transform.id === 'ryx' ? -8 : 8)}
                  y={toSvgY(transform.id === 'ryx' ? 8.6 : 8.6) + 4}
                  className="tx-mirror-label"
                  textAnchor={transform.id === 'ryx' ? 'end' : 'start'}
                >
                  {transform.label}
                </text>
              )}
            </>
          )}

          {/* Rotation guide: center of rotation, rays to A and A', direction arc */}
          {isRotation && (
            <g className="tx-rotguide">
              {arc && (
                <>
                  <line x1={toSvgX(0)} y1={toSvgY(0)} x2={toSvgX(points[0][0])} y2={toSvgY(points[0][1])} className="tx-ray tx-ray-orig" />
                  <line x1={toSvgX(0)} y1={toSvgY(0)} x2={toSvgX(image[0][0])} y2={toSvgY(image[0][1])} className="tx-ray tx-ray-image" />
                  <path d={arc} className="tx-arc" markerEnd={`url(#${arrowId})`} />
                </>
              )}
              <circle cx={toSvgX(0)} cy={toSvgY(0)} r={5} className="tx-center" />
            </g>
          )}

          {/* Image */}
          <polygon points={polyStr(image)} className="tx-poly tx-poly-image" />
          {image.map((p, i) => {
            const [lx, ly] = labelPos(p, image);
            return (
              <g key={`img${i}`}>
                <circle cx={toSvgX(p[0])} cy={toSvgY(p[1])} r={5} className="tx-vertex tx-vertex-image" />
                <text x={lx} y={ly + 5} textAnchor="middle" className="tx-vlabel tx-vlabel-image">
                  {LETTERS[i]}′
                </text>
              </g>
            );
          })}

          {/* Original (on top, interactive) */}
          <polygon
            points={polyStr(points)}
            className="tx-poly tx-poly-orig"
            onPointerDown={(e) => startDrag(e, 'shape')}
          />
          {points.map((p, i) => {
            const [lx, ly] = labelPos(p, points);
            return (
              <g key={`orig${i}`}>
                <text x={lx} y={ly + 5} textAnchor="middle" className="tx-vlabel tx-vlabel-orig">
                  {LETTERS[i]}
                </text>
                <circle cx={toSvgX(p[0])} cy={toSvgY(p[1])} r={6.5} className="tx-vertex tx-vertex-orig" />
                {/* Larger invisible hit target for easier grabbing on touch screens */}
                <circle
                  cx={toSvgX(p[0])} cy={toSvgY(p[1])} r={16}
                  className="tx-hit"
                  onPointerDown={(e) => startDrag(e, i)}
                />
              </g>
            );
          })}
        </svg>
      </div>
      </div>

      <div className="tx-right">
      <div className="tx-transforms">
        {GROUPS.map((g) => (
          <div key={g.id} className="tx-group" role="group" aria-label={g.title}>
            <div className="tx-group-title">{g.title}</div>
            <div className="tx-group-buttons">
              {TRANSFORMS.filter((t) => t.group === g.id).map((t) => (
                <button
                  key={t.id}
                  type="button"
                  className={`tx-tbtn ${transformId === t.id ? 'is-active' : ''}`}
                  aria-pressed={transformId === t.id}
                  title={t.name}
                  onClick={() => setTransformId(t.id)}
                >
                  {t.label}
                </button>
              ))}
            </div>
          </div>
        ))}
      </div>

      <div className="tx-info">
        <div className="tx-current">
          <span className="tx-current-name">{transform.name}</span>
          {isRotation && <span className="tx-current-note"> about the origin</span>}
        </div>

        <table className="tx-table">
          <thead>
            <tr>
              <th scope="col" className="tx-col-orig">Original</th>
              <th scope="col" aria-hidden="true"></th>
              <th scope="col" className="tx-col-image">Image</th>
            </tr>
          </thead>
          <tbody>
            {points.map((p, i) => (
              <tr key={i}>
                <td className="tx-col-orig">{LETTERS[i]} {fmtPt(p)}</td>
                <td className="tx-arrowcell">→</td>
                <td className="tx-col-image">{LETTERS[i]}′ {fmtPt(image[i])}</td>
              </tr>
            ))}
          </tbody>
        </table>

        <div className="tx-rule">
          <button type="button" className="tx-rule-btn" onClick={() => setShowRule((s) => !s)} aria-expanded={showRule}>
            {showRule ? 'Hide rule' : 'Show rule'}
          </button>
          {showRule && (
            <span className="tx-rule-text">
              (x, y) → {transform.rule}
            </span>
          )}
        </div>
      </div>
      </div>
      </div>
    </div>
  );
}
