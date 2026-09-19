import { useEffect, useState } from 'react'
import { getMessages } from '../api'
import './ChatPanel.css'

function ChatPanel() {
  const [messages, setMessages] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const [reloadKey, setReloadKey] = useState(0)

  useEffect(() => {
    let cancelled = false

    async function load() {
      try {
        const loaded = await getMessages()
        if (!cancelled) setMessages(loaded)
      } catch (err) {
        if (!cancelled) setError(err.message || 'Could not load messages')
      } finally {
        if (!cancelled) setLoading(false)
      }
    }

    load()
    return () => {
      cancelled = true
    }
  }, [reloadKey])

  function retry() {
    setLoading(true)
    setError('')
    setReloadKey((key) => key + 1)
  }

  return (
    <section className="panel chat-panel">
      <h2 className="panel__title">Chat</h2>

      {loading && <p className="panel__status">Loading messages...</p>}

      {error && (
        <p className="panel__status panel__status--error">
          Could not load messages: {error}
          <button className="panel__retry" onClick={retry}>
            Retry
          </button>
        </p>
      )}

      {!loading && !error && (
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
      )}
    </section>
  )
}

export default ChatPanel
