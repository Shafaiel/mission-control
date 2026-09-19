# Deployment (Vercel)

| Part | Vercel project | Live URL |
|------|----------------|----------|
| Frontend (Vite + React) | `mission-control` | https://mission-control-sigma-ashen.vercel.app |
| Backend (Express API) | `mission-control-api` | https://mission-control-api-five.vercel.app |

## How it is set up

- **Backend:** the Express app lives in `backend/src/app.js` (no `listen`). `backend/api/index.js` exports it as a Vercel serverless function, and `backend/vercel.json` rewrites every path to that function. Locally, `backend/src/server.js` imports the same app and listens on port 3001.
- **Frontend:** built by Vercel with the default Vite settings. The API address comes from the `VITE_API_URL` environment variable (Production), set to the backend URL above.
- Deploy commands (from each folder): `npx vercel deploy --prod --yes`.

## Chat agent on Vercel (Week 6)

The backend project has `GROQ_API_KEY` set as a sensitive Production environment variable, so `POST /api/chat` works on the live site. `backend/vercel.json` gives the function up to 30 seconds (`maxDuration`) because an agent reply can need several model calls.

Live check after deploying: `POST /api/chat` with "Add a task to test the live deployment" created a task (category Maintenance) and `GET /api/tasks` went from 4 to 5 tasks. The deployed frontend bundle calls `/api/chat` and points at the live API URL.

## Limitation: storage is not permanent on Vercel

Vercel functions have a read-only file system, except `/tmp`, which is temporary and not shared between function instances. On Vercel the backend therefore copies `seed.json` to `/tmp/db.json` and stores changes there. Tasks and messages added on the live site can disappear when the function restarts. Locally, data is kept in `backend/data/db.json`. A hosted database would be needed for permanent storage in production.

## Problems met while deploying

- Vercel's read-only file system broke the JSON-file storage idea, so the storage path switches to `/tmp` when running on Vercel.
- The first `VITE_API_URL` value was saved with an invisible BOM character at the start (PowerShell adds it when piping text), so the built site would have called a broken URL. Found by inspecting the deployed JavaScript bundle; fixed by re-adding the variable with `vercel env add ... --value` and redeploying.

## Checks on the live deployment

- `GET /api/health`, `/api/agents`, `/api/tasks`, `/api/messages` return 200 with data.
- `POST /api/tasks` returns 201 with the new task.
- The deployed frontend bundle contains the live API URL (no `localhost`, no BOM).
- CORS header `Access-Control-Allow-Origin: *` is returned.
