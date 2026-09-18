import './Sidebar.css'

function Sidebar({ title, items }) {
  return (
    <aside className="sidebar">
      <div className="sidebar__brand">{title}</div>
      <nav className="sidebar__nav">
        {items.map((item) => (
          <a key={item.label} href="#" className="sidebar__link">
            <span className="sidebar__icon">{item.icon}</span>
            {item.label}
          </a>
        ))}
      </nav>
    </aside>
  )
}

export default Sidebar
