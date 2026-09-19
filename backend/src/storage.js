import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const dataDir = path.join(path.dirname(fileURLToPath(import.meta.url)), '..', 'data')
// Vercel functions have a read-only file system except /tmp (which is not shared or permanent).
const dbFile = process.env.VERCEL ? '/tmp/db.json' : path.join(dataDir, 'db.json')
const seedFile = path.join(dataDir, 'seed.json')

// Optional permanent storage: an Upstash Redis database (also what Vercel's Redis integration
// provides). When its REST URL and token are set, the whole database is kept under one key.
const REDIS_URL = process.env.UPSTASH_REDIS_REST_URL || process.env.KV_REST_API_URL
const REDIS_TOKEN = process.env.UPSTASH_REDIS_REST_TOKEN || process.env.KV_REST_API_TOKEN
const REDIS_KEY = 'mission-control-db'

const readSeed = () => JSON.parse(fs.readFileSync(seedFile, 'utf8'))

async function redis(command) {
  const response = await fetch(REDIS_URL, {
    method: 'POST',
    headers: { Authorization: `Bearer ${REDIS_TOKEN}`, 'Content-Type': 'application/json' },
    body: JSON.stringify(command),
  })
  const data = await response.json()
  if (!response.ok || data.error) throw new Error(data.error || 'Database request failed')
  return data.result
}

export async function readDb() {
  if (REDIS_URL) {
    const stored = await redis(['GET', REDIS_KEY])
    if (stored) return JSON.parse(stored)
    const seed = readSeed()
    await writeDb(seed)
    return seed
  }

  // First run: copy the seed data so the API has something to return.
  if (!fs.existsSync(dbFile)) {
    fs.copyFileSync(seedFile, dbFile)
  }
  return JSON.parse(fs.readFileSync(dbFile, 'utf8'))
}

export async function writeDb(db) {
  if (REDIS_URL) {
    await redis(['SET', REDIS_KEY, JSON.stringify(db)])
    return
  }
  fs.writeFileSync(dbFile, JSON.stringify(db, null, 2))
}

export function nextId(items) {
  return items.length ? Math.max(...items.map((item) => item.id)) + 1 : 1
}
