// Groq hosts open models behind an OpenAI-compatible chat completions API (free tier available).
const API_URL = 'https://api.groq.com/openai/v1/chat/completions'
export const MODEL = process.env.AGENT_MODEL || 'openai/gpt-oss-120b'
const MAX_RETRIES = 2

export async function chat(body) {
  const apiKey = process.env.GROQ_API_KEY
  if (!apiKey) throw new Error('GROQ_API_KEY is not set on the server')

  for (let attempt = 0; ; attempt++) {
    const response = await fetch(API_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${apiKey}` },
      body: JSON.stringify({ model: MODEL, temperature: 0, ...body }),
    })

    if (response.status === 429 && attempt < MAX_RETRIES) {
      // Free tiers are rate limited: wait as long as the server asks (up to a few seconds).
      const wait = Math.min(Number(response.headers.get('retry-after')) || 2, 5)
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
