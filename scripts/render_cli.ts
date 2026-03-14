// scripts/render_cli.ts
import { readJson } from '../lib/files.js'
import type { ProcessedOutput } from '../lib/types.js'

const DIVIDER = '─'.repeat(55)
const MAX_URL = 60

function relativeTime(unix: number): string {
  const diffSec = Math.floor(Date.now() / 1000) - unix
  if (diffSec < 3600)  return `${Math.floor(diffSec / 60)}m ago`
  if (diffSec < 86400) return `${Math.floor(diffSec / 3600)}h ago`
  return `${Math.floor(diffSec / 86400)}d ago`
}

function truncate(str: string, max: number): string {
  return str.length > max ? str.slice(0, max - 1) + '…' : str
}

async function main() {
  const data = await readJson<ProcessedOutput>('data/processed/latest.json')
  const { meta, stories } = data

  console.log(DIVIDER)
  console.log(` HN Daily Signal · ${meta.date} · ${meta.final_count} stories`)
  console.log(DIVIDER)

  for (const s of stories) {
    const rank = String(s.rank).padStart(2)
    console.log(`\n ${rank}  ${s.title}`)
    const domain = s.domain ? ` · ${s.domain}` : ''
    console.log(`     ↑ ${s.score}  💬 ${s.comments}  by ${s.author}  · ${relativeTime(s.time)}${domain}`)
    if (s.url) console.log(`     ${truncate(s.url, MAX_URL)}`)
  }

  console.log(`\n${DIVIDER}`)
  const excl = meta.raw_count - meta.filtered_count
  console.log(` excluded: ${excl}  |  source: ${meta.source}`)
  console.log(DIVIDER)
}

main().catch(e => { console.error(e); process.exit(1) })
