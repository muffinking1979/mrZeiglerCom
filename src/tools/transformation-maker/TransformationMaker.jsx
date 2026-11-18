import { useId, useMemo, useRef, useState } from 'react';
import CoordinateGrid from './CoordinateGrid.jsx';
import { formatPoint, parseCoordinate, vertexLabel } from './geometry.js';
import { parseRule } from './parseRule.js';
import './TransformationMaker.css';

const DEFAULT_VERTICES = [
  { x: '1', y: '1' },
  { x: '4', y: '1' },
  { x: '1', y: '3' },
];

/**
 * Students enter a shape's vertices and a coordinate rule (x' and y' separately);
 * the original shape and its image are plotted on a coordinate grid.
 *
 * Props (all optional):
 *  - initialVertices: [{ x: number|string, y: number|string }, ...]  (default: a triangle)
 *  - initialRuleX / initialRuleY: strings, e.g. "x + 3", "-y"
 *  - minVertices / maxVertices: limits for add/remove (default 3 / 10)
 */
export default function TransformationMaker({
  initialVertices = DEFAULT_VERTICES,
  initialRuleX = 'x + 5',
  initialRuleY = 'y - 4',
  minVertices = 3,
  maxVertices = 10,
}) {
  const uid = useId();
  const nextId = useRef(0);
  const makeVertex = (v) => ({ id: nextId.current++, x: String(v.x), y: String(v.y) });

  const [vertices, setVertices] = useState(() => initialVertices.map(makeVertex));
  const [ruleX, setRuleX] = useState(initialRuleX);
  const [ruleY, setRuleY] = useState(initialRuleY);

  const parsedX = useMemo(() => parseRule(ruleX), [ruleX]);
  const parsedY = useMemo(() => parseRule(ruleY), [ruleY]);

  const parsedVertices = vertices.map((v) => ({ x: parseCoordinate(v.x), y: parseCoordinate(v.y) }));
  const allVerticesValid = parsedVertices.every((p) => p.x !== null && p.y !== null);
  const validPoints = parsedVertices.filter((p) => p.x !== null && p.y !== null);
  const validLabels = vertices.map((_, i) => vertexLabel(i)).filter((_, i) => parsedVertices[i].x !== null && parsedVertices[i].y !== null);

  let image = [];
  let imageError = null;
  if (parsedX.ok && parsedY.ok) {
    image = validPoints.map((p) => ({ x: parsedX.evaluate(p), y: parsedY.evaluate(p) }));
    if (image.some((p) => !Number.isFinite(p.x) || !Number.isFinite(p.y))) {
      imageError = "The rule gives an undefined result for at least one point (for example, dividing by zero), so the image can't be drawn.";
      image = [];
    }
  }
  const imageLabels = validLabels.map((l) => `${l}′`);

  const updateVertex = (id, axis, value) =>
    setVertices((vs) => vs.map((v) => (v.id === id ? { ...v, [axis]: value } : v)));
  const removeVertex = (id) => setVertices((vs) => vs.filter((v) => v.id !== id));
  const addVertex = () => setVertices((vs) => [...vs, makeVertex({ x: '', y: '' })]);

  return (
    <div className="tm-root">
      {/* Children are in phone reading order (shape, rule, grid, results);
          on wide containers CSS grid areas move the grid to its own column. */}
      <div className="tm-layout">
        <section className="tm-panel tm-area-shape" aria-labelledby={`${uid}-shape`}>
          <h2 id={`${uid}-shape`} className="tm-heading">
            <span className="tm-swatch tm-swatch--original" aria-hidden="true" />
            Original shape
          </h2>
          <ol className="tm-vertex-list">
            {vertices.map((v, i) => {
              const label = vertexLabel(i);
              const p = parsedVertices[i];
              return (
                <li key={v.id} className="tm-vertex">
                  <span className="tm-vertex__label">{label}</span>
                  <span className="tm-paren" aria-hidden="true">(</span>
                  <input
                    className="tm-input tm-input--coord"
                    type="text"
                    inputMode="decimal"
                    value={v.x}
                    aria-label={`${label} x-coordinate`}
                    aria-invalid={p.x === null}
                    onChange={(e) => updateVertex(v.id, 'x', e.target.value)}
                  />
                  <span className="tm-paren" aria-hidden="true">,</span>
                  <input
                    className="tm-input tm-input--coord"
                    type="text"
                    inputMode="decimal"
                    value={v.y}
                    aria-label={`${label} y-coordinate`}
                    aria-invalid={p.y === null}
                    onChange={(e) => updateVertex(v.id, 'y', e.target.value)}
                  />
                  <span className="tm-paren" aria-hidden="true">)</span>
                  <button
                    type="button"
                    className="tm-button tm-button--icon"
                    onClick={() => removeVertex(v.id)}
                    disabled={vertices.length <= minVertices}
                    aria-label={`Remove point ${label}`}
                    title={vertices.length <= minVertices ? `A shape needs at least ${minVertices} points` : `Remove point ${label}`}
                  >
                    ×
                  </button>
                </li>
              );
            })}
          </ol>
          <button
            type="button"
            className="tm-button"
            onClick={addVertex}
            disabled={vertices.length >= maxVertices}
          >
            + Add point
          </button>
          {!allVerticesValid && (
            <p className="tm-message tm-message--warn" role="status">
              Fill in every coordinate with a number. Points with blank or invalid entries aren't plotted.
            </p>
          )}
        </section>

        <section className="tm-panel tm-area-rule" aria-labelledby={`${uid}-rule`}>
          <h2 id={`${uid}-rule`} className="tm-heading">
            <span className="tm-swatch tm-swatch--image" aria-hidden="true" />
            Coordinate rule
          </h2>
          <p className="tm-rule-summary" aria-hidden="true">
            (x, y) → ({ruleX.trim() || '?'}, {ruleY.trim() || '?'})
          </p>
          <RuleField id={`${uid}-rx`} name="x′ =" value={ruleX} onChange={setRuleX} parsed={parsedX} />
          <RuleField id={`${uid}-ry`} name="y′ =" value={ruleY} onChange={setRuleY} parsed={parsedY} />
          <p className="tm-hint">
            Use x, y, numbers, + − * / ^ and parentheses. Examples: <code>x + 3</code>, <code>-y</code>,{' '}
            <code>2x</code>, <code>y - 4</code>.
          </p>
          {imageError && <p className="tm-message tm-message--error" role="alert">{imageError}</p>}
        </section>

        <div className="tm-grid-wrap tm-area-grid">
          <CoordinateGrid
            original={validPoints}
            originalLabels={validLabels}
            image={image}
            imageLabels={imageLabels}
          />
          <div className="tm-legend">
            <span><span className="tm-swatch tm-swatch--original" aria-hidden="true" /> Original</span>
            <span><span className="tm-swatch tm-swatch--image" aria-hidden="true" /> Image</span>
          </div>
        </div>

        {image.length > 0 && (
          <section className="tm-panel tm-area-results" aria-labelledby={`${uid}-results`}>
            <h2 id={`${uid}-results`} className="tm-heading">Results</h2>
            <table className="tm-table">
              <thead>
                <tr>
                  <th scope="col">Original</th>
                  <th scope="col" aria-label="maps to" />
                  <th scope="col">Image</th>
                </tr>
              </thead>
              <tbody>
                {validPoints.map((p, i) => (
                  <tr key={validLabels[i]}>
                    <td>{validLabels[i]}{formatPoint(p)}</td>
                    <td aria-hidden="true">→</td>
                    <td>{imageLabels[i]}{formatPoint(image[i])}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </section>
        )}
      </div>
    </div>
  );
}

function RuleField({ id, name, value, onChange, parsed }) {
  const showError = !parsed.ok;
  return (
    <div className="tm-rule">
      <label htmlFor={id} className="tm-rule__name">{name}</label>
      <input
        id={id}
        className="tm-input tm-input--rule"
        type="text"
        value={value}
        spellCheck={false}
        autoComplete="off"
        autoCapitalize="off"
        aria-invalid={showError}
        aria-describedby={showError ? `${id}-err` : undefined}
        onChange={(e) => onChange(e.target.value)}
      />
      {showError && (
        <p id={`${id}-err`} className="tm-message tm-message--error tm-rule__error">{parsed.error}</p>
      )}
    </div>
  );
}
