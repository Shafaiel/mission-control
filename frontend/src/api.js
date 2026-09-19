const BASE_URL = import.meta.env?.VITE_API_URL ?? 'http://localhost:3001'

async function request(path, options) {
  let response
  try {
    response = await fetch(`${BASE_URL}${path}`, {
      headers: { 'Content-Type': 'application/json' },
      ...options,
    })
  } catch {
    throw new Error(`Cannot reach the server at ${BASE_URL}. Is the backend running? (npm run dev)`)
  }

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

export const updateTaskStatus = (id, status) =>
  request(`/api/tasks/${id}`, { method: 'PATCH', body: JSON.stringify({ status }) })

export const deleteTask = (id) => request(`/api/tasks/${id}`, { method: 'DELETE' })

// Sends a chat message to the agent. Resolves to { messages, tasksChanged, failed }.
export const sendChat = (text) =>
  request('/api/chat', { method: 'POST', body: JSON.stringify({ text }) })
