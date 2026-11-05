import { useEffect, useMemo, useRef, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import SectionHead from '../SectionHead'
import { usePage } from '../usePage'

// Released OST items grouped by standard. Ported from the Geo-OST-web-app project,
// which still builds the data; this works for any subject whose data has the same
// shape: { years: [{label, color}], sections: [{label, standards}], standards: {code: {description, items}} }.

// "Spring 2017" -> "2017".
const shortYear = (label) => label.replace(/^Spring\s+/, '')

function summarize(data) {
  const allItems = Object.values(data.standards).flatMap((s) => s.items)
  const yearNumbers = data.years.map((y) => Number(shortYear(y.label)))
  return {
    yearColor: Object.fromEntries(data.years.map((y) => [y.label, y.color])),
    totalItems: allItems.length,
    totalStandards: Object.keys(data.standards).length,
    countsByYear: data.years.map((y) => ({
      ...y,
      count: allItems.filter((item) => item.year === y.label).length,
    })),
    yearRange: `${Math.min(...yearNumbers)}–${Math.max(...yearNumbers)}`,
  }
}

function Sidebar({ sections, standards, selected, onSelect }) {
  return (
    <aside className="ri-sidebar">
      {/* Small screens get a dropdown instead of the long list. */}
      <select
        className="ri-select"
        value={selected ?? ''}
        onChange={(e) => onSelect(e.target.value || null)}
        aria-label="Choose a standard"
      >
        <option value="">Choose a standard…</option>
        {sections.map((section) => (
          <optgroup key={section.label} label={section.label}>
            {section.standards.map((code) => (
              <option key={code} value={code}>
                {code} ({standards[code].items.length})
              </option>
            ))}
          </optgroup>
        ))}
      </select>
      <nav className="ri-list" aria-label="Standards">
        {sections.map((section) => (
          <div key={section.label}>
            <div className="ri-section-label">{section.label}</div>
            {section.standards.map((code) => (
              <button
                key={code}
                type="button"
                className={`ri-std${code === selected ? ' active' : ''}`}
                aria-current={code === selected ? 'page' : undefined}
                onClick={() => onSelect(code)}
              >
                <span className="ri-std-code">{code}</span>
                <span className="ri-std-badge">{standards[code].items.length}</span>
              </button>
            ))}
          </div>
        ))}
      </nav>
    </aside>
  )
}

function Welcome({ summary }) {
  return (
    <div className="ri-welcome">
      <div className="ri-welcome-icon">△</div>
      <h3>Select a standard</h3>
      <p>
        Pick a standard to see every released test item mapped to it. Each card opens the
        released question and its scoring guidelines, saved from Ohio’s item release guides.
      </p>
      <div className="ri-year-pills">
        {summary.countsByYear.map(({ label, color, count }) => (
          <span
            key={label}
            className="ri-year-pill"
            style={{ color, borderColor: `${color}66`, background: `${color}1f` }}
          >
            {shortYear(label)}: {count}
          </span>
        ))}
      </div>
    </div>
  )
}

function QuestionDialog({ item, assetBase, onClose }) {
  const ref = useRef(null)
  const [showScoring, setShowScoring] = useState(false)
  const scoring = item.scoringImages ?? []
  const src = (path) => `${assetBase}${path}`

  useEffect(() => {
    ref.current?.showModal()
  }, [])

  // Clicks on the backdrop land on the <dialog> element itself.
  const onClick = (e) => {
    if (e.target === ref.current) ref.current.close()
  }

  return (
    <dialog ref={ref} className="ri-dialog" onClose={onClose} onClick={onClick}>
      <div className="ri-dialog-header">
        <span className="ri-dialog-title">
          {item.year} · {item.question}
          {item.title ? ` · ${item.title}` : ''}
        </span>
        <button type="button" className="icon-btn" onClick={() => ref.current.close()} aria-label="Close">
          ✕
        </button>
      </div>
      <div className="ri-dialog-body">
        {item.images.map((path, i) => (
          <img
            key={path}
            src={src(path)}
            alt={i === 0 ? item.text : `${item.question}, page ${i + 1}`}
          />
        ))}
        {showScoring &&
          scoring.map((path, i) => (
            <img
              key={path}
              className="scoring"
              src={src(path)}
              alt={`Scoring guidelines for ${item.question}, page ${i + 1}`}
            />
          ))}
      </div>
      <div className="ri-dialog-footer">
        {item.answer && <span className="ri-answer">Answer: {item.answer}</span>}
        {scoring.length > 0 && (
          <button type="button" className="ri-link" onClick={() => setShowScoring((s) => !s)}>
            {showScoring ? 'Hide scoring guidelines' : 'Show scoring guidelines'}
          </button>
        )}
        {item.pdfUrl && (
          <a className="ri-link" href={item.pdfUrl} target="_blank" rel="noopener noreferrer">
            Open in scoring guide PDF ↗
          </a>
        )}
      </div>
    </dialog>
  )
}

function QuestionCard({ item, color, assetBase }) {
  const { year, question, type, answer, text, images, pdfUrl } = item
  const [open, setOpen] = useState(false)
  return (
    <div className="ri-card" style={{ borderLeftColor: color }}>
      <div className="ri-card-meta">
        <span className="ri-year" style={{ background: color }}>{year}</span>
        <span className="ri-qnum">{question}</span>
        <span className="ri-type">{type}</span>
        {answer && <span className="ri-answer">Answer: {answer}</span>}
      </div>
      <p className="ri-card-text">{text}</p>
      {(images?.length > 0 || pdfUrl) && (
        <div className="ri-card-links">
          {images?.length > 0 && (
            <button type="button" className="ri-link" onClick={() => setOpen(true)}>
              View question →
            </button>
          )}
          {pdfUrl && (
            <a className="ri-link" href={pdfUrl} target="_blank" rel="noopener noreferrer">
              Scoring guide PDF ↗
            </a>
          )}
        </div>
      )}
      {open && <QuestionDialog item={item} assetBase={assetBase} onClose={() => setOpen(false)} />}
    </div>
  )
}

function StandardDetail({ code, standard, yearColor, assetBase }) {
  const { description, items } = standard
  return (
    <div>
      <div className="ri-detail-head">
        <div className="ri-detail-top">
          <h3>{code}</h3>
          <span className="tag">{items.length} item{items.length === 1 ? '' : 's'}</span>
        </div>
        <p>{description}</p>
      </div>
      <div className="ri-cards">
        {items.map((item) => (
          <QuestionCard
            key={`${item.year}-${item.question}`}
            item={item}
            color={yearColor[item.year]}
            assetBase={assetBase}
          />
        ))}
      </div>
    </div>
  )
}

export default function ReleasedItemsViewer({ subjectKey, subject }) {
  usePage(`${subject.name} Released Items`)
  const { load, assetBase } = subject.releasedItems
  const [data, setData] = useState(null)
  const [error, setError] = useState(false)
  const [params, setParams] = useSearchParams()
  const layoutRef = useRef(null)

  // The data is loaded on demand so it isn't part of every page's download.
  useEffect(() => {
    let live = true
    load()
      .then((m) => live && setData(m.default))
      .catch(() => live && setError(true))
    return () => {
      live = false
    }
  }, [load])

  const summary = useMemo(() => data && summarize(data), [data])

  // The selected standard lives in the URL (?standard=G.CO.5) so it can be
  // bookmarked and shared, and the back button works.
  const requested = params.get('standard')
  const selected = data && requested && data.standards[requested] ? requested : null

  const select = (code) => setParams(code ? { standard: code } : {})

  // When switching standards from far down the page, bring the top of the list back into view.
  useEffect(() => {
    const el = layoutRef.current
    if (!el) return
    const top = el.getBoundingClientRect().top
    if (top < 0) window.scrollTo({ top: window.scrollY + top - 90, behavior: 'instant' })
  }, [selected])

  return (
    <section className="section">
      <div className="container">
        <Link to={`/ost/${subjectKey}`} className="back-link">← {subject.name} OST resources</Link>
        <SectionHead
          kicker={`${subject.name} OST`}
          title="Released items by standard"
          sub={
            summary
              ? `${summary.totalItems} released questions across ${summary.totalStandards} standards, ${summary.yearRange}.`
              : 'Released Ohio State Test questions, grouped by the standard each one tests.'
          }
        />
        {error && <p className="ost-empty">The released items couldn’t be loaded. Try refreshing the page.</p>}
        {!data && !error && <p className="ost-empty">Loading…</p>}
        {data && (
          <div className="ri-layout" ref={layoutRef}>
            <Sidebar
              sections={data.sections}
              standards={data.standards}
              selected={selected}
              onSelect={select}
            />
            <div className="ri-main">
              {selected ? (
                <StandardDetail
                  code={selected}
                  standard={data.standards[selected]}
                  yearColor={summary.yearColor}
                  assetBase={assetBase}
                />
              ) : (
                <Welcome summary={summary} />
              )}
            </div>
          </div>
        )}
      </div>
    </section>
  )
}
