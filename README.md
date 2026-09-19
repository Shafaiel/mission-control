# Mission Control

A dashboard for managing AI agents: chat with an agent, and manage a task list. The chat agent is a real LLM (Groq, free tier) that can **create tasks, list them and change their status** by calling tools. You can also add, edit and delete tasks yourself in the UI.

Built as a 6-week learning project (React, Express, and an introduction to agentic AI).

## How the parts fit together

```
 Browser (React, frontend/)
   |  fetch  (VITE_API_URL)
   v
 Express API (backend/)  ----------------------------->  Groq LLM API
   |  /api/tasks  /api/messages  /api/agents             (openai/gpt-oss-120b)
   |  /api/chat  -> chat agent loop  <-- tool calls -->  MCP-style tools:
   v                                                     list_tasks, get_categories,
 Storage: JSON file (local) or Upstash Redis (optional)  create_task, update_task_status
```

- **frontend/**: React + Vite dashboard. Sidebar views (Dashboard, Agents, Chat, Tasks). The Chat panel sends messages to `POST /api/chat`; when the agent changes tasks, the task table reloads. The task table has status dropdowns and delete buttons, plus an add-task form.
- **backend/**: Express API.
  - `src/taskService.js`: task logic and validation, shared by the REST routes and the agent's tools.
  - `src/agent/`: the chat agent. `llm.js` calls Groq, `tools.js` is an MCP-style tool server (`tools/list`, `tools/call`), `chatAgent.js` runs the loop (model asks for a tool, we run it, send the result back, repeat until a final answer).
  - `src/routes/`: `tasks`, `messages` and `chat` routes.
  - `src/storage.js`: JSON file storage, or Upstash Redis when its environment variables are set.
- **agent/**: the standalone Week 5 agent (categorizes text) with sample inputs and results (`agent/samples-output.md`, `agent/NOTES.md`).
- **docs/**: test notes for the endpoints, full-stack flow, deployment and the agent chat.

## Run it locally

Requirements: Node.js 20+.

1. Get a free Groq API key at https://console.groq.com/keys.
2. Create `backend/.env` (see `backend/.env.example`):
   ```
   GROQ_API_KEY=your-key-here
   ```
3. Install and start everything:
   ```
   npm run install:all
   npm run dev
   ```
   This starts the API on http://localhost:3001 and the site on http://localhost:5173.

Try in the chat: `Add a task to fix the login bug`, `What tasks do I have?`, `Mark task 5 as done`.

## API

| Method | Path | Purpose |
|--------|------|---------|
| GET | `/api/health` | health check |
| GET | `/api/agents` | list agent names |
| GET / POST | `/api/tasks` | list tasks / create `{title, agent?, category?}` |
| PATCH | `/api/tasks/:id` | change status `{status}` (Todo, In Progress, Done) |
| DELETE | `/api/tasks/:id` | delete a task |
| GET | `/api/messages` | chat history |
| POST | `/api/chat` | send `{text}`; the agent replies and may change tasks |

## Deployment (Vercel)

Frontend and backend are separate Vercel projects (see `docs/deployment.md`). The backend needs `GROQ_API_KEY` in its Vercel environment variables, and the frontend needs `VITE_API_URL` set to the backend URL.

Vercel functions cannot keep files, so without a database the backend stores data in temporary `/tmp` and it can reset. For permanent data set `UPSTASH_REDIS_REST_URL` and `UPSTASH_REDIS_REST_TOKEN` (a free Upstash Redis database) on the backend.

## Known limitations

- The agent is a free open model: it can misunderstand ambiguous requests (see `agent/NOTES.md`) and free tiers are rate limited.
- There are no user accounts; everyone using the same backend shares the same tasks and chat.
