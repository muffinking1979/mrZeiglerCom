import { centroid, computeBounds, formatPoint, niceStep } from './geometry.js';

const SIZE = 520; // SVG user units; the SVG scales to its container.
const MARGIN = 28;

function Shape({ points, labels, toSvg, variant }) {
  if (points.length === 0) return null;
  const svgPoints = points.map(toSvg);
  const center = centroid(points);
  const pathPoints = svgPoints.map((p) => `${p.x},${p.y}`).join(' ');

  return (
    <g className={`tm-shape tm-shape--${variant}`}>
      {points.length >= 3 && <polygon points={pathPoints} />}
      {points.length === 2 && <polyline points={pathPoints} />}
      {svgPoints.map((p, i) => {
        // Push each label away from the shape's center so labels sit outside.
        const dx = points[i].x - center.x;
        const dy = points[i].y - center.y;
        const len = Math.hypot(dx, dy) || 1;
        const offset = 16;
        const lx = p.x + (dx / len) * offset;
        const ly = p.y - (dy / len) * offset;
        return (
          <g key={labels[i]}>
            <circle cx={p.x} cy={p.y} r={4.5} />
            <text x={lx} y={ly} textAnchor="middle" dominantBaseline="central">
              {labels[i]}
            </text>
            <title>{`${labels[i]} ${formatPoint(points[i])}`}</title>
          </g>
        );
      })}
    </g>
  );
}

export default function CoordinateGrid({ original, originalLabels, image, imageLabels }) {
  const bounds = computeBounds([...original, ...image]);
  const span = bounds.maxX - bounds.minX;
  const scale = (SIZE - MARGIN * 2) / span;

  const toSvg = ({ x, y }) => ({
    x: MARGIN + (x - bounds.minX) * scale,
    y: MARGIN + (bounds.maxY - y) * scale,
  });

  const gridStep = niceStep(span, 40);
  const labelStep = niceStep(span, 12);

  const gridValues = [];
  for (let v = Math.ceil(bounds.minX / gridStep) * gridStep; v <= bounds.maxX; v += gridStep) {
    gridValues.push(v);
  }
  const gridValuesY = [];
  for (let v = Math.ceil(bounds.minY / gridStep) * gridStep; v <= bounds.maxY; v += gridStep) {
    gridValuesY.push(v);
  }

  const axisY = Math.min(Math.max(0, bounds.minY), bounds.maxY); // where the x-axis is drawn
  const axisX = Math.min(Math.max(0, bounds.minX), bounds.maxX); // where the y-axis is drawn
  const origin = toSvg({ x: axisX, y: axisY });
  const left = MARGIN;
  const right = SIZE - MARGIN;
  const top = MARGIN;
  const bottom = SIZE - MARGIN;

  const description = [
    `Coordinate grid from ${bounds.minX} to ${bounds.maxX}.`,
    original.length
      ? `Original: ${original.map((p, i) => `${originalLabels[i]}${formatPoint(p)}`).join(', ')}.`
      : '',
    image.length
      ? `Image: ${image.map((p, i) => `${imageLabels[i]}${formatPoint(p)}`).join(', ')}.`
      : '',
  ].join(' ');

  return (
    <svg
      className="tm-grid"
      viewBox={`0 0 ${SIZE} ${SIZE}`}
      role="img"
      aria-label={description}
    >
      <rect className="tm-grid__bg" x={left} y={top} width={right - left} height={bottom - top} />

      {gridValues.map((v) => {
        const { x } = toSvg({ x: v, y: 0 });
        return <line key={`gx${v}`} className="tm-grid__line" x1={x} y1={top} x2={x} y2={bottom} />;
      })}
      {gridValuesY.map((v) => {
        const { y } = toSvg({ x: 0, y: v });
        return <line key={`gy${v}`} className="tm-grid__line" x1={left} y1={y} x2={right} y2={y} />;
      })}

      <line className="tm-grid__axis" x1={left} y1={origin.y} x2={right} y2={origin.y} />
      <line className="tm-grid__axis" x1={origin.x} y1={top} x2={origin.x} y2={bottom} />
      <text className="tm-grid__axis-name" x={right + 10} y={origin.y} dominantBaseline="central">x</text>
      <text className="tm-grid__axis-name" x={origin.x} y={top - 12} textAnchor="middle">y</text>

      {gridValues
        // Skip the right edge so the number doesn't collide with the "x" axis name.
        .filter((v) => v !== 0 && v % labelStep === 0 && v !== bounds.maxX)
        .map((v) => {
          const { x } = toSvg({ x: v, y: 0 });
          return (
            <text key={`lx${v}`} className="tm-grid__tick" x={x} y={origin.y + 13} textAnchor="middle">
              {v}
            </text>
          );
        })}
      {gridValuesY
        // Skip the top edge so the number doesn't collide with the "y" axis name.
        .filter((v) => v !== 0 && v % labelStep === 0 && v !== bounds.maxY)
        .map((v) => {
          const { y } = toSvg({ x: 0, y: v });
          return (
            <text key={`ly${v}`} className="tm-grid__tick" x={origin.x - 6} y={y} textAnchor="end" dominantBaseline="central">
              {v}
            </text>
          );
        })}

      <Shape points={original} labels={originalLabels} toSvg={toSvg} variant="original" />
      <Shape points={image} labels={imageLabels} toSvg={toSvg} variant="image" />
    </svg>
  );
}
