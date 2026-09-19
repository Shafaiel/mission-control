import { handleRequest, CATEGORIES } from './tools.js'

// Groq hosts open models behind an OpenAI-compatible chat completions API (free tier available).
const API_URL = 'https://api.groq.com/openai/v1/chat/completions'
export const MODEL = process.env.AGENT_MODEL || 'openai/gpt-oss-120b'
const MAX_STEPS = 6
const MAX_RETRIES = 2

const SYSTEM_PROMPT = `You classify short task descriptions for a project-management dashboard.
First call the get_categories tool to see the allowed categories.
Then reply with only a JSON object: {"category": "<name>", "reason": "<one short sentence>"}.
The category must be exactly one of the names returned by the tool.`

// Turn the MCP-style tool list into OpenAI-style function definitions.
function apiTools() {
  const { tools } = handleRequest({ method: 'tools/list' })
  return tools.map((t) => ({
    type: 'function',
    function: { name: t.name, description: t.description, parameters: t.inputSchema },
  }))
}

async function chat(body) {
  const apiKey = process.env.GROQ_API_KEY
  if (!apiKey) throw new Error('GROQ_API_KEY is not set')

  for (let attempt = 0; ; attempt++) {
    const response = await fetch(API_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${apiKey}` },
      body: JSON.stringify(body),
    })

    if (response.status === 429 && attempt < MAX_RETRIES) {
      // Free tiers are rate limited: wait as long as the server asks, then try again.
      const wait = Math.min(Number(response.headers.get('retry-after')) || 5, 30)
      await new Promise((resolve) => setTimeout(resolve, wait * 1000))
      continue
    }

    const data = await response.json().catch(() => ({}))
    if (!response.ok) {
      throw new Error(data.error?.message || `Model request failed (${response.status})`)
    }
    return data
  }
}

function parseAnswer(text) {
  const match = text.match(/\{[\s\S]*\}/)
  if (!match) throw new Error(`Agent did not return JSON: ${text.slice(0, 200)}`)
  const answer = JSON.parse(match[0])
  if (!CATEGORIES.some((c) => c.name === answer.category)) {
    throw new Error(`Agent returned an unknown category: ${answer.category}`)
  }
  return { category: answer.category, reason: String(answer.reason ?? '') }
}

// Runs the agent loop: the model decides when to call tools, we execute them and send the
// results back, until the model gives its final answer.
export async function runAgent(text) {
  const tools = apiTools()
  const messages = [
    { role: 'system', content: SYSTEM_PROMPT },
    { role: 'user', content: `Task: ${text}` },
  ]
  const toolCalls = []

  for (let step = 0; step < MAX_STEPS; step++) {
    const data = await chat({ model: MODEL, messages, tools, temperature: 0 })
    const choice = data.choices[0]
    const message = choice.message
    messages.push(message)

    if (choice.finish_reason === 'tool_calls' && message.tool_calls?.length) {
      for (const call of message.tool_calls) {
        toolCalls.push(call.function.name)
        let args = {}
        try {
          args = JSON.parse(call.function.arguments || '{}')
        } catch {
          // malformed arguments: call the tool with none and let it report any problem
        }
        const result = handleRequest({
          method: 'tools/call',
          params: { name: call.function.name, arguments: args },
        })
        messages.push({ role: 'tool', tool_call_id: call.id, content: result.content[0].text })
      }
      continue
    }

    if (choice.finish_reason === 'length') {
      throw new Error('The answer was cut off (length)')
    }

    return { ...parseAnswer(message.content ?? ''), toolCalls, model: data.model }
  }

  throw new Error(`Agent did not finish within ${MAX_STEPS} steps`)
}
