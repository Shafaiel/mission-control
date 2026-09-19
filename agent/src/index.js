import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { runAgent, MODEL } from './agent.js'

const root = path.join(path.dirname(fileURLToPath(import.meta.url)), '..')

if (!process.env.GROQ_API_KEY) {
  console.error('GROQ_API_KEY is not set. Copy .env.example to .env and add your key.')
  process.exit(1)
}

// Usage: npm start                      -> run all samples and write samples-output.md
//        npm start -- "Some task text"  -> categorize one piece of text
const single = process.argv.slice(2).join(' ').trim()
if (single) {
  console.log(await runAgent(single))
  process.exit(0)
}

const samples = JSON.parse(fs.readFileSync(path.join(root, 'samples.json'), 'utf8'))
const rows = []

for (const sample of samples) {
  try {
    const result = await runAgent(sample.text)
    rows.push({ ...sample, ...result })
    const mark = result.category === sample.expected ? 'OK  ' : 'MISS'
    console.log(`${mark} ${sample.text} -> ${result.category} (expected ${sample.expected})`)
  } catch (err) {
    rows.push({ ...sample, error: err.message })
    console.log(`ERR  ${sample.text} -> ${err.message}`)
  }
}

const correct = rows.filter((r) => r.category === r.expected).length
const lines = [
  '# Agent sample run',
  '',
  `Model: \`${rows.find((r) => r.model)?.model ?? MODEL}\` (Groq). Tool used: \`get_categories\` (MCP-style).`,
  `Result: ${correct} of ${rows.length} matched the expected category.`,
  '',
  '| Input | Expected | Agent answer | Match | Agent reason | Tool calls |',
  '|-------|----------|--------------|-------|--------------|------------|',
  ...rows.map((r) =>
    r.error
      ? `| ${r.text} | ${r.expected} | error | no | ${r.error} | |`
      : `| ${r.text} | ${r.expected} | ${r.category} | ${r.category === r.expected ? 'yes' : 'no'} | ${r.reason} | ${r.toolCalls.join(', ')} |`,
  ),
  '',
]
fs.writeFileSync(path.join(root, 'samples-output.md'), lines.join('\n'))
console.log(`\n${correct}/${rows.length} matched. Wrote samples-output.md`)
