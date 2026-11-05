import { Link } from 'react-router-dom'
import { profile } from '../data'
import { usePage } from '../usePage'

export default function HomePage() {
  usePage()
  return (
    <section className="hero">
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
            <Link to="/calendar" className="btn btn-primary">Class calendars</Link>
            <Link to="/blog" className="btn btn-ghost">Read the blog →</Link>
          </div>
        </div>
        <div className="hero-visual">
          <div className="portrait-frame">
            <img src={profile.portrait} alt={`Portrait of ${profile.name}`} />
          </div>
          <div className="floating-card fc-1">
            <strong>17</strong> years in the classroom
          </div>
          <div className="floating-card fc-2">
            <code>{'e^(iπ) + 1 = 0'}</code>
          </div>
        </div>
      </div>
    </section>
  )
}
