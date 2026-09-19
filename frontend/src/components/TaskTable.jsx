import './TaskTable.css'

const STATUSES = ['Todo', 'In Progress', 'Done']

function statusClass(status) {
  return `task-table__status--${status.replace(' ', '').toLowerCase()}`
}

function TaskTable({ tasks, onStatusChange, onDelete }) {
  if (tasks.length === 0) {
    return <p className="task-table__empty">No tasks to show.</p>
  }

  return (
    <table className="task-table">
      <thead>
        <tr>
          <th>#</th>
          <th>Task</th>
          <th>Category</th>
          <th>Agent</th>
          <th>Status</th>
          <th></th>
        </tr>
      </thead>
      <tbody>
        {tasks.map((task) => (
          <tr key={task.id}>
            <td className="task-table__id">{task.id}</td>
            <td>{task.title}</td>
            <td>
              <span className="task-table__category">{task.category || '-'}</span>
            </td>
            <td>{task.agent}</td>
            <td>
              <select
                className={`task-table__status ${statusClass(task.status)}`}
                value={task.status}
                onChange={(e) => onStatusChange(task.id, e.target.value)}
                aria-label={`Status of task ${task.id}`}
              >
                {STATUSES.map((status) => (
                  <option key={status} value={status}>
                    {status}
                  </option>
                ))}
              </select>
            </td>
            <td>
              <button
                className="task-table__delete"
                onClick={() => onDelete(task.id)}
                aria-label={`Delete task ${task.id}`}
                title="Delete task"
              >
                Delete
              </button>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  )
}

export default TaskTable
