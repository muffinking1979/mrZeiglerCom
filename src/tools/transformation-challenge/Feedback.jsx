const STAR_COUNT = 14;

export function CorrectBurst() {
  const stars = Array.from({ length: STAR_COUNT }, (_, i) => {
    const angle = (i / STAR_COUNT) * Math.PI * 2;
    const dist = 110 + (i % 3) * 35;
    return (
      <span
        key={i}
        className="tg-star"
        style={{
          '--dx': `${Math.cos(angle) * dist}px`,
          '--dy': `${Math.sin(angle) * dist}px`,
          '--delay': `${(i % 4) * 60}ms`,
          fontSize: `${22 + (i % 3) * 8}px`,
        }}
      >
        ★
      </span>
    );
  });
  return (
    <div className="tg-overlay tg-overlay-correct" role="status">
      {stars}
      <div className="tg-overlay-word">Correct!</div>
    </div>
  );
}

export function IncorrectShake() {
  return (
    <div className="tg-overlay tg-overlay-wrong" role="status">
      <svg className="tg-sad" viewBox="0 0 100 100" width="110" height="110" aria-hidden="true">
        <circle cx="50" cy="50" r="46" fill="#fde68a" stroke="#b45309" strokeWidth="4" />
        <circle cx="35" cy="40" r="5" fill="#78350f" />
        <circle cx="65" cy="40" r="5" fill="#78350f" />
        <path d="M30 74 Q50 56 70 74" fill="none" stroke="#78350f" strokeWidth="5" strokeLinecap="round" />
        <path className="tg-tear" d="M33 50 q-4 8 0 11 q4 -3 0 -11z" fill="#38bdf8" />
      </svg>
      <div className="tg-overlay-word">Incorrect</div>
    </div>
  );
}
