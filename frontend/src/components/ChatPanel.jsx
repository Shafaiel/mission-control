import './ChatPanel.css'

function ChatPanel({ messages }) {
  return (
    <section className="panel chat-panel">
      <h2 className="panel__title">Chat</h2>
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
    </section>
  )
}

export default ChatPanel
