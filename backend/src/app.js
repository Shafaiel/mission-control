import express from 'express'
import cors from 'cors'
import tasksRouter from './routes/tasks.js'
import messagesRouter from './routes/messages.js'
import chatRouter from './routes/chat.js'
import { readDb } from './storage.js'
import { ValidationError } from './taskService.js'

const app = express()

app.use(cors())
app.use(express.json())

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok' })
})

app.get('/api/agents', async (req, res) => {
  res.json((await readDb()).agents)
})

app.use('/api/tasks', tasksRouter)
app.use('/api/messages', messagesRouter)
app.use('/api/chat', chatRouter)

// Return JSON (not an HTML stack trace) for errors: validation problems keep their message,
// malformed JSON bodies get a generic 400, anything else is a 500.
app.use((err, req, res, next) => {
  if (err instanceof ValidationError) {
    return res.status(err.status).json({ error: err.message })
  }
  const status = err.status || 500
  const message = status === 400 ? 'Invalid JSON body' : 'Internal server error'
  res.status(status).json({ error: message })
})

export default app
