import express from 'express'
import cors from 'cors'
import tasksRouter from './routes/tasks.js'
import messagesRouter from './routes/messages.js'
import { readDb } from './storage.js'

const app = express()

app.use(cors())
app.use(express.json())

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok' })
})

app.get('/api/agents', (req, res) => {
  res.json(readDb().agents)
})

app.use('/api/tasks', tasksRouter)
app.use('/api/messages', messagesRouter)

// Return JSON (not an HTML stack trace) for bad requests such as malformed JSON bodies.
app.use((err, req, res, next) => {
  const status = err.status || 500
  const message = status === 400 ? 'Invalid JSON body' : 'Internal server error'
  res.status(status).json({ error: message })
})

export default app
