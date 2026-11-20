import { Link } from 'react-router-dom'
import SectionHead from '../SectionHead'
import DilationExplorer from '../tools/dilation-explorer'
import { usePage } from '../usePage'

export default function DilationExplorerPage() {
  usePage('Dilation Explorer')
  return (
    <section className="section">
      <div className="container">
        <Link to="/tools" className="back-link">← All tools</Link>
        <SectionHead
          kicker="Tools"
          title="Dilation Explorer"
          sub="Drag a shape and the center of dilation around the coordinate plane, then type a scale factor to see the image grow, shrink, or flip and how the coordinates change."
        />
        <DilationExplorer />
      </div>
    </section>
  )
}
