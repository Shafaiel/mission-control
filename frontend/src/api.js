const BASE_URL = import.meta.env?.VITE_API_URL ?? 'http://localhost:3001'

async function request(path, options) {
  const response = await fetch(`${BASE_URL}${path}`, {
    headers: { 'Content-Type': 'application/json' },
    ...options,
  })

  if (!response.ok) {
    let message = `Request failed (${response.status})`
    try {
      const body = await response.json()
      if (body.error) message = body.error
    } catch {
      // response had no JSON body; keep the generic message
    }
    throw new Error(message)
  }

  return response.json()
}

export const getAgents = () => request('/api/agents')
export const getTasks = () => request('/api/tasks')
export const getMessages = () => request('/api/messages')

export const createTask = ({ title, agent }) =>
  request('/api/tasks', { method: 'POST', body: JSON.stringify({ title, agent }) })
