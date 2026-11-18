import { Link } from 'react-router-dom'
import SectionHead from '../SectionHead'
import TransformationMaker from '../tools/transformation-maker'
import { usePage } from '../usePage'

export default function TransformationMakerPage() {
  usePage('Transformation Maker')
  return (
    <section className="section">
      <div className="container">
        <Link to="/tools" className="back-link">← All tools</Link>
        <SectionHead
          kicker="Tools"
          title="Transformation Maker"
          sub="Enter the vertices of a shape and a coordinate rule to see the shape and its image."
        />
        <TransformationMaker />
      </div>
    </section>
  )
}
