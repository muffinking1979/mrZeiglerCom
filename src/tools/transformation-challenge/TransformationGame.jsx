import { useEffect, useRef, useState } from 'react';
import Board from './Board.jsx';
import Badge from './Badge.jsx';
import { CorrectBurst, IncorrectShake } from './Feedback.jsx';
import { LABELS, describeTransform, generatePuzzle, primes, sameTriangle } from './geometry.js';
import './TransformationGame.css';

const GOAL = 5;
const STEP_MS = 1500; // motion time per transformation
const HOLD_MS = 450; // pause after each transformation
const OVERLAY_MS = 2000;

function ProgressBar({ streak }) {
  return (
    <div className="tg-progress" aria-label={`${streak} of ${GOAL} correct in a row`}>
      <div className="tg-progress-label">
        Correct in a row: <strong>{streak}</strong> / {GOAL}
      </div>
      <div className="tg-progress-track">
        {Array.from({ length: GOAL }, (_, i) => (
          <div key={i} className={`tg-progress-seg ${i < streak ? 'tg-filled' : ''}`}>
            {i < streak ? '★' : ''}
          </div>
        ))}
      </div>
    </div>
  );
}

function LevelPicker({ onPick }) {
  return (
    <div className="tg-level-picker">
      <h2>How many transformations?</h2>
      <p>Pick a challenge. Get {GOAL} correct in a row to earn a badge!</p>
      <div className="tg-level-options">
        {[1, 2, 3].map((n) => (
          <button key={n} className="tg-level-card" onClick={() => onPick(n)}>
            <span className="tg-level-num">{n}</span>
            <span>transformation{n > 1 ? 's' : ''}</span>
            <span className="tg-level-sub">{['Warm-up', 'Getting tricky', 'Expert'][n - 1]}</span>
          </button>
        ))}
      </div>
    </div>
  );
}

function Round({ level, onResult, onNext }) {
  const [puzzle] = useState(() => generatePuzzle(level));
  const [copy, setCopy] = useState(null);
  const [mode, setMode] = useState('placing'); // placing | animating | result
  const [anim, setAnim] = useState({ step: 0, u: 0 });
  const [correct, setCorrect] = useState(null);
  const [overlay, setOverlay] = useState(false);
  const resultSent = useRef(false);
  const onResultRef = useRef(onResult);
  onResultRef.current = onResult;

  // Animate the transformations one after another.
  useEffect(() => {
    if (mode !== 'animating') return undefined;
    let raf;
    const start = performance.now() + 250;
    const per = STEP_MS + HOLD_MS;
    const tick = (now) => {
      const t = Math.max(0, now - start);
      const step = Math.floor(t / per);
      if (step >= puzzle.transforms.length) {
        const ok = sameTriangle(copy, puzzle.final);
        setCorrect(ok);
        setMode('result');
        setOverlay(true);
        if (!resultSent.current) {
          resultSent.current = true;
          onResultRef.current(ok);
        }
        return;
      }
      setAnim({ step, u: Math.min(1, (t - step * per) / STEP_MS) });
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [mode, puzzle, copy]);

  useEffect(() => {
    if (!overlay) return undefined;
    const id = setTimeout(() => setOverlay(false), OVERLAY_MS);
    return () => clearTimeout(id);
  }, [overlay]);

  const n = puzzle.transforms.length;
  const origName = LABELS.join('');
  const finalName = LABELS.map((l) => l + primes(n)).join('');

  return (
    <div className="tg-round">
      <div className="tg-board-wrap">
        <Board puzzle={puzzle} copy={copy} onCopyChange={setCopy} mode={mode} anim={anim} primeCount={n} />
        {overlay && (correct ? <CorrectBurst /> : <IncorrectShake />)}
      </div>

      <aside className="tg-panel">
        <h3>Transformations</h3>
        <p className="tg-panel-intro">
          Perform these on <span className="tg-chip tg-chip-orange">△{origName}</span> in order:
        </p>
        <ol className="tg-steps">
          {puzzle.transforms.map((t, i) => {
            let state = '';
            if (mode === 'animating') state = i < anim.step ? 'tg-done' : i === anim.step ? 'tg-current' : '';
            if (mode === 'result') state = 'tg-done';
            return (
              <li key={i} className={state}>
                <span className="tg-step-num">{i + 1}</span>
                <span>{describeTransform(t, i)}</span>
              </li>
            );
          })}
        </ol>

        {mode === 'placing' && (
          <>
            <ul className="tg-help">
              <li>
                <strong>Drag</strong> the orange triangle to pull out a blue copy, then drag the copy to where you think{' '}
                △{finalName} lands.
              </li>
              <li>
                <strong>Hover</strong> over (or tap) your copy for <em>Reflect</em> (across a vertical line through{' '}
                {LABELS[0]}) and <em>Rotate</em> (90° clockwise about {LABELS[0]}).
              </li>
            </ul>
            <div className="tg-actions">
              <button className="tg-btn tg-btn-primary tg-btn-big" disabled={!copy} onClick={() => setMode('animating')}>
                Check
              </button>
              <button className="tg-btn" disabled={!copy} onClick={() => setCopy(null)}>
                Clear copy
              </button>
            </div>
          </>
        )}

        {mode === 'animating' && <p className="tg-watching">Watch the transformations…</p>}

        {mode === 'result' && (
          <div className={`tg-result ${correct ? 'tg-result-ok' : 'tg-result-bad'}`}>
            <p>
              {correct
                ? 'Your triangle matches the image exactly!'
                : 'Not quite. The correct image is shown in purple; your guess is the dashed blue triangle.'}
            </p>
            <button className="tg-btn tg-btn-primary tg-btn-big" onClick={onNext} disabled={overlay}>
              Next problem →
            </button>
          </div>
        )}

        <div className="tg-legend">
          <span><i style={{ background: '#f97316' }} /> Original</span>
          <span><i style={{ background: '#2563eb' }} /> Your guess</span>
          <span><i style={{ background: '#9333ea' }} /> Answer</span>
        </div>
      </aside>
    </div>
  );
}

export default function TransformationGame() {
  const [level, setLevel] = useState(null);
  const [streak, setStreak] = useState(0);
  const [round, setRound] = useState(0);
  const [showBadge, setShowBadge] = useState(false);
  const badgeTimer = useRef(null);

  useEffect(() => () => clearTimeout(badgeTimer.current), []);

  const handleResult = (ok) => {
    const next = ok ? Math.min(streak + 1, GOAL) : 0;
    setStreak(next);
    if (next >= GOAL) {
      clearTimeout(badgeTimer.current);
      badgeTimer.current = setTimeout(() => setShowBadge(true), OVERLAY_MS);
    }
  };

  const pickLevel = (n) => {
    setLevel(n);
    setStreak(0);
    setRound((r) => r + 1);
    setShowBadge(false);
  };

  const next = () => {
    if (streak >= GOAL) setStreak(0);
    setRound((r) => r + 1);
  };

  return (
    <div className="tg-root">
      <header className="tg-header">
        <h1>Transformation Challenge</h1>
        {level && <ProgressBar streak={streak} />}
        {level && (
          <div className="tg-level-tag">
            Level: {level} transformation{level > 1 ? 's' : ''}
            <button className="tg-link" onClick={() => setLevel(null)}>
              change
            </button>
          </div>
        )}
      </header>

      {!level ? (
        <LevelPicker onPick={pickLevel} />
      ) : (
        <Round key={round} level={level} onResult={handleResult} onNext={next} />
      )}

      {showBadge && (
        <Badge
          level={level}
          onPlayAgain={() => pickLevel(level)}
          onChangeLevel={() => {
            setShowBadge(false);
            setStreak(0);
            setLevel(null);
          }}
        />
      )}
    </div>
  );
}
