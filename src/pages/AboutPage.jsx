import SectionHead from '../SectionHead'
import { profile, about } from '../data'
import { usePage } from '../usePage'

export default function AboutPage() {
  usePage('About')
  return (
    <section className="section">
      <div className="container">
        <SectionHead kicker="About" title="A little about me" />
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
