# Agent chat tests (Week 6)

Real run against the local backend with the Groq model `openai/gpt-oss-120b`. The frontend's own API client (`frontend/src/api.js`) drove the tests.

## Chat agent (POST /api/chat)

| # | User says | Result |
|---|-----------|--------|
| 1 | "Add a task to fix the login bug" | Task #5 "Fix login bug" created, category Bug; `tasksChanged: true` |
| 2 | "Please add a task to write the API documentation and give it to Scribe" | Task #6 created, category Documentation, agent Scribe |
| 3 | "What tasks do I have?" | Agent called `list_tasks` and listed all tasks |
| 4 | "Mark task 5 as done" | Status of #5 changed to Done |
| 5 | "Set task 999 to done" | Agent explained the task does not exist; `tasksChanged: false` |
| 6 | "Hello, what can you do?" | Answered without calling tools |
| 7 | "Add a task to research payment providers" | Task created, shown in the task list after the chat call |
| 8 | "Move the Scout task to done" (two Scout tasks exist) | Agent asked which one (ids 4 and 7) instead of guessing |

## UI actions (REST)

| Action | Result |
|--------|--------|
| Add task from the form (Unassigned / Scout) | 201, task saved with category Other |
| Add task with empty title | error "title is required" |
| Change status in the table | task updated |
| Change to an invalid status | error "status must be one of: Todo, In Progress, Done" |
| Change / delete a task that does not exist | error "Task N not found" (404) |
| Delete a task | task removed; deleting it again gives a 404 |
| Chat history after reloading | messages persisted |

## Issues found and fixed while testing

- Replies contained markdown (tables, bold) that the chat box does not render; the system prompt now asks for plain text.
- Tasks with no named agent were silently assigned to the first agent; they are now "Unassigned".
