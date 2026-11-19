import { useEffect, useRef, useState } from 'react';
import {
  GRID_MAX,
  GRID_MIN,
  LABELS,
  clampIntoGrid,
  interpolateTransform,
  primes,
  rotatePoint,
  rotationCenter,
  studentReflect,
  studentRotate,
  translate,
} from './geometry.js';

const U = 30; // pixels per grid unit
const PAD = 1.2; // grid units of margin around the grid
const VIEW_MIN = (GRID_MIN - PAD) * U;
const VIEW_SIZE = (GRID_MAX - GRID_MIN + 2 * PAD) * U;

const sx = (x) => x * U;
const sy = (y) => -y * U;
const toPoints = (tri) => tri.map((p) => `${sx(p.x)},${sy(p.y)}`).join(' ');

const COLORS = {
  original: '#f97316',
  copy: '#2563eb',
  answer: '#9333ea',
  trail: '#94a3b8',
  guide: '#e11d48',
};

function centroid(tri) {
  return { x: (tri[0].x + tri[1].x + tri[2].x) / 3, y: (tri[0].y + tri[1].y + tri[2].y) / 3 };
}

function VertexLabels({ tri, color, suffix = '' }) {
  const c = centroid(tri);
  return tri.map((p, i) => {
    const dx = p.x - c.x;
    const dy = p.y - c.y;
    const len = Math.hypot(dx, dy) || 1;
    const lx = p.x + (dx / len) * 0.6;
    const ly = p.y + (dy / len) * 0.6;
    return (
      <text
        key={i}
        x={sx(lx)}
        y={sy(ly)}
        className="tg-vertex-label"
        fill={color}
        textAnchor="middle"
        dominantBaseline="central"
      >
        {LABELS[i]}
        {suffix}
      </text>
    );
  });
}

function Triangle({ tri, color, fillOpacity = 0.35, dashed = false, strokeWidth = 2.5, className, ...rest }) {
  return (
    <g className={className} {...rest}>
      <polygon
        points={toPoints(tri)}
        fill={color}
        fillOpacity={fillOpacity}
        stroke={color}
        strokeWidth={strokeWidth}
        strokeDasharray={dashed ? '7 5' : undefined}
        strokeLinejoin="round"
      />
      {tri.map((p, i) => (
        <circle key={i} cx={sx(p.x)} cy={sy(p.y)} r={3.5} fill={color} pointerEvents="none" />
      ))}
    </g>
  );
}

function GridLines() {
  const lines = [];
  for (let i = GRID_MIN; i <= GRID_MAX; i++) {
    const axis = i === 0;
    lines.push(
      <line key={`v${i}`} x1={sx(i)} y1={sy(GRID_MIN)} x2={sx(i)} y2={sy(GRID_MAX)} className={axis ? 'tg-axis' : 'tg-gridline'} />,
      <line key={`h${i}`} x1={sx(GRID_MIN)} y1={sy(i)} x2={sx(GRID_MAX)} y2={sy(i)} className={axis ? 'tg-axis' : 'tg-gridline'} />
    );
    if (i !== 0 && i % 2 === 0) {
      lines.push(
        <text key={`tx${i}`} x={sx(i)} y={sy(0) + 14} className="tg-tick" textAnchor="middle">
          {i}
        </text>,
        <text key={`ty${i}`} x={sx(0) - 6} y={sy(i) + 4} className="tg-tick" textAnchor="end">
          {i}
        </text>
      );
    }
  }
  const end = GRID_MAX + 0.7;
  return (
    <g pointerEvents="none">
      {lines}
      <line x1={sx(GRID_MIN - 0.7)} y1={0} x2={sx(end)} y2={0} className="tg-axis" markerEnd="url(#tg-arrow)" markerStart="url(#tg-arrow)" />
      <line x1={0} y1={sy(GRID_MIN - 0.7)} x2={0} y2={sy(end)} className="tg-axis" markerEnd="url(#tg-arrow)" markerStart="url(#tg-arrow)" />
      <text x={sx(end) - 4} y={-8} className="tg-axis-name" textAnchor="end">x</text>
      <text x={10} y={sy(end) + 12} className="tg-axis-name">y</text>
    </g>
  );
}

// Dashed mirror line or pivot marker for the transformation being animated.
function Guide({ t, tri }) {
  if (!t) return null;
  if (t.kind === 'reflect') {
    const a = GRID_MIN - 0.5;
    const b = GRID_MAX + 0.5;
    const seg = {
      x: [a, 0, b, 0],
      y: [0, a, 0, b],
      'y=x': [a, a, b, b],
      'y=-x': [a, -a, b, -b],
    }[t.axis];
    return (
      <line
        x1={sx(seg[0])}
        y1={sy(seg[1])}
        x2={sx(seg[2])}
        y2={sy(seg[3])}
        stroke={COLORS.guide}
        strokeWidth={3}
        strokeDasharray="10 6"
        pointerEvents="none"
      />
    );
  }
  const c = rotationCenter(t, tri);
  return (
    <g pointerEvents="none">
      <circle cx={sx(c.x)} cy={sy(c.y)} r={9} fill="none" stroke={COLORS.guide} strokeWidth={3} />
      <circle cx={sx(c.x)} cy={sy(c.y)} r={3.5} fill={COLORS.guide} />
    </g>
  );
}

const ease = (u) => (u < 0.5 ? 2 * u * u : 1 - (-2 * u + 2) ** 2 / 2);

/**
 * mode: 'placing' | 'animating' | 'result'
 * anim: { step, u } while animating
 */
export default function Board({ puzzle, copy, onCopyChange, mode, anim, primeCount }) {
  const svgRef = useRef(null);
  const [drag, setDrag] = useState(null); // { base, start, delta, isNew }
  const [hover, setHover] = useState(false);
  const [selected, setSelected] = useState(false);
  const [copyAnim, setCopyAnim] = useState(null); // { from, kind, u }
  const hoverTimer = useRef(null);
  const dragRef = useRef(null);
  const queueRef = useRef([]);
  const toolbarPos = useRef({ left: 0, top: 0 });
  const [overToolbar, setOverToolbar] = useState(false);

  const interactive = mode === 'placing';

  const toMath = (e) => {
    const svg = svgRef.current;
    const pt = svg.createSVGPoint();
    pt.x = e.clientX;
    pt.y = e.clientY;
    const p = pt.matrixTransform(svg.getScreenCTM().inverse());
    return { x: p.x / U, y: -p.y / U };
  };

  // Drag handling on window so the pointer can leave the triangle.
  useEffect(() => {
    if (!drag) return undefined;
    const move = (e) => {
      const d = dragRef.current;
      if (!d) return;
      const m = toMath(e);
      const next = { ...d, delta: { x: m.x - d.start.x, y: m.y - d.start.y } };
      dragRef.current = next;
      setDrag(next);
    };
    const up = (e) => {
      const d = dragRef.current;
      dragRef.current = null;
      setDrag(null);
      if (!d) return;
      const dx = Math.round(d.delta.x);
      const dy = Math.round(d.delta.y);
      if (!(d.isNew && dx === 0 && dy === 0)) {
        onCopyChange(clampIntoGrid(translate(d.base, dx, dy)));
      }
      if (e.pointerType !== 'mouse') setSelected(true);
    };
    window.addEventListener('pointermove', move);
    window.addEventListener('pointerup', up);
    window.addEventListener('pointercancel', up);
    return () => {
      window.removeEventListener('pointermove', move);
      window.removeEventListener('pointerup', up);
      window.removeEventListener('pointercancel', up);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [drag !== null]);

  // Short animation for the student's reflect / rotate buttons.
  useEffect(() => {
    if (!copyAnim) return undefined;
    let raf;
    const start = performance.now();
    const tick = (now) => {
      const u = Math.min(1, (now - start) / 380);
      if (u >= 1) {
        const target = copyAnim.kind === 'reflect' ? studentReflect(copyAnim.from) : studentRotate(copyAnim.from);
        const done = clampIntoGrid(target);
        onCopyChange(done);
        // Clicks made mid-animation are queued, not dropped.
        const nextKind = queueRef.current.shift();
        setCopyAnim(nextKind ? { from: done, kind: nextKind, u: 0 } : null);
        return;
      }
      setCopyAnim((c) => c && { ...c, u });
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [copyAnim?.from, copyAnim?.kind]);

  useEffect(() => () => clearTimeout(hoverTimer.current), []);

  useEffect(() => {
    if (!interactive) {
      setHover(false);
      setSelected(false);
      setOverToolbar(false);
    }
  }, [interactive]);

  const startDrag = (e, base, isNew) => {
    if (!interactive || copyAnim) return;
    e.preventDefault();
    e.stopPropagation();
    setSelected(false);
    const d = { base, start: toMath(e), delta: { x: 0, y: 0 }, isNew };
    dragRef.current = d;
    setDrag(d);
  };

  // What the student's copy looks like right now.
  let shownCopy = copy;
  if (drag) shownCopy = translate(drag.base, drag.delta.x, drag.delta.y);
  else if (copyAnim) {
    const u = ease(copyAnim.u ?? 0);
    const a = copyAnim.from[0];
    shownCopy =
      copyAnim.kind === 'reflect'
        ? copyAnim.from.map((p) => ({ x: p.x + (2 * a.x - 2 * p.x) * u, y: p.y }))
        : copyAnim.from.map((p) => rotatePoint(p, a, -90 * u));
  }

  const showToolbar = interactive && copy && !drag && !copyAnim && (hover || selected);

  const enter = () => {
    clearTimeout(hoverTimer.current);
    setHover(true);
  };
  const leave = () => {
    clearTimeout(hoverTimer.current);
    hoverTimer.current = setTimeout(() => setHover(false), 450);
  };

  const doAction = (kind) => (e) => {
    e.stopPropagation();
    if (copyAnim) {
      queueRef.current.push(kind);
      return;
    }
    setCopyAnim({ from: copy, kind, u: 0 });
  };

  // Toolbar placement (pixels).
  let toolbar = null;
  const bw = 92;
  const bh = 32;
  const gap = 8;
  const total = bw * 2 + gap;
  if (copy && !overToolbar) {
    // Recompute placement only when the pointer isn't on the toolbar, so the
    // buttons don't jump out from under the cursor between repeated clicks.
    const xs = copy.map((p) => p.x);
    const ys = copy.map((p) => p.y);
    const cx = sx((Math.min(...xs) + Math.max(...xs)) / 2);
    const left = Math.max(VIEW_MIN + 4, Math.min(cx - total / 2, VIEW_MIN + VIEW_SIZE - total - 4));
    let top = sy(Math.max(...ys)) - bh - 18;
    if (top < VIEW_MIN + 4) top = sy(Math.min(...ys)) + 18;
    toolbarPos.current = { left, top };
  }
  const showToolbarNow = showToolbar || (overToolbar && interactive && copy && !drag);
  if (showToolbarNow) {
    const { left, top } = toolbarPos.current;
    const btn = (label, icon, x, kind) => (
      <g
        className="tg-svg-btn"
        transform={`translate(${x},${top})`}
        onPointerDown={(e) => e.stopPropagation()}
        onClick={doAction(kind)}
        role="button"
        aria-label={label}
      >
        <rect width={bw} height={bh} rx={9} />
        <text x={bw / 2} y={bh / 2 + 1} textAnchor="middle" dominantBaseline="central">
          {icon} {label}
        </text>
      </g>
    );
    toolbar = (
      <g className="tg-toolbar" onPointerEnter={() => setOverToolbar(true)} onPointerLeave={() => setOverToolbar(false)}>
        {btn('Reflect', '⇋', left, 'reflect')}
        {btn('Rotate', '↻', left + bw + gap, 'rotate')}
      </g>
    );
  }

  const { original, images, transforms, final } = puzzle;

  let moving = null;
  let guide = null;
  let trail = [];
  if (mode === 'animating' && anim) {
    const step = Math.min(anim.step, transforms.length - 1);
    trail = images.slice(1, step + 1);
    moving = interpolateTransform(images[step], transforms[step], ease(anim.u));
    guide = <Guide t={transforms[step]} tri={images[step]} />;
  } else if (mode === 'result') {
    trail = images.slice(1, -1);
  }

  const pivot = shownCopy && interactive && (hover || selected || copyAnim) ? shownCopy[0] : null;

  return (
    <svg
      ref={svgRef}
      className={`tg-board ${drag ? 'tg-dragging' : ''}`}
      viewBox={`${VIEW_MIN} ${VIEW_MIN} ${VIEW_SIZE} ${VIEW_SIZE}`}
      onPointerDown={() => setSelected(false)}
    >
      <defs>
        <marker id="tg-arrow" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse">
          <path d="M0,0 L10,5 L0,10 z" fill="#334155" />
        </marker>
      </defs>
      <rect x={VIEW_MIN} y={VIEW_MIN} width={VIEW_SIZE} height={VIEW_SIZE} fill="#fff" />
      <GridLines />

      {trail.map((tri, i) => (
        <g key={`trail${i}`} pointerEvents="none">
          <Triangle tri={tri} color={COLORS.trail} fillOpacity={0.12} dashed strokeWidth={1.5} />
          <VertexLabels tri={tri} color={COLORS.trail} suffix={primes(i + 1)} />
        </g>
      ))}

      <Triangle
        tri={original}
        color={COLORS.original}
        className={interactive ? 'tg-grab' : undefined}
        onPointerDown={(e) => startDrag(e, original, true)}
      />
      <VertexLabels tri={original} color="#c2410c" />

      {guide}

      {shownCopy && (
        <g onPointerEnter={enter} onPointerLeave={leave}>
          <Triangle
            tri={shownCopy}
            color={COLORS.copy}
            fillOpacity={mode === 'placing' ? 0.35 : 0.15}
            dashed={mode !== 'placing'}
            className={interactive ? 'tg-grab' : undefined}
            onPointerDown={(e) => startDrag(e, copy, false)}
          />
          {!copyAnim && <VertexLabels tri={shownCopy} color="#1d4ed8" suffix={primes(primeCount)} />}
          {pivot && <circle cx={sx(pivot.x)} cy={sy(pivot.y)} r={7} className="tg-pivot" />}
          {toolbar}
        </g>
      )}

      {moving && <Triangle tri={moving} color={COLORS.answer} fillOpacity={0.4} pointerEvents="none" />}

      {mode === 'result' && (
        <g pointerEvents="none">
          <Triangle tri={final} color={COLORS.answer} fillOpacity={0.4} />
          <VertexLabels tri={final} color="#7e22ce" suffix={primes(primeCount)} />
        </g>
      )}
    </svg>
  );
}

export { COLORS };
