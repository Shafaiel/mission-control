// MCP-style tool server for the chat agent. Tools are described with a name, description and
// JSON input schema and used through "tools/list" and "tools/call" requests.
import { readDb } from '../storage.js'
import {
  CATEGORIES,
  STATUSES,
  listTasks,
  createTask,
  setTaskStatus,
} from '../taskService.js'

async function buildTools() {
  const { agents } = await readDb()

  return [
    {
      name: 'list_tasks',
      description: 'List all tasks with their id, title, assigned agent, status and category.',
      inputSchema: { type: 'object', properties: {}, additionalProperties: false },
      mutates: false,
      handler: () => listTasks(),
    },
    {
      name: 'get_categories',
      description: 'List the allowed task categories with a description of each.',
      inputSchema: { type: 'object', properties: {}, additionalProperties: false },
      mutates: false,
      handler: () => CATEGORIES,
    },
    {
      name: 'create_task',
      description:
        'Create a new task. Choose the most fitting category. Assign an agent only if the user names one.',
      inputSchema: {
        type: 'object',
        properties: {
          title: { type: 'string', description: 'Short, clear task title' },
          category: { type: 'string', enum: CATEGORIES.map((c) => c.name) },
          agent: { type: 'string', enum: agents },
        },
        required: ['title', 'category'],
        additionalProperties: false,
      },
      mutates: true,
      handler: (args) => createTask(args),
    },
    {
      name: 'update_task_status',
      description: 'Change the status of an existing task, using its id from list_tasks.',
      inputSchema: {
        type: 'object',
        properties: {
          id: { type: 'integer', description: 'Task id' },
          status: { type: 'string', enum: STATUSES },
        },
        required: ['id', 'status'],
        additionalProperties: false,
      },
      mutates: true,
      handler: (args) => setTaskStatus(args.id, args.status),
    },
  ]
}

// Handle one MCP-style request. Returns an MCP-style result (plus `mutated` for our own use).
export async function handleRequest({ method, params = {} }) {
  const tools = await buildTools()

  if (method === 'tools/list') {
    return {
      tools: tools.map(({ name, description, inputSchema }) => ({ name, description, inputSchema })),
    }
  }

  if (method === 'tools/call') {
    const tool = tools.find((t) => t.name === params.name)
    if (!tool) {
      return { isError: true, content: [{ type: 'text', text: `Unknown tool: ${params.name}` }] }
    }
    try {
      const result = await tool.handler(params.arguments ?? {})
      return {
        isError: false,
        mutated: tool.mutates,
        content: [{ type: 'text', text: JSON.stringify(result) }],
      }
    } catch (err) {
      // Send validation problems back to the model so it can correct itself or explain.
      return { isError: true, content: [{ type: 'text', text: JSON.stringify({ error: err.message }) }] }
    }
  }

  return { isError: true, content: [{ type: 'text', text: `Unsupported method: ${method}` }] }
}
