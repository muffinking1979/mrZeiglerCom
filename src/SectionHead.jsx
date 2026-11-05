export default function SectionHead({ kicker, title, sub }) {
  return (
    <div className="section-head reveal">
      <span className="kicker">{kicker}</span>
      <h2>{title}</h2>
      {sub && <p>{sub}</p>}
    </div>
  )
}
