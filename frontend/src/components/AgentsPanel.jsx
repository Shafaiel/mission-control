import { getAgents } from '../api'
import { useLoad } from '../hooks/useLoad'
import LoadState from './LoadState'
import './AgentsPanel.css'

function AgentsPanel() {
  const { data: agents, loading, error, retry } = useLoad(getAgents)

  return (
    <section className="panel">
      <h2 className="panel__title">Agents</h2>
      <LoadState loading={loading} error={error} what="agents" onRetry={retry} />
      {agents && (
        <ul className="agents-panel__list">
          {agents.map((name) => (
            <li key={name} className="agents-panel__item">
              <span className="agents-panel__dot" />
              {name}
              <span className="agents-panel__state">Available</span>
            </li>
          ))}
        </ul>
      )}
    </section>
  )
}

export default AgentsPanel
