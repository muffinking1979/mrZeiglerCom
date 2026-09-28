import { useEffect, useState } from 'react'
import {
  profile,
  about,
  currentCourses,
  philosophy,
  blogPosts,
  pastClasses,
  projects,
  testimonials,
  officeHours,
} from './data'
import Calendar from './Calendar'

const NAV = [
  ['about', 'About'],
  ['teaching', 'Teaching'],
  ['calendar', 'Calendar'],
  ['blog', 'Blog'],
  ['past', 'Past Classes'],
  ['projects', 'Projects'],
  ['contact', 'Contact'],
]

function formatDate(iso) {
  return new Date(iso + 'T00:00:00').toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  })
}

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

function useReveal() {
  useEffect(() => {
    const els = document.querySelectorAll('.reveal')
    const io = new IntersectionObserver(
      (entries) =>
        entries.forEach((e) => {
          if (e.isIntersecting) {
            e.target.classList.add('visible')
            io.unobserve(e.target)
          }
        }),
      { threshold: 0.12 },
    )
    els.forEach((el) => io.observe(el))
    return () => io.disconnect()
  }, [])
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
        <a href="#top" className="logo">
          <span className="logo-mark">Z</span>
          <span>{profile.name}</span>
        </a>
        <nav className={`nav ${open ? 'open' : ''}`}>
          {NAV.map(([id, label]) => (
            <a key={id} href={`#${id}`} onClick={() => setOpen(false)}>
              {label}
            </a>
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

function Hero() {
  return (
    <section className="hero" id="top">
      <div className="blob blob-1" />
      <div className="blob blob-2" />
      <div className="container hero-inner">
        <div className="hero-text">
          <span className="pill">
            <span className="dot" /> Now teaching · Fall 2026
          </span>
          <h1>
            Hi, I’m <span className="gradient-text">{profile.name}</span>.
          </h1>
          <p className="hero-sub">{profile.title} at {profile.school}.</p>
          <p className="hero-tagline">{profile.tagline}</p>
          <div className="hero-cta">
            <a href="#teaching" className="btn btn-primary">See my classes</a>
            <a href="#blog" className="btn btn-ghost">Read the blog →</a>
          </div>
        </div>
        <div className="hero-visual">
          <div className="portrait-frame">
            <img src={profile.portrait} alt={`Portrait of ${profile.name}`} />
          </div>
          <div className="floating-card fc-1">
            <strong>12</strong> years in the classroom
          </div>
          <div className="floating-card fc-2">
            <code>{'print("Hello, class!")'}</code>
          </div>
        </div>
      </div>
    </section>
  )
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

function About() {
  return (
    <section id="about" className="section">
      <div className="container">
        <SectionHead kicker="01 — About" title="A little about me" />
        <div className="about-grid">
          <div className="about-text reveal">
            {about.paragraphs.map((p, i) => (
              <p key={i}>{p}</p>
            ))}
          </div>
          <div className="about-side reveal">
            <img className="about-photo" src={profile.classroomPhoto} alt="My classroom" />
            <div className="facts">
              {about.facts.map((f) => (
                <div key={f.label} className="fact">
                  <span>{f.icon}</span>
                  {f.label}
                </div>
              ))}
            </div>
          </div>
        </div>
        <div className="stats reveal">
          {about.stats.map((s) => (
            <div key={s.label} className="stat">
              <div className="stat-value gradient-text">{s.value}</div>
              <div className="stat-label">{s.label}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

function Teaching() {
  return (
    <section id="teaching" className="section section-alt">
      <div className="container">
        <SectionHead
          kicker="02 — Currently Teaching"
          title="This year’s classes"
          sub="Four courses, one makerspace, and roughly a thousand browser tabs."
        />
        <div className="course-grid">
          {currentCourses.map((c) => (
            <article key={c.name} className="card course reveal">
              <div className="course-img">
                <img src={c.image} alt={c.name} />
                <span className="course-code">{c.code}</span>
              </div>
              <div className="course-body">
                <h3>{c.name}</h3>
                <div className="course-meta">
                  <span>{c.level}</span>
                  <span>{c.periods}</span>
                  <span>{c.room}</span>
                </div>
                <p>{c.description}</p>
                <div className="tags">
                  {c.topics.map((t) => (
                    <span key={t} className="tag">{t}</span>
                  ))}
                </div>
              </div>
            </article>
          ))}
        </div>

        <h3 className="subhead reveal">How I teach</h3>
        <div className="philosophy">
          {philosophy.map((p, i) => (
            <div key={p.title} className="card philo reveal">
              <span className="philo-num">0{i + 1}</span>
              <h4>{p.title}</h4>
              <p>{p.body}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

function Blog({ onOpen }) {
  const [featured, ...rest] = blogPosts
  return (
    <section id="blog" className="section section-alt">
      <div className="container">
        <SectionHead
          kicker="04 — Blog"
          title="Notes from Room 214"
          sub="Thoughts on teaching, tech, and the occasional robot disaster."
        />
        <article className="card featured-post reveal" onClick={() => onOpen(featured)}>
          <img src={featured.image} alt="" />
          <div className="featured-body">
            <div className="post-meta">
              <span className="tag">{featured.tag}</span>
              <span>{formatDate(featured.date)}</span>
              <span>· {featured.readTime}</span>
            </div>
            <h3>{featured.title}</h3>
            <p>{featured.excerpt}</p>
            <span className="read-more">Read post →</span>
          </div>
        </article>
        <div className="post-grid">
          {rest.map((post) => (
            <article key={post.slug} className="card post reveal" onClick={() => onOpen(post)}>
              <img src={post.image} alt="" />
              <div className="post-body">
                <div className="post-meta">
                  <span className="tag">{post.tag}</span>
                  <span>{formatDate(post.date)}</span>
                </div>
                <h3>{post.title}</h3>
                <p>{post.excerpt}</p>
                <span className="read-more">Read post →</span>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  )
}

function PostModal({ post, onClose }) {
  useEffect(() => {
    if (!post) return
    const onKey = (e) => e.key === 'Escape' && onClose()
    document.body.style.overflow = 'hidden'
    window.addEventListener('keydown', onKey)
    return () => {
      document.body.style.overflow = ''
      window.removeEventListener('keydown', onKey)
    }
  }, [post, onClose])
  if (!post) return null
  return (
    <div className="modal-backdrop" onClick={onClose}>
      <article className="modal" onClick={(e) => e.stopPropagation()}>
        <button className="icon-btn modal-close" onClick={onClose} aria-label="Close">✕</button>
        <img src={post.image} alt="" />
        <div className="modal-body">
          <div className="post-meta">
            <span className="tag">{post.tag}</span>
            <span>{formatDate(post.date)}</span>
            <span>· {post.readTime}</span>
          </div>
          <h2>{post.title}</h2>
          {post.body.map((p, i) => (
            <p key={i}>{p}</p>
          ))}
        </div>
      </article>
    </div>
  )
}

function PastClasses() {
  return (
    <section id="past" className="section">
      <div className="container">
        <SectionHead
          kicker="05 — Past Classes"
          title="Where I’ve been"
          sub="Courses I’ve built, taught, and eventually retired."
        />
        <ol className="timeline">
          {pastClasses.map((c) => (
            <li key={c.name} className="timeline-item reveal">
              <span className="timeline-dot" />
              <span className="timeline-years">{c.years}</span>
              <div className="card timeline-card">
                <h3>{c.name}</h3>
                <span className="timeline-school">{c.school}</span>
                <p>{c.description}</p>
              </div>
            </li>
          ))}
        </ol>
      </div>
    </section>
  )
}

function Projects() {
  return (
    <section id="projects" className="section section-alt">
      <div className="container">
        <SectionHead
          kicker="06 — Student Showcase"
          title="Things my students built"
          sub="The best part of the job, by far."
        />
        <div className="project-grid">
          {projects.map((p) => (
            <figure key={p.title} className="project reveal">
              <img src={p.image} alt={p.title} />
              <figcaption>
                <span className="project-author">{p.author}</span>
                <h4>{p.title}</h4>
                <p>{p.blurb}</p>
              </figcaption>
            </figure>
          ))}
        </div>

        <div className="testimonials">
          {testimonials.map((t, i) => (
            <blockquote key={i} className="card quote reveal">
              <p>“{t.quote}”</p>
              <footer>
                <strong>{t.name}</strong> · {t.role}
              </footer>
            </blockquote>
          ))}
        </div>
      </div>
    </section>
  )
}

function Contact() {
  return (
    <section id="contact" className="section">
      <div className="container">
        <div className="contact card reveal">
          <div className="contact-text">
            <span className="kicker">07 — Say hi</span>
            <h2>Questions? Ideas? Robot emergencies?</h2>
            <p>
              Students, parents, and fellow educators are always welcome to reach out. I usually
              reply within one school day.
            </p>
            <a className="btn btn-primary" href={`mailto:${profile.email}`}>
              {profile.email}
            </a>
            <div className="socials">
              {profile.socials.map((s) => (
                <a key={s.label} href={s.href} target="_blank" rel="noreferrer">
                  {s.label} ↗
                </a>
              ))}
            </div>
          </div>
          <div className="hours">
            <h3>Office hours</h3>
            {officeHours.map((h) => (
              <div key={h.day} className="hours-row">
                <div>
                  <strong>{h.day}</strong>
                  <span>{h.place}</span>
                </div>
                <span className="hours-time">{h.time}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}

export default function App() {
  const [theme, toggleTheme] = useTheme()
  const [openPost, setOpenPost] = useState(null)
  useReveal()
  return (
    <>
      <Header theme={theme} toggleTheme={toggleTheme} />
      <main>
        <Hero />
        <About />
        <Teaching />
        <Calendar />
        <Blog onOpen={setOpenPost} />
        <PastClasses />
        <Projects />
        <Contact />
      </main>
      <footer className="footer">
        <div className="container footer-inner">
          <span>© {new Date().getFullYear()} {profile.name} · {profile.school}</span>
          <a href="#top">Back to top ↑</a>
        </div>
      </footer>
      <PostModal post={openPost} onClose={() => setOpenPost(null)} />
    </>
  )
}
