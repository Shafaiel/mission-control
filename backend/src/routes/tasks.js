import { Router } from 'express'
import { readDb, writeDb, nextId } from '../storage.js'

const router = Router()

router.get('/', (req, res) => {
  res.json(readDb().tasks)
})

router.post('/', (req, res) => {
  const { title, agent } = req.body ?? {}
  if (typeof title !== 'string' || !title.trim()) {
    return res.status(400).json({ error: 'title is required' })
  }

  const db = readDb()
  const task = {
    id: nextId(db.tasks),
    title: title.trim(),
    agent: agent || db.agents[0],
    status: 'Todo',
  }
  db.tasks.push(task)
  writeDb(db)
  res.status(201).json(task)
})

export default router
