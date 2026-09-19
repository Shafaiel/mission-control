# Full-stack integration tests (Week 4)

Run both parts locally:

```
cd backend  && npm start      # http://localhost:3001
cd frontend && npm run dev    # http://localhost:5173
```

The frontend reads the API address from `VITE_API_URL` (see `frontend/.env.example`; defaults to `http://localhost:3001`).

## What changed

- `frontend/src/api.js`: one place for all `fetch` calls (`getAgents`, `getTasks`, `getMessages`, `createTask`). Non-2xx responses become `Error`s carrying the server's `error` message.
- `TasksPanel` and `ChatPanel` load data from the API instead of mock data, and show three states: loading, error (with a Retry button), and loaded.
- `TaskForm` submits to `POST /api/tasks`; the new task returned by the server is added to the table. Save errors are shown under the form.
- Mock data module removed.

## Checks

The frontend's real `api.js` was run in Node against the running backend.

| # | Scenario | Expected | Actual |
|---|----------|----------|--------|
| 1 | Backend stopped, call `getAgents/getTasks/getMessages` | request fails with an error (UI shows "Could not load ..." and Retry) | `fetch failed` for all three |
| 2 | Backend running, `getAgents` | list of agents | `["Scribe","Sorter","Scout"]` |
| 3 | `getTasks` | list of tasks | 4 seed tasks |
| 4 | `getMessages` | list of messages | 3 seed messages |
| 5 | `createTask({title:"End-to-end check", agent:"Scout"})` | saved task returned | `{"id":5,"title":"End-to-end check","agent":"Scout","status":"Todo"}` |
| 6 | `createTask({title:""})` | server validation message surfaced | `title is required` |
| 7 | `getTasks` after step 5 | includes the new task | new task present |
| 8 | Response header for `Origin: http://localhost:5173` | CORS allowed | `Access-Control-Allow-Origin: *` |

`npm run build` and `npm run lint` pass for the frontend.

## Issue found

Lint flagged calling `setState` synchronously inside a `useEffect` (`react(set-state-in-effect)`). The loaders were restructured so the effect only sets state after the awaited fetch, and the Retry button triggers a reload through a click handler and a `reloadKey`.
