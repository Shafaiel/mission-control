import { useState } from 'react'
import { getMessages, createMessage } from '../api'
import { useLoad } from '../hooks/useLoad'
import LoadState from './LoadState'
import './ChatPanel.css'

function ChatPanel() {
  const { data: messages, setData: setMessages, loading, error, retry } = useLoad(getMessages)
  const [draft, setDraft] = useState('')
  const [sendError, setSendError] = useState('')

  async function handleSend(event) {
    event.preventDefault()
    if (!draft.trim()) return
    setSendError('')
    try {
      const created = await createMessage({ text: draft })
      setMessages((current) => [...current, created])
      setDraft('')
    } catch (err) {
      setSendError(err.message || 'Could not send the message')
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
          </ul>

          <form className="chat-panel__form" onSubmit={handleSend}>
            <input
              className="chat-panel__input"
              type="text"
              placeholder="Type a message"
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
            />
            <button className="chat-panel__send" type="submit">
              Send
            </button>
          </form>
          {sendError && <p className="panel__status panel__status--error">{sendError}</p>}
        </>
      )}
    </section>
  )
}

export default ChatPanel
