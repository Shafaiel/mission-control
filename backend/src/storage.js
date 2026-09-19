import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const dataDir = path.join(path.dirname(fileURLToPath(import.meta.url)), '..', 'data')
// Vercel functions have a read-only file system except /tmp (which is not shared or permanent).
const dbFile = process.env.VERCEL ? '/tmp/db.json' : path.join(dataDir, 'db.json')
const seedFile = path.join(dataDir, 'seed.json')

// First run: copy the seed data so the API has something to return.
if (!fs.existsSync(dbFile)) {
  fs.copyFileSync(seedFile, dbFile)
}

export function readDb() {
  return JSON.parse(fs.readFileSync(dbFile, 'utf8'))
}

export function writeDb(db) {
  fs.writeFileSync(dbFile, JSON.stringify(db, null, 2))
}

export function nextId(items) {
  return items.length ? Math.max(...items.map((item) => item.id)) + 1 : 1
}
