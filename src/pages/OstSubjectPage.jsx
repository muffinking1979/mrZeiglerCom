import { Link, useParams } from 'react-router-dom'
import SectionHead from '../SectionHead'
import { subjects } from '../ost/subjects'
import { usePage } from '../usePage'
import NotFoundPage from './NotFoundPage'

function ResourceCard({ resource }) {
  const body = (
    <>
      <h3>{resource.title}</h3>
      <p>{resource.description}</p>
      <span className="read-more">{resource.href ? 'Open ↗' : 'Open →'}</span>
    </>
  )
  return resource.href ? (
    <a className="card ost-resource" href={resource.href} target="_blank" rel="noreferrer">
      {body}
    </a>
  ) : (
    <Link className="card ost-resource" to={resource.to}>
      {body}
    </Link>
  )
}

function SubjectPage({ subject }) {
  usePage(`${subject.name} OST`)
  return (
    <section className="section">
      <div className="container">
        <Link to="/ost" className="back-link">← All OST resources</Link>
        <SectionHead kicker="OST Resources" title={`${subject.name} OST`} sub={subject.blurb} />
        {subject.resources.length ? (
          <div className="ost-resources reveal">
            {subject.resources.map((r) => (
              <ResourceCard key={r.title} resource={r} />
            ))}
          </div>
        ) : (
          <p className="ost-empty reveal">Resources are on the way. Check back soon.</p>
        )}
      </div>
    </section>
  )
}

export default function OstSubjectPage() {
  const subject = subjects[useParams().subject]
  // Keyed so switching subjects remounts the page (fresh title and fade-ins).
  return subject ? <SubjectPage key={subject.name} subject={subject} /> : <NotFoundPage />
}
