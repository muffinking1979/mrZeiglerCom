import { Link } from 'react-router-dom'
import SectionHead from '../SectionHead'
import TransformationGame from '../tools/transformation-challenge/TransformationGame.jsx'
import { usePage } from '../usePage'

export default function TransformationChallengePage() {
  usePage('Transformation Challenge')
  return (
    <section className="section">
      <div className="container">
        <Link to="/tools" className="back-link">← All tools</Link>
        <SectionHead
          kicker="Tools"
          title="Transformation Challenge"
          sub="Predict where the triangle lands after a series of reflections and rotations, then press Check to watch it move. Get five in a row to earn a badge."
        />
        <TransformationGame />
      </div>
    </section>
  )
}
