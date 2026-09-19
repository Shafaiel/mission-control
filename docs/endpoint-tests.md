# Backend endpoint tests (Week 3)

Server: `cd backend && npm start` (listens on http://localhost:3001).
Storage: JSON file `backend/data/db.json`, created from `backend/data/seed.json` on first run.

Tested manually with `curl` from PowerShell (Postman was not used). Each POST body was sent from a file with `Content-Type: application/json`.

| # | Request | Expected | Actual |
|---|---------|----------|--------|
| 1 | `GET /api/health` | 200, `{"status":"ok"}` | 200, `{"status":"ok"}` |
| 2 | `GET /api/agents` | 200, list of agent names | 200, `["Scribe","Sorter","Scout"]` |
| 3 | `GET /api/tasks` | 200, list of tasks | 200, 4 seed tasks |
| 4 | `POST /api/tasks` `{"title":"Test the API","agent":"Scout"}` | 201, new task with next id, status `Todo` | 201, `{"id":5,"title":"Test the API","agent":"Scout","status":"Todo"}` |
| 5 | `POST /api/tasks` `{"title":""}` | 400 with error | 400, `{"error":"title is required"}` |
| 6 | `POST /api/tasks` with malformed JSON | 400 JSON error | 400, `{"error":"Invalid JSON body"}` |
| 7 | `GET /api/messages` | 200, list of messages | 200, 3 seed messages |
| 8 | `POST /api/messages` `{"text":"Hello from the API"}` | 201, new message, sender defaults to `You` | 201, `{"id":4,"sender":"You","text":"Hello from the API"}` |
| 9 | `GET /api/tasks` and `GET /api/messages` after the POSTs | new records are returned | new records returned (task id 5, message id 4) |
| 10 | Restart the server, `GET /api/tasks` | data is still there | 5 tasks returned, so data persisted in the JSON file |

## Issues found while testing

- Malformed JSON originally returned an HTML page containing a server stack trace. Fixed by adding an error-handling middleware in `backend/src/server.js` that returns `{"error":"Invalid JSON body"}` with status 400.
- My first test run sent broken JSON because PowerShell mangled the quotes in inline `curl` bodies. Sending the body from a file fixed the test, and the server was not at fault.
