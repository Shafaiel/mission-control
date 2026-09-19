# Agent notes (Week 5)

## What it is

A small tool-calling agent that categorizes short task descriptions (Bug, Feature, Documentation, Research, Maintenance, Other).

- `src/agent.js`: the agent loop. It sends the task to an LLM (Groq, model `openai/gpt-oss-120b`, free tier), runs any tool the model asks for, sends the result back, and repeats until the model returns a JSON answer. The answer is validated (JSON shape and a known category).
- `src/tools.js`: an MCP-style tool server. Tools are described with a name, description and JSON input schema, and are used through `tools/list` and `tools/call` requests that return MCP-shaped results. It exposes one tool, `get_categories`.
- `src/index.js`: runs the samples in `samples.json` (or one text from the command line) and writes `samples-output.md`.

Run: `cd agent && npm start` (needs `GROQ_API_KEY` in `agent/.env`; see `.env.example`).

## Results (real run, see `samples-output.md`)

9 of 10 sample inputs matched the expected category. In every case the model called `get_categories` before answering, so the tool-calling flow worked as designed.

## Where it works well

- Clear signals in the text: "Fix crash..." (Bug), "Add a dark mode toggle..." (Feature), "Update the README..." (Documentation), "Compare three vector databases..." (Research).
- Non-software text and nonsense are sent to `Other` ("Order pizza...", "asdf") with a sensible reason.
- It handled two cases that a keyword matcher would likely get wrong: "Investigate why the API is slow" (Research) and "The docs page shows an error when it loads" (Bug, not Documentation).

## Where it makes mistakes

- "Refactor the task table so it can be filtered by agent" was labelled Maintenance, but the intent is a new filter users will see (I expected Feature). The word "refactor" pulled the answer towards Maintenance and the model treated the category description ("no user-visible change") literally. This kind of mixed request is genuinely ambiguous, so the expected label is debatable, but it shows the model leans on strong keywords.
- The model name has to be checked against what the API offers. My first choice (`llama-3.3-70b-versatile`) was not available to the key; the models list endpoint showed `openai/gpt-oss-120b`, which supports tool calling.

## Possible improvements

- Add short example tasks to each category description in the tool result, especially for mixed requests.
- Allow more than one category or a confidence score for ambiguous text.
- Free-tier rate limits apply, so the agent retries on HTTP 429.
