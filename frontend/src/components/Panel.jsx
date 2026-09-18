import './Panel.css'

function Panel({ title, description }) {
  return (
    <section className="panel">
      <h2 className="panel__title">{title}</h2>
      <p className="panel__placeholder">{description}</p>
    </section>
  )
}

export default Panel
