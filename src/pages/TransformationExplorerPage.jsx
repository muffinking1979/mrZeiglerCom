import { Link } from 'react-router-dom'
import SectionHead from '../SectionHead'
import TransformationExplorer from '../tools/transformation-explorer'
import { usePage } from '../usePage'

export default function TransformationExplorerPage() {
  usePage('Reflection / Rotation Explorer')
  return (
    <section className="section">
      <div className="container">
        <Link to="/tools" className="back-link">← All tools</Link>
        <SectionHead
          kicker="Tools"
          title="Reflection / Rotation Explorer"
          sub="Drag a shape around the coordinate plane and pick a rotation or reflection about the origin to see where its image lands and how the coordinates change."
        />
        <TransformationExplorer />
      </div>
    </section>
  )
}
