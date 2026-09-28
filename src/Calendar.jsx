import { useMemo, useState } from 'react'
import { SectionHead } from './App'
import { classCalendars, schoolEvents } from './data'

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
}

const LEGEND = [
  { type: 'winter', label: 'Winter Break' },
  { type: 'spring', label: 'Spring Break' },
  { type: 'exams', label: 'Exams' },
  { type: 'quarter', label: 'End of Quarter' },
  { type: 'holiday', label: 'No School' },
]

const EVENTS = schoolEvents.map((e) => ({
  ...e,
  start: new Date(e.start + 'T00:00:00'),
  end: new Date(e.end + 'T00:00:00'),
}))

function eventsOn(year, month, day) {
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

export default function Calendar() {
  const [activeClass, setActiveClass] = useState(classCalendars[0].slug)
  const [monthIndex, setMonthIndex] = useState(defaultMonthIndex)
  const [selectedDay, setSelectedDay] = useState(null)

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

  const selectedEvents = selectedDay
    ? eventsOn(selectedDay.year, selectedDay.month, selectedDay.day)
    : []

  return (
    <section id="calendar" className="section">
      <div className="container">
        <SectionHead
          kicker="03 — Calendar"
          title="Class calendars"
          sub="Breaks, exams, and no-school days for each of my classes. Pick a class, then browse the school year."
        />

        <div className="cal-tabs reveal">
          {classCalendars.map((c) => (
            <button
              key={c.slug}
              className={`cal-tab ${c.slug === activeClass ? 'active' : ''}`}
              onClick={() => setActiveClass(c.slug)}
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

          <div className="cal-grid">
            {DAY_NAMES.map((d) => (
              <div key={d} className="cal-dayname">{d}</div>
            ))}
            {cells.map((day, i) => {
              const events = day ? eventsOn(year, month, day) : []
              return (
                <button
                  key={i}
                  className={`cal-cell ${!day ? 'empty' : ''} ${isToday(day) ? 'today' : ''}`}
                  disabled={!day}
                  onClick={() => day && setSelectedDay({ year, month, day })}
                >
                  {day && <span className="cal-daynum">{day}</span>}
                  {events.length > 0 && (
                    <span className="cal-dots">
                      {events.slice(0, 3).map((e, idx) => (
                        <span key={idx} className="cal-dot" style={{ background: EVENT_COLORS[e.type] }} />
                      ))}
                    </span>
                  )}
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

      {selectedDay && (
        <div className="modal-backdrop" onClick={() => setSelectedDay(null)}>
          <div className="modal cal-modal" onClick={(e) => e.stopPropagation()}>
            <button className="icon-btn modal-close" onClick={() => setSelectedDay(null)} aria-label="Close">✕</button>
            <div className="modal-body">
              <span className="tag">{activeClassName}</span>
              <h2>
                {WEEKDAY_NAMES[new Date(selectedDay.year, selectedDay.month, selectedDay.day).getDay()]},{' '}
                {MONTH_NAMES[selectedDay.month]} {selectedDay.day}, {selectedDay.year}
              </h2>
              {selectedEvents.length === 0 ? (
                <p>No events on this day.</p>
              ) : (
                <ul className="cal-event-list">
                  {selectedEvents.map((e, i) => (
                    <li key={i}>
                      <span className="cal-dot" style={{ background: EVENT_COLORS[e.type] }} />
                      {e.label}
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        </div>
      )}
    </section>
  )
}
