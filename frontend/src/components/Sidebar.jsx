import './Sidebar.css'

function Sidebar({ title, items, active, onSelect }) {
  return (
    <aside className="sidebar">
      <div className="sidebar__brand">{title}</div>
      <nav className="sidebar__nav">
        {items.map((item) => (
          <button
            key={item.id}
            type="button"
            className={`sidebar__link ${item.id === active ? 'sidebar__link--active' : ''}`}
            aria-current={item.id === active ? 'page' : undefined}
            onClick={() => onSelect(item.id)}
          >
            <span className="sidebar__icon">{item.icon}</span>
            {item.label}
          </button>
        ))}
      </nav>
    </aside>
  )
}

export default Sidebar
