import { Router } from 'express'
import { readDb, writeDb, nextId } from '../storage.js'

const router = Router()

router.get('/', (req, res) => {
  res.json(readDb().messages)
})

router.post('/', (req, res) => {
  const { sender, text } = req.body ?? {}
  if (typeof text !== 'string' || !text.trim()) {
    return res.status(400).json({ error: 'text is required' })
  }

  const db = readDb()
  const message = {
    id: nextId(db.messages),
    sender: sender || 'You',
    text: text.trim(),
  }
  db.messages.push(message)
  writeDb(db)
  res.status(201).json(message)
})

export default router
