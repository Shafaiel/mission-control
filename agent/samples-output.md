# Agent sample run

Model: `openai/gpt-oss-120b` (Groq). Tool used: `get_categories` (MCP-style).
Result: 9 of 10 matched the expected category.

| Input | Expected | Agent answer | Match | Agent reason | Tool calls |
|-------|----------|--------------|-------|--------------|------------|
| Fix crash when the login button is clicked twice | Bug | Bug | yes | The task describes fixing a crash, which is a broken behavior. | get_categories |
| Add a dark mode toggle to the dashboard | Feature | Feature | yes | Adding a dark mode toggle introduces new user-visible functionality. | get_categories |
| Update the README with setup instructions | Documentation | Documentation | yes | Updating the README is a documentation task. | get_categories |
| Compare three vector databases for agent memory | Research | Research | yes | The task involves comparing three vector databases, which is an evaluation activity. | get_categories |
| Upgrade dependencies and remove unused code | Maintenance | Maintenance | yes | Upgrading dependencies and removing unused code are upkeep tasks without user-visible changes. | get_categories |
| Order pizza for the team lunch | Other | Other | yes | Ordering pizza is not a software development task. | get_categories |
| Investigate why the API is slow | Research | Research | yes | The task involves investigating why the API is slow. | get_categories |
| The docs page shows an error when it loads | Bug | Bug | yes | The docs page is showing an error, indicating a malfunction that needs fixing. | get_categories |
| Refactor the task table so it can be filtered by agent | Feature | Maintenance | no | Refactoring the task table is an internal code improvement without user-visible changes. | get_categories |
| asdf | Other | Other | yes | The description 'asdf' does not match any specific category. | get_categories |
