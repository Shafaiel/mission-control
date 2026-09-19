import { readDb, writeDb, nextId } from './storage.js'

export const STATUSES = ['Todo', 'In Progress', 'Done']
export const UNASSIGNED = 'Unassigned'

export const CATEGORIES = [
  { name: 'Bug', description: 'Something is broken or behaves incorrectly and needs fixing.' },
  { name: 'Feature', description: 'New functionality or an improvement users will notice.' },
  { name: 'Documentation', description: 'Writing or updating docs, guides, READMEs or comments.' },
  { name: 'Research', description: 'Investigating, comparing or evaluating options before deciding.' },
  { name: 'Maintenance', description: 'Upkeep with no user-visible change: refactoring, upgrades, cleanup.' },
  { name: 'Other', description: 'Anything that does not fit the categories above.' },
]

// An error whose message is safe to show to API clients.
export class ValidationError extends Error {
  constructor(message, status = 400) {
    super(message)
    this.status = status
  }
}

export async function listTasks() {
  return (await readDb()).tasks
}

export async function createTask({ title, agent, category }) {
  if (typeof title !== 'string' || !title.trim()) {
    throw new ValidationError('title is required')
  }

  const db = await readDb()
  if (agent && agent !== UNASSIGNED && !db.agents.includes(agent)) {
    throw new ValidationError(`Unknown agent "${agent}". Use one of: ${db.agents.join(', ')}`)
  }
  if (category && !CATEGORIES.some((c) => c.name === category)) {
    throw new ValidationError(`Unknown category "${category}"`)
  }

  const task = {
    id: nextId(db.tasks),
    title: title.trim(),
    agent: agent || UNASSIGNED,
    status: 'Todo',
    category: category || 'Other',
  }
  db.tasks.push(task)
  await writeDb(db)
  return task
}

export async function setTaskStatus(id, status) {
  if (!STATUSES.includes(status)) {
    throw new ValidationError(`status must be one of: ${STATUSES.join(', ')}`)
  }

  const db = await readDb()
  const task = db.tasks.find((t) => t.id === Number(id))
  if (!task) throw new ValidationError(`Task ${id} not found`, 404)

  task.status = status
  await writeDb(db)
  return task
}

export async function deleteTask(id) {
  const db = await readDb()
  const index = db.tasks.findIndex((t) => t.id === Number(id))
  if (index === -1) throw new ValidationError(`Task ${id} not found`, 404)

  const [removed] = db.tasks.splice(index, 1)
  await writeDb(db)
  return removed
}
