import { useState } from 'react'
import TaskTable from './TaskTable'
import TaskForm from './TaskForm'
import LoadState from './LoadState'
import { getAgents, getTasks, createTask } from '../api'
import { useLoad } from '../hooks/useLoad'
import './TasksPanel.css'

function TasksPanel() {
  const tasksLoad = useLoad(getTasks)
  const agentsLoad = useLoad(getAgents)
  const [showDone, setShowDone] = useState(true)
  const [saveError, setSaveError] = useState('')

  const loading = tasksLoad.loading || agentsLoad.loading
  const error = tasksLoad.error || agentsLoad.error

  function retry() {
    if (tasksLoad.error) tasksLoad.retry()
    if (agentsLoad.error) agentsLoad.retry()
  }

  async function addTask(input) {
    setSaveError('')
    try {
      const created = await createTask(input)
      tasksLoad.setData((current) => [...current, created])
    } catch (err) {
      setSaveError(err.message || 'Could not save the task')
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
          {saveError && <p className="panel__status panel__status--error">{saveError}</p>}
          <TaskTable tasks={visibleTasks} />
        </>
      )}
    </section>
  )
}

export default TasksPanel
