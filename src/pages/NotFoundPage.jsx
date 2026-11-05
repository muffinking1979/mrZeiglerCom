import { Link } from 'react-router-dom'
import SectionHead from '../SectionHead'
import { usePage } from '../usePage'

export default function NotFoundPage() {
  usePage('Page not found')
  return (
    <section className="section">
      <div className="container">
        <SectionHead
          kicker="404"
          title="That page doesn’t exist"
          sub="The link may be old, or there might be a typo in the address."
        />
        <Link to="/" className="btn btn-primary">Back to home</Link>
      </div>
    </section>
  )
}
