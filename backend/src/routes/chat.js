import { Router } from 'express'
import { readDb, writeDb, nextId } from '../storage.js'
import { ValidationError } from '../taskService.js'
import { runChatAgent } from '../agent/chatAgent.js'

const router = Router()
const HISTORY_LIMIT = 10

async function addMessage(sender, text) {
  const db = await readDb()
  const message = { id: nextId(db.messages), sender, text }
  db.messages.push(message)
  await writeDb(db)
  return message
}

// POST /api/chat { text }: saves the user's message, lets the agent respond (and use its task
// tools), saves the reply, and returns both messages.
router.post('/', async (req, res) => {
  const text = req.body?.text
  if (typeof text !== 'string' || !text.trim()) {
    throw new ValidationError('text is required')
  }

  const userMessage = await addMessage('You', text.trim())

  // Recent conversation for context (the new message is the last one).
  const { messages } = await readDb()
  const history = messages.slice(-HISTORY_LIMIT).map((m) => ({
    role: m.sender === 'You' ? 'user' : 'assistant',
    content: m.text,
  }))

  try {
    const { reply, tasksChanged } = await runChatAgent(history)
    const agentMessage = await addMessage('Agent', reply)
    res.json({ messages: [userMessage, agentMessage], tasksChanged, failed: false })
  } catch (err) {
    // Keep the conversation consistent: show the problem in the chat instead of failing silently.
    const agentMessage = await addMessage(
      'Agent',
      `Sorry, I could not reach my AI model (${err.message}). Please try again in a moment.`,
    )
    res.json({ messages: [userMessage, agentMessage], tasksChanged: false, failed: true })
  }
})

export default router
