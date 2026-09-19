import { useEffect, useState } from 'react'

// Runs an async loader (must be a stable function) and tracks data, loading and error.
// Changing `refreshKey` reloads the data in the background without showing the loading state.
export function useLoad(loader, refreshKey = 0) {
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [reloadKey, setReloadKey] = useState(0)

  useEffect(() => {
    let cancelled = false

    async function run() {
      try {
        const result = await loader()
        if (!cancelled) setData(result)
      } catch (err) {
        if (!cancelled) setError(err.message || 'Could not load data')
      } finally {
        if (!cancelled) setLoading(false)
      }
    }

    run()
    return () => {
      cancelled = true
    }
  }, [loader, reloadKey, refreshKey])

  function retry() {
    setLoading(true)
    setError('')
    setReloadKey((key) => key + 1)
  }

  return { data, setData, loading, error, retry }
}
