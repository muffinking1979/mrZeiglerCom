import { Link } from 'react-router-dom'
import SectionHead from '../SectionHead'
import { tools } from '../tools/tools'
import { usePage } from '../usePage'

export default function ToolsPage() {
  usePage('Tools')
  return (
    <section className="section">
      <div className="container">
        <SectionHead
          kicker="Tools"
          title="Classroom tools"
          sub="Interactive tools for exploring math in class or at home."
        />
        <div className="tools-grid">
          {tools.map((t) => (
            <Link key={t.slug} to={`/tools/${t.slug}`} className="card tool-btn reveal">
              <span className="tool-icon" aria-hidden="true">{t.icon}</span>
              <h3>{t.name}</h3>
              <p>{t.blurb}</p>
            </Link>
          ))}
        </div>
      </div>
    </section>
  )
}
