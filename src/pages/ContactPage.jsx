import { profile, officeHours } from '../data'
import { usePage } from '../usePage'

export default function ContactPage() {
  usePage('Contact')
  return (
    <section className="section">
      <div className="container">
        <div className="contact card reveal">
          <div className="contact-text">
            <span className="kicker">Say hi</span>
            <h2>Questions? Ideas? Math emergencies?</h2>
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
