import { chat } from './llm.js'
import { handleRequest } from './tools.js'
import { readDb } from '../storage.js'

const MAX_STEPS = 6

async function systemPrompt() {
  const { agents } = await readDb()
  return `You are the assistant inside "Mission Control", a dashboard where users manage agents, chat and tasks.
You can manage tasks with your tools: list_tasks, get_categories, create_task and update_task_status.
- When the user asks to add or create a task, call create_task with a clear title and the best category. Use an agent only if the user names one of: ${agents.join(', ')}.
- When the user asks to change a task's status, call list_tasks if you need the id, then update_task_status.
- Never say you added or changed something unless the tool call succeeded. If a tool returns an error, explain it briefly.
- After using tools, reply in 1-3 friendly sentences that say what you did (include task ids). For general questions, answer briefly.
- Reply in plain text only: no markdown, no tables, no bold or asterisks. When listing tasks, write one per line like "#3 Draft release notes - Todo - Scribe - Documentation".`
}

// Turn the MCP-style tool list into OpenAI-style function definitions.
async function apiTools() {
  const { tools } = await handleRequest({ method: 'tools/list' })
  return tools.map((t) => ({
    type: 'function',
    function: { name: t.name, description: t.description, parameters: t.inputSchema },
  }))
}

// history: [{ role: 'user' | 'assistant', content }] ending with the new user message.
// Returns { reply, tasksChanged }.
export async function runChatAgent(history) {
  const tools = await apiTools()
  const messages = [{ role: 'system', content: await systemPrompt() }, ...history]
  let tasksChanged = false

  for (let step = 0; step < MAX_STEPS; step++) {
    const data = await chat({ messages, tools })
    const choice = data.choices[0]
    const message = choice.message

    if (choice.finish_reason === 'tool_calls' && message.tool_calls?.length) {
      messages.push({
        role: 'assistant',
        content: message.content ?? '',
        tool_calls: message.tool_calls,
      })

      for (const call of message.tool_calls) {
        let args = {}
        try {
          args = JSON.parse(call.function.arguments || '{}')
        } catch {
          // malformed arguments: call the tool with none; validation will explain what is missing
        }
        const result = await handleRequest({
          method: 'tools/call',
          params: { name: call.function.name, arguments: args },
        })
        if (result.mutated && !result.isError) tasksChanged = true
        messages.push({ role: 'tool', tool_call_id: call.id, content: result.content[0].text })
      }
      continue
    }

    if (choice.finish_reason === 'length') {
      throw new Error('The answer was cut off')
    }

    return { reply: (message.content ?? '').trim() || 'Done.', tasksChanged }
  }

  throw new Error('The agent did not finish in time')
}
