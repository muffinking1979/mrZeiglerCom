import { useEffect, useState } from 'react'
import { BrowserRouter, Link, Route, Routes } from 'react-router-dom'
import { profile } from './data'
import Home from './Home'
import CalendarPage from './CalendarPage'

const NAV = [
  { id: 'about', label: 'About', to: '/#about' },
  { id: 'teaching', label: 'Teaching', to: '/#teaching' },
  { id: 'calendar', label: 'Calendar', to: '/calendar' },
  { id: 'blog', label: 'Blog', to: '/#blog' },
  { id: 'past', label: 'Past Classes', to: '/#past' },
  { id: 'projects', label: 'Projects', to: '/#projects' },
  { id: 'contact', label: 'Contact', to: '/#contact' },
]

function useTheme() {
  const [theme, setTheme] = useState(() => {
    try {
      return localStorage.getItem('theme') || 'dark'
    } catch {
      return 'dark'
    }
  })
  useEffect(() => {
    document.documentElement.dataset.theme = theme
    try {
      localStorage.setItem('theme', theme)
    } catch {
      /* storage unavailable */
    }
  }, [theme])
  return [theme, () => setTheme((t) => (t === 'dark' ? 'light' : 'dark'))]
}

export function SectionHead({ kicker, title, sub }) {
  return (
    <div className="section-head reveal">
      <span className="kicker">{kicker}</span>
      <h2>{title}</h2>
      {sub && <p>{sub}</p>}
    </div>
  )
}

function Header({ theme, toggleTheme }) {
  const [open, setOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20)
    window.addEventListener('scroll', onScroll)
    return () => window.removeEventListener('scroll', onScroll)
  }, [])
  return (
    <header className={`header ${scrolled ? 'scrolled' : ''}`}>
      <div className="container header-inner">
        <Link to="/" className="logo" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>
          <span className="logo-mark">Z</span>
          <span>{profile.name}</span>
        </Link>
        <nav className={`nav ${open ? 'open' : ''}`}>
          {NAV.map((item) => (
            <Link key={item.id} to={item.to} onClick={() => setOpen(false)}>
              {item.label}
            </Link>
          ))}
        </nav>
        <div className="header-actions">
          <button className="icon-btn" onClick={toggleTheme} aria-label="Toggle color theme">
            {theme === 'dark' ? '☀' : '☾'}
          </button>
          <button
            className="icon-btn menu-btn"
            onClick={() => setOpen((o) => !o)}
            aria-label="Toggle menu"
            aria-expanded={open}
          >
            {open ? '✕' : '☰'}
          </button>
        </div>
      </div>
    </header>
  )
}

function Footer() {
  return (
    <footer className="footer">
      <div className="container footer-inner">
        <span>© {new Date().getFullYear()} {profile.name} · {profile.school}</span>
        <button
          type="button"
          className="footer-top-btn"
          onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
        >
          Back to top ↑
        </button>
      </div>
    </footer>
  )
}

export default function App() {
  const [theme, toggleTheme] = useTheme()
  return (
    <BrowserRouter>
      <Header theme={theme} toggleTheme={toggleTheme} />
      <main>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/calendar" element={<CalendarPage />} />
        </Routes>
      </main>
      <Footer />
    </BrowserRouter>
  )
}
