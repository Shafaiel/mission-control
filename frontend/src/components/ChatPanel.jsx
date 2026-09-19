import { useEffect, useRef, useState } from 'react'
import { getMessages, sendChat } from '../api'
import { useLoad } from '../hooks/useLoad'
import LoadState from './LoadState'
import './ChatPanel.css'

// onTasksChanged is called when the agent has created or updated tasks.
function ChatPanel({ onTasksChanged }) {
  const { data: messages, setData: setMessages, loading, error, retry } = useLoad(getMessages)
  const [draft, setDraft] = useState('')
  const [sending, setSending] = useState(false)
  const [sendError, setSendError] = useState('')
  const endRef = useRef(null)

  // Keep the newest message in view.
  useEffect(() => {
    endRef.current?.scrollIntoView({ block: 'end' })
  }, [messages, sending])

  async function handleSend(event) {
    event.preventDefault()
    const text = draft.trim()
    if (!text || sending) return

    setSendError('')
    setSending(true)
    setDraft('')
    // Show the user's message right away while the agent works.
    setMessages((current) => [...current, { id: 'pending', sender: 'You', text }])

    try {
      const result = await sendChat(text)
      setMessages((current) => [...current.filter((m) => m.id !== 'pending'), ...result.messages])
      if (result.tasksChanged) onTasksChanged?.()
    } catch (err) {
      setMessages((current) => current.filter((m) => m.id !== 'pending'))
      setDraft(text)
      setSendError(err.message || 'Could not send the message')
    } finally {
      setSending(false)
    }
  }

  return (
    <section className="panel chat-panel">
      <h2 className="panel__title">Chat</h2>
      <LoadState loading={loading} error={error} what="messages" onRetry={retry} />

      {messages && (
        <>
          <ul className="chat-panel__list">
            {messages.map((message) => (
              <li
                key={message.id}
                className={`chat-panel__message ${message.sender === 'You' ? 'chat-panel__message--me' : ''}`}
              >
                <strong>{message.sender}</strong>
                <span>{message.text}</span>
              </li>
            ))}
            {sending && (
              <li className="chat-panel__message chat-panel__message--thinking">
                <strong>Agent</strong>
                <span>Thinking...</span>
              </li>
            )}
            <li ref={endRef} aria-hidden="true" />
          </ul>

          <form className="chat-panel__form" onSubmit={handleSend}>
            <input
              className="chat-panel__input"
              type="text"
              placeholder='Try: "Add a task to fix the login bug"'
              value={draft}
              disabled={sending}
              onChange={(e) => setDraft(e.target.value)}
            />
            <button className="chat-panel__send" type="submit" disabled={sending}>
              {sending ? '...' : 'Send'}
            </button>
          </form>
          {sendError && <p className="panel__status panel__status--error">{sendError}</p>}
        </>
      )}
    </section>
  )
}

export default ChatPanel
