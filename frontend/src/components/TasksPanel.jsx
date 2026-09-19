import { useState } from 'react'
import TaskTable from './TaskTable'
import TaskForm from './TaskForm'
import LoadState from './LoadState'
import { getAgents, getTasks, createTask, updateTaskStatus, deleteTask } from '../api'
import { useLoad } from '../hooks/useLoad'
import './TasksPanel.css'

// refreshKey changes when something else (the chat agent) has changed the tasks.
function TasksPanel({ refreshKey }) {
  const tasksLoad = useLoad(getTasks, refreshKey)
  const agentsLoad = useLoad(getAgents)
  const [showDone, setShowDone] = useState(true)
  const [actionError, setActionError] = useState('')

  const loading = tasksLoad.loading || agentsLoad.loading
  const error = tasksLoad.error || agentsLoad.error

  function retry() {
    if (tasksLoad.error) tasksLoad.retry()
    if (agentsLoad.error) agentsLoad.retry()
  }

  async function addTask(input) {
    setActionError('')
    try {
      const created = await createTask(input)
      tasksLoad.setData((current) => [...current, created])
    } catch (err) {
      setActionError(err.message || 'Could not save the task')
    }
  }

  async function changeStatus(id, status) {
    setActionError('')
    try {
      const updated = await updateTaskStatus(id, status)
      tasksLoad.setData((current) => current.map((t) => (t.id === id ? updated : t)))
    } catch (err) {
      setActionError(err.message || 'Could not update the task')
    }
  }

  async function removeTask(id) {
    setActionError('')
    try {
      await deleteTask(id)
      tasksLoad.setData((current) => current.filter((t) => t.id !== id))
    } catch (err) {
      setActionError(err.message || 'Could not delete the task')
    }
  }

  const ready = tasksLoad.data && agentsLoad.data
  const visibleTasks = ready
    ? showDone
      ? tasksLoad.data
      : tasksLoad.data.filter((t) => t.status !== 'Done')
    : []

  return (
    <section className="panel tasks-panel">
      <div className="tasks-panel__top">
        <h2 className="panel__title">Tasks</h2>
        <button className="tasks-panel__toggle" onClick={() => setShowDone(!showDone)}>
          {showDone ? 'Hide completed' : 'Show completed'}
        </button>
      </div>

      <LoadState loading={loading} error={error} what="tasks" onRetry={retry} />

      {ready && (
        <>
          <TaskForm agents={agentsLoad.data} onAdd={addTask} />
          {actionError && <p className="panel__status panel__status--error">{actionError}</p>}
          <TaskTable tasks={visibleTasks} onStatusChange={changeStatus} onDelete={removeTask} />
        </>
      )}
    </section>
  )
}

export default TasksPanel
