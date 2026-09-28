import { useEffect, useMemo, useRef, useState } from 'react'
import { SectionHead } from './App'
import { classCalendars, schoolEvents } from './data'
import { checkPassword, fetchCalendarEvents, saveCalendarEvents } from './calendarApi'

// The school year's months, in the order the calendar can navigate through.
const MONTHS_IN_RANGE = [
  { year: 2026, month: 7 },
  { year: 2026, month: 8 },
  { year: 2026, month: 9 },
  { year: 2026, month: 10 },
  { year: 2026, month: 11 },
  { year: 2027, month: 0 },
  { year: 2027, month: 1 },
  { year: 2027, month: 2 },
  { year: 2027, month: 3 },
  { year: 2027, month: 4 },
  { year: 2027, month: 5 },
]

const MONTH_NAMES = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
]
const WEEKDAY_NAMES = [
  'Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday',
]
const DAY_NAMES = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']

const EVENT_COLORS = {
  winter: 'var(--accent-2)',
  spring: '#22c55e',
  exams: 'var(--accent-3)',
  quarter: 'var(--accent-1)',
  holiday: 'var(--muted)',
  added: '#f59e0b',
}

const LEGEND = [
  { type: 'winter', label: 'Winter Break' },
  { type: 'spring', label: 'Spring Break' },
  { type: 'exams', label: 'Exams' },
  { type: 'quarter', label: 'End of Quarter' },
  { type: 'holiday', label: 'No School' },
  { type: 'added', label: 'Class Event' },
]

const EVENTS = schoolEvents.map((e) => ({
  ...e,
  start: new Date(e.start + 'T00:00:00'),
  end: new Date(e.end + 'T00:00:00'),
}))

// sessionStorage only — cleared when the tab closes, never written to the browser bundle.
const PW_KEY = 'calendar-admin-password'

function schoolEventsOn(year, month, day) {
  const d = new Date(year, month, day)
  return EVENTS.filter((e) => d >= e.start && d <= e.end)
}

function daysInMonth(year, month) {
  return new Date(year, month + 1, 0).getDate()
}

function firstWeekday(year, month) {
  return new Date(year, month, 1).getDay()
}

function defaultMonthIndex() {
  const today = new Date()
  const i = MONTHS_IN_RANGE.findIndex(
    (m) => m.year === today.getFullYear() && m.month === today.getMonth(),
  )
  return i === -1 ? 0 : i
}

function dateKey(year, month, day) {
  return `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`
}

function keyToDate(key) {
  const [y, m, d] = key.split('-').map(Number)
  return new Date(y, m - 1, d)
}

function shiftDateKey(key, days) {
  const d = keyToDate(key)
  d.setDate(d.getDate() + days)
  return dateKey(d.getFullYear(), d.getMonth(), d.getDate())
}

function ShiftToolbar({ selectedKeys, onApply, onCancel }) {
  const [amount, setAmount] = useState(1)
  const [direction, setDirection] = useState('forward')
  const count = selectedKeys.size

  return (
    <div className="shift-toolbar reveal visible">
      <span className="shift-info">
        {count === 0 ? 'Click days to select them' : `${count} day${count !== 1 ? 's' : ''} selected`}
      </span>
      <div className="shift-controls">
        <div className="shift-dir-group">
          <button
            type="button"
            className={`shift-dir-btn ${direction === 'backward' ? 'active' : ''}`}
            onClick={() => setDirection('backward')}
            title="Backward"
          >
            ◀
          </button>
          <button
            type="button"
            className={`shift-dir-btn ${direction === 'forward' ? 'active' : ''}`}
            onClick={() => setDirection('forward')}
            title="Forward"
          >
            ▶
          </button>
        </div>
        <input
          type="number"
          min="1"
          className="shift-amount"
          value={amount}
          onChange={(e) => setAmount(Math.max(1, Number(e.target.value) || 1))}
        />
        <span className="shift-label">day{amount !== 1 ? 's' : ''}</span>
      </div>
      <div className="shift-actions">
        <button
          type="button"
          className="btn btn-primary shift-apply-btn"
          disabled={count === 0}
          onClick={() => onApply(direction === 'forward' ? amount : -amount)}
        >
          Apply
        </button>
        <button type="button" className="btn btn-ghost shift-cancel-btn" onClick={onCancel}>
          Cancel
        </button>
      </div>
    </div>
  )
}

export default function Calendar() {
  const [activeClass, setActiveClass] = useState(classCalendars[0].slug)
  const [monthIndex, setMonthIndex] = useState(defaultMonthIndex)
  const [selectedDay, setSelectedDay] = useState(null)

  // ── Admin auth ──────────────────────────────────────────────────────────
  const [password, setPassword] = useState(() => {
    try {
      return sessionStorage.getItem(PW_KEY) || ''
    } catch {
      return ''
    }
  })
  const isAdmin = !!password
  const [loginOpen, setLoginOpen] = useState(false)
  const [loginPw, setLoginPw] = useState('')
  const [loginError, setLoginError] = useState('')

  const logout = (msg = '') => {
    try {
      sessionStorage.removeItem(PW_KEY)
    } catch {
      /* storage unavailable */
    }
    setPassword('')
    setLoginError(msg)
    setShiftMode(false)
    setShiftSelected(new Set())
  }

  const login = async (pw) => {
    try {
      await checkPassword(pw)
      try {
        sessionStorage.setItem(PW_KEY, pw)
      } catch {
        /* storage unavailable */
      }
      setPassword(pw)
      setLoginError('')
      setLoginOpen(false)
      setLoginPw('')
    } catch (e) {
      setLoginError(e.unauthorized ? 'Wrong password.' : e.message)
    }
  }

  // ── Per-class events, loaded from the server ───────────────────────────
  const [userEvents, setUserEvents] = useState(null)
  const [loadError, setLoadError] = useState('')
  const [saveStatus, setSaveStatus] = useState('saved') // saved | saving | error
  const skipNextSave = useRef(true)
  const saveChain = useRef(Promise.resolve())

  useEffect(() => {
    let live = true
    setUserEvents(null)
    setLoadError('')
    skipNextSave.current = true
    fetchCalendarEvents(activeClass).then(
      (events) => live && setUserEvents(events),
      () => live && (setUserEvents({}), setLoadError('Could not load this calendar.')),
    )
    return () => {
      live = false
    }
  }, [activeClass])

  useEffect(() => {
    if (!isAdmin || userEvents === null) return
    if (skipNextSave.current) {
      skipNextSave.current = false
      return
    }
    setSaveStatus('saving')
    const slug = activeClass
    const t = setTimeout(() => {
      saveChain.current = saveChain.current
        .then(() => saveCalendarEvents(slug, password, userEvents))
        .then(() => setSaveStatus('saved'))
        .catch((e) => {
          if (e.unauthorized) logout('Password no longer accepted.')
          else setSaveStatus('error')
        })
    }, 500)
    return () => clearTimeout(t)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userEvents, isAdmin, activeClass, password])

  useEffect(() => {
    if (saveStatus === 'saved') return
    const warn = (e) => e.preventDefault()
    window.addEventListener('beforeunload', warn)
    return () => window.removeEventListener('beforeunload', warn)
  }, [saveStatus])

  // ── Shift mode ───────────────────────────────────────────────────────────
  const [shiftMode, setShiftMode] = useState(false)
  const [shiftSelected, setShiftSelected] = useState(new Set())

  const enterShiftMode = () => {
    setShiftMode(true)
    setShiftSelected(new Set())
    setSelectedDay(null)
  }
  const cancelShift = () => {
    setShiftMode(false)
    setShiftSelected(new Set())
  }
  const toggleShiftDay = (key) => {
    setShiftSelected((prev) => {
      const next = new Set(prev)
      if (next.has(key)) next.delete(key)
      else next.add(key)
      return next
    })
  }
  const applyShift = (deltaDays) => {
    setUserEvents((prev) => {
      const next = { ...(prev || {}) }
      const keys = [...shiftSelected].sort((a, b) => (deltaDays > 0 ? b.localeCompare(a) : a.localeCompare(b)))
      for (const key of keys) {
        if (!next[key]?.length) continue
        const newKey = shiftDateKey(key, deltaDays)
        next[newKey] = [...(next[newKey] || []), ...next[key]]
        delete next[key]
      }
      return next
    })
    setShiftMode(false)
    setShiftSelected(new Set())
  }

  // ── Add / delete a single event ─────────────────────────────────────────
  const addEvent = (title) => {
    if (!selectedDay) return
    const key = dateKey(selectedDay.year, selectedDay.month, selectedDay.day)
    const id = crypto.randomUUID()
    setUserEvents((prev) => ({ ...(prev || {}), [key]: [...((prev || {})[key] || []), { id, title }] }))
  }
  const deleteEvent = (id) => {
    if (!selectedDay) return
    const key = dateKey(selectedDay.year, selectedDay.month, selectedDay.day)
    setUserEvents((prev) => {
      const next = { ...(prev || {}) }
      next[key] = (next[key] || []).filter((e) => e.id !== id)
      if (next[key].length === 0) delete next[key]
      return next
    })
  }

  const switchClass = (slug) => {
    setActiveClass(slug)
    setSelectedDay(null)
    cancelShift()
  }

  const { year, month } = MONTHS_IN_RANGE[monthIndex]
  const numDays = daysInMonth(year, month)
  const startDay = firstWeekday(year, month)

  const cells = useMemo(() => {
    const arr = []
    for (let i = 0; i < startDay; i++) arr.push(null)
    for (let d = 1; d <= numDays; d++) arr.push(d)
    return arr
  }, [startDay, numDays])

  const activeClassName = classCalendars.find((c) => c.slug === activeClass)?.name
  const today = new Date()
  const isToday = (d) =>
    !!d && today.getFullYear() === year && today.getMonth() === month && today.getDate() === d

  const selectedKey = selectedDay ? dateKey(selectedDay.year, selectedDay.month, selectedDay.day) : null
  const selectedSchoolEvents = selectedDay ? schoolEventsOn(selectedDay.year, selectedDay.month, selectedDay.day) : []
  const selectedUserEvents = (selectedKey && userEvents?.[selectedKey]) || []

  return (
    <section id="calendar" className="section">
      <div className="container">
        <SectionHead
          kicker="Calendar"
          title="Class calendars"
          sub="Breaks, exams, and no-school days for each of my classes. Pick a class, then browse the school year."
        />

        <div className="cal-admin-row reveal">
          {isAdmin ? (
            <>
              <span className="cal-admin-badge">🔓 Admin</span>
              <span className={`cal-save-status cal-save-${saveStatus}`}>
                {saveStatus === 'saved' ? '✓ Saved' : saveStatus === 'saving' ? 'Saving…' : '⚠ Not saved — retrying on next change'}
              </span>
              <button
                type="button"
                className={`cal-shift-btn ${shiftMode ? 'active' : ''}`}
                onClick={shiftMode ? cancelShift : enterShiftMode}
              >
                ⇄ Shift Many
              </button>
              <button type="button" className="cal-admin-link" onClick={() => logout()}>
                Log out
              </button>
            </>
          ) : (
            <button type="button" className="cal-admin-link" onClick={() => setLoginOpen((o) => !o)}>
              🔒 Admin
            </button>
          )}
        </div>

        {!isAdmin && loginOpen && (
          <form
            className="cal-login-row reveal visible"
            onSubmit={(e) => {
              e.preventDefault()
              login(loginPw)
            }}
          >
            <input
              type="password"
              autoFocus
              placeholder="Admin password"
              className="cal-login-input"
              value={loginPw}
              onChange={(e) => setLoginPw(e.target.value)}
            />
            <button type="submit" className="btn btn-primary cal-login-submit">
              Unlock
            </button>
            {loginError && <span className="cal-login-error">{loginError}</span>}
          </form>
        )}

        <div className="cal-tabs reveal">
          {classCalendars.map((c) => (
            <button
              key={c.slug}
              className={`cal-tab ${c.slug === activeClass ? 'active' : ''}`}
              onClick={() => switchClass(c.slug)}
            >
              {c.name}
            </button>
          ))}
        </div>

        <div className="card cal-card reveal">
          <div className="cal-header">
            <button
              className="icon-btn"
              disabled={monthIndex === 0}
              onClick={() => setMonthIndex((i) => i - 1)}
              aria-label="Previous month"
            >
              ‹
            </button>
            <h3>{MONTH_NAMES[month]} {year}</h3>
            <button
              className="icon-btn"
              disabled={monthIndex === MONTHS_IN_RANGE.length - 1}
              onClick={() => setMonthIndex((i) => i + 1)}
              aria-label="Next month"
            >
              ›
            </button>
          </div>

          <div className={`cal-grid ${shiftMode ? 'shift-mode' : ''}`}>
            {DAY_NAMES.map((d) => (
              <div key={d} className="cal-dayname">{d}</div>
            ))}
            {cells.map((day, i) => {
              const events = day ? schoolEventsOn(year, month, day) : []
              const key = day ? dateKey(year, month, day) : null
              const hasUserEvents = !!(key && userEvents?.[key]?.length)
              const isShiftSelected = !!(key && shiftSelected.has(key))
              return (
                <button
                  key={i}
                  className={[
                    'cal-cell',
                    !day ? 'empty' : '',
                    isToday(day) ? 'today' : '',
                    isShiftSelected ? 'shift-selected' : '',
                  ].join(' ').trim()}
                  disabled={!day}
                  onClick={() => {
                    if (!day) return
                    if (shiftMode) toggleShiftDay(key)
                    else setSelectedDay({ year, month, day })
                  }}
                >
                  {day && <span className="cal-daynum">{day}</span>}
                  {(events.length > 0 || hasUserEvents) && (
                    <span className="cal-dots">
                      {events.slice(0, 3).map((e, idx) => (
                        <span key={idx} className="cal-dot" style={{ background: EVENT_COLORS[e.type] }} />
                      ))}
                      {hasUserEvents && <span className="cal-dot" style={{ background: EVENT_COLORS.added }} />}
                    </span>
                  )}
                  {isShiftSelected && <span className="cal-shift-check">✓</span>}
                </button>
              )
            })}
          </div>

          <div className="cal-legend">
            {LEGEND.map((l) => (
              <span key={l.type} className="cal-legend-item">
                <span className="cal-dot" style={{ background: EVENT_COLORS[l.type] }} />
                {l.label}
              </span>
            ))}
          </div>
        </div>
      </div>

      {selectedDay && !shiftMode && (
        <div className="modal-backdrop" onClick={() => setSelectedDay(null)}>
          <div className="modal cal-modal" onClick={(e) => e.stopPropagation()}>
            <button className="icon-btn modal-close" onClick={() => setSelectedDay(null)} aria-label="Close">✕</button>
            <div className="modal-body">
              <span className="tag">{activeClassName}</span>
              <h2>
                {WEEKDAY_NAMES[new Date(selectedDay.year, selectedDay.month, selectedDay.day).getDay()]},{' '}
                {MONTH_NAMES[selectedDay.month]} {selectedDay.day}, {selectedDay.year}
              </h2>

              {selectedSchoolEvents.length > 0 && (
                <div className="cal-modal-section">
                  <p className="cal-modal-section-title">School Calendar</p>
                  <ul className="cal-event-list">
                    {selectedSchoolEvents.map((e, i) => (
                      <li key={i}>
                        <span className="cal-dot" style={{ background: EVENT_COLORS[e.type] }} />
                        {e.label}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              <div className="cal-modal-section">
                <p className="cal-modal-section-title">Events</p>
                {loadError ? (
                  <p className="cal-modal-empty">{loadError}</p>
                ) : selectedUserEvents.length === 0 ? (
                  <p className="cal-modal-empty">No events on this day.</p>
                ) : (
                  <ul className="cal-event-list">
                    {selectedUserEvents.map((ev) => (
                      <li key={ev.id}>
                        <span className="cal-dot" style={{ background: EVENT_COLORS.added }} />
                        <span className="cal-event-text">{ev.title}</span>
                        {isAdmin && (
                          <button className="cal-delete-btn" onClick={() => deleteEvent(ev.id)} aria-label="Delete event">✕</button>
                        )}
                      </li>
                    ))}
                  </ul>
                )}
              </div>

              {isAdmin && <AddEventRow onAdd={addEvent} />}
            </div>
          </div>
        </div>
      )}

      {shiftMode && (
        <ShiftToolbar selectedKeys={shiftSelected} onApply={applyShift} onCancel={cancelShift} />
      )}
    </section>
  )
}

function AddEventRow({ onAdd }) {
  const [input, setInput] = useState('')
  const submit = () => {
    const text = input.trim()
    if (!text) return
    onAdd(text)
    setInput('')
  }
  return (
    <div className="cal-add-row">
      <input
        type="text"
        className="cal-add-input"
        placeholder="Add an event…"
        value={input}
        onChange={(e) => setInput(e.target.value)}
        onKeyDown={(e) => e.key === 'Enter' && submit()}
      />
      <button type="button" className="btn btn-primary cal-add-btn" onClick={submit}>
        Add
      </button>
    </div>
  )
}
