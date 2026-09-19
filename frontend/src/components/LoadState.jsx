function LoadState({ loading, error, what, onRetry }) {
  if (loading) {
    return <p className="panel__status">Loading {what}...</p>
  }

  if (error) {
    return (
      <p className="panel__status panel__status--error">
        Could not load {what}: {error}
        <button className="panel__retry" onClick={onRetry}>
          Retry
        </button>
      </p>
    )
  }

  return null
}

export default LoadState
