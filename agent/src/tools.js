// A tiny MCP-style tool server: tools are described with a name, description and JSON input
// schema, and are used through two JSON-RPC style methods, "tools/list" and "tools/call".

export const CATEGORIES = [
  {
    name: 'Bug',
    description: 'Something is broken or behaves incorrectly and needs fixing.',
    keywords: ['bug', 'fix', 'crash', 'error', 'broken', 'fails', 'failing', 'exception', 'wrong'],
  },
  {
    name: 'Feature',
    description: 'New functionality or an improvement users will notice.',
    keywords: ['add', 'new', 'feature', 'support', 'implement', 'create', 'toggle'],
  },
  {
    name: 'Documentation',
    description: 'Writing or updating docs, guides, READMEs or comments.',
    keywords: ['docs', 'documentation', 'readme', 'document', 'guide', 'comment'],
  },
  {
    name: 'Research',
    description: 'Investigating, comparing or evaluating options before deciding.',
    keywords: ['research', 'compare', 'investigate', 'evaluate', 'explore', 'study', 'analyze'],
  },
  {
    name: 'Maintenance',
    description: 'Upkeep with no user-visible change: refactoring, upgrades, cleanup.',
    keywords: ['refactor', 'upgrade', 'update', 'dependencies', 'cleanup', 'remove', 'rename'],
  },
  {
    name: 'Other',
    description: 'Anything that does not fit the categories above.',
    keywords: [],
  },
]

const tools = [
  {
    name: 'get_categories',
    description:
      'Returns the allowed task categories with a description and example keywords for each. ' +
      'Call this before classifying a task so you only use categories that exist.',
    inputSchema: { type: 'object', properties: {}, additionalProperties: false },
    handler: () => CATEGORIES,
  },
]

// Handle one MCP-style request and return an MCP-style result.
export function handleRequest({ method, params = {} }) {
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
      const result = tool.handler(params.arguments ?? {})
      return { isError: false, content: [{ type: 'text', text: JSON.stringify(result) }] }
    } catch (err) {
      return { isError: true, content: [{ type: 'text', text: err.message }] }
    }
  }

  return { isError: true, content: [{ type: 'text', text: `Unsupported method: ${method}` }] }
}
