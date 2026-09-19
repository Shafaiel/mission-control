import './TaskTable.css'

function TaskTable({ tasks }) {
  if (tasks.length === 0) {
    return <p className="task-table__empty">No tasks to show.</p>
  }

  return (
    <table className="task-table">
      <thead>
        <tr>
          <th>Task</th>
          <th>Agent</th>
          <th>Status</th>
        </tr>
      </thead>
      <tbody>
        {tasks.map((task) => (
          <tr key={task.id}>
            <td>{task.title}</td>
            <td>{task.agent}</td>
            <td>
              <span className={`task-table__badge task-table__badge--${task.status.replace(' ', '').toLowerCase()}`}>
                {task.status}
              </span>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  )
}

export default TaskTable
