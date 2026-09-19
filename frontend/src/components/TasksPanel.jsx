import { useState } from 'react'
import TaskTable from './TaskTable'
import TaskForm from './TaskForm'
import './TasksPanel.css'

function TasksPanel({ initialTasks, agents }) {
  const [tasks, setTasks] = useState(initialTasks)
  const [showDone, setShowDone] = useState(true)

  function addTask({ title, agent }) {
    const nextId = tasks.length ? Math.max(...tasks.map((t) => t.id)) + 1 : 1
    setTasks([...tasks, { id: nextId, title, agent, status: 'Todo' }])
  }

  const visibleTasks = showDone ? tasks : tasks.filter((t) => t.status !== 'Done')

  return (
    <section className="panel tasks-panel">
      <div className="tasks-panel__top">
        <h2 className="panel__title">Tasks</h2>
        <button className="tasks-panel__toggle" onClick={() => setShowDone(!showDone)}>
          {showDone ? 'Hide completed' : 'Show completed'}
        </button>
      </div>
      <TaskForm agents={agents} onAdd={addTask} />
      <TaskTable tasks={visibleTasks} />
    </section>
  )
}

export default TasksPanel
