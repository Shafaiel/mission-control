import { useState } from 'react'
import './TaskForm.css'

const UNASSIGNED = 'Unassigned'

function TaskForm({ agents, onAdd }) {
  const [title, setTitle] = useState('')
  const [agent, setAgent] = useState(UNASSIGNED)

  function handleSubmit(event) {
    event.preventDefault()
    if (!title.trim()) return
    onAdd({ title: title.trim(), agent })
    setTitle('')
  }

  return (
    <form className="task-form" onSubmit={handleSubmit}>
      <input
        className="task-form__input"
        type="text"
        placeholder="New task title"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
      />
      <select
        className="task-form__select"
        value={agent}
        onChange={(e) => setAgent(e.target.value)}
      >
        {[UNASSIGNED, ...agents].map((name) => (
          <option key={name} value={name}>
            {name}
          </option>
        ))}
      </select>
      <button className="task-form__button" type="submit">
        Add
      </button>
    </form>
  )
}

export default TaskForm
