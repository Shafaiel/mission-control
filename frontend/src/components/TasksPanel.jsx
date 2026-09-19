import { useEffect, useState } from 'react'
import TaskTable from './TaskTable'
import TaskForm from './TaskForm'
import { getAgents, getTasks, createTask } from '../api'
import './TasksPanel.css'

function TasksPanel() {
  const [tasks, setTasks] = useState([])
  const [agents, setAgents] = useState([])
  const [showDone, setShowDone] = useState(true)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [saveError, setSaveError] = useState('')

  const [reloadKey, setReloadKey] = useState(0)

  useEffect(() => {
    let cancelled = false

    async function load() {
      try {
        const [loadedTasks, loadedAgents] = await Promise.all([getTasks(), getAgents()])
        if (cancelled) return
        setTasks(loadedTasks)
        setAgents(loadedAgents)
      } catch (err) {
        if (!cancelled) setError(err.message || 'Could not load tasks')
      } finally {
        if (!cancelled) setLoading(false)
      }
    }

    load()
    return () => {
      cancelled = true
    }
  }, [reloadKey])

  function retry() {
    setLoading(true)
    setError('')
    setReloadKey((key) => key + 1)
  }

  async function addTask(input) {
    setSaveError('')
    try {
      const created = await createTask(input)
      setTasks((current) => [...current, created])
    } catch (err) {
      setSaveError(err.message || 'Could not save the task')
    }
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

      {loading && <p className="panel__status">Loading tasks...</p>}

      {error && (
        <p className="panel__status panel__status--error">
          Could not load tasks: {error}
          <button className="panel__retry" onClick={retry}>
            Retry
          </button>
        </p>
      )}

      {!loading && !error && (
        <>
          <TaskForm agents={agents} onAdd={addTask} />
          {saveError && <p className="panel__status panel__status--error">{saveError}</p>}
          <TaskTable tasks={visibleTasks} />
        </>
      )}
    </section>
  )
}

export default TasksPanel
