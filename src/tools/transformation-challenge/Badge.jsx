import { useState } from 'react';

// Letters/digits that can't be confused with each other (no 0/O, 1/I/L).
const CODE_CHARS = 'ABCDEFGHJKMNPQRSTUVWXYZ23456789';

// e.g. "K7QM-3XRP-WD9F": a fresh random code every time a badge is earned.
function makeBadgeCode() {
  const bytes = new Uint32Array(12);
  crypto.getRandomValues(bytes);
  const chars = Array.from(bytes, (b) => CODE_CHARS[b % CODE_CHARS.length]).join('');
  return chars.match(/.{4}/g).join('-');
}

export default function Badge({ level, onPlayAgain, onChangeLevel }) {
  const [name, setName] = useState('');
  const [code] = useState(makeBadgeCode);
  const [earnedAt] = useState(() => new Date());
  const date = earnedAt.toLocaleString(undefined, {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  });

  return (
    <div className="tg-modal-backdrop">
      <div className="tg-badge-card">
        <div className="tg-badge-confetti" aria-hidden="true">
          {Array.from({ length: 18 }, (_, i) => (
            <span key={i} style={{ '--i': i }} />
          ))}
        </div>
        <svg className="tg-medal" viewBox="0 0 200 230" width="190" aria-hidden="true">
          <defs>
            <radialGradient id="tg-gold" cx="40%" cy="35%" r="70%">
              <stop offset="0%" stopColor="#fff7c2" />
              <stop offset="55%" stopColor="#facc15" />
              <stop offset="100%" stopColor="#ca8a04" />
            </radialGradient>
          </defs>
          <path d="M62 120 L40 225 L70 205 L88 228 L100 140 Z" fill="#2563eb" />
          <path d="M138 120 L160 225 L130 205 L112 228 L100 140 Z" fill="#9333ea" />
          <circle cx="100" cy="95" r="80" fill="url(#tg-gold)" stroke="#a16207" strokeWidth="5" />
          <circle cx="100" cy="95" r="64" fill="none" stroke="#a16207" strokeWidth="2" strokeDasharray="4 5" />
          <polygon points="70,120 88,62 132,104" fill="#f97316" fillOpacity="0.85" stroke="#7c2d12" strokeWidth="3" strokeLinejoin="round" />
          <polygon points="130,120 112,62 68,104" fill="#9333ea" fillOpacity="0.55" stroke="#4c1d95" strokeWidth="3" strokeLinejoin="round" strokeDasharray="5 4" />
          <text x="100" y="152" textAnchor="middle" fontSize="20" fontWeight="800" fill="#713f12">5 in a row</text>
        </svg>

        <h2 className="tg-badge-title">Transformation Master</h2>
        <input
          className="tg-name-input"
          placeholder="Type your name"
          value={name}
          maxLength={40}
          onChange={(e) => setName(e.target.value)}
          aria-label="Your name"
        />
        <p className="tg-badge-text">
          got <strong>5 correct in a row</strong> with{' '}
          <strong>
            {level} transformation{level > 1 ? 's' : ''}
          </strong>
        </p>
        <p className="tg-badge-date">{date}</p>
        <div className="tg-badge-code" aria-label={`Badge code ${code}`}>
          <span>Badge code</span>
          <strong>{code}</strong>
        </div>
        <p className="tg-badge-hint">📸 Take a screenshot of this badge to get credit!</p>
        <div className="tg-badge-actions">
          <button className="tg-btn tg-btn-primary" onClick={onPlayAgain}>
            Play again
          </button>
          <button className="tg-btn" onClick={onChangeLevel}>
            Choose a level
          </button>
        </div>
      </div>
    </div>
  );
}
