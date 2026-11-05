import { Link } from 'react-router-dom'
import SectionHead from '../SectionHead'
import { subjects, subjectOrder } from '../ost/subjects'
import { usePage } from '../usePage'

export default function OstPage() {
  usePage('OST Resources')
  return (
    <section className="section">
      <div className="container">
        <SectionHead
          kicker="OST Resources"
          title="Ohio State Tests"
          sub="Materials for teachers preparing students for Ohio’s end-of-course math tests. Pick a test to see what’s here."
        />
        <div className="ost-subjects">
          {subjectOrder.map((key) => {
            const s = subjects[key]
            const count = s.resources.length
            return (
              <Link key={key} to={`/ost/${key}`} className="card ost-subject reveal">
                <h3>{s.name}</h3>
                <p>{s.blurb}</p>
                <span className="read-more">
                  {count ? `${count} resource${count === 1 ? '' : 's'} →` : 'Coming soon →'}
                </span>
              </Link>
            )
          })}
        </div>
      </div>
    </section>
  )
}
