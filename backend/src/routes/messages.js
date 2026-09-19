import { Router } from 'express'
import { readDb, writeDb, nextId } from '../storage.js'
import { ValidationError } from '../taskService.js'

const router = Router()

router.get('/', async (req, res) => {
  res.json((await readDb()).messages)
})

router.post('/', async (req, res) => {
  const { sender, text } = req.body ?? {}
  if (typeof text !== 'string' || !text.trim()) {
    throw new ValidationError('text is required')
  }

  const db = await readDb()
  const message = {
    id: nextId(db.messages),
    sender: sender || 'You',
    text: text.trim(),
  }
  db.messages.push(message)
  await writeDb(db)
  res.status(201).json(message)
})

export default router
