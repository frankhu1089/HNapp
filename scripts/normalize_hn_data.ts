// scripts/normalize_hn_data.ts
import { loadConfig } from '../lib/config.js'
import { readJson, writeWithLatest, todayStr } from '../lib/files.js'
import { normalizeItem } from '../lib/normalize.js'
import { isValidRaw } from '../lib/filters.js'
import { log, err } from '../lib/logger.js'
import type { RawOutput, NormalizedOutput } from '../lib/types.js'

async function main() {
  const cfg = await loadConfig()
  const today = todayStr()

  const raw = await readJson<RawOutput>(`data/raw/hn_raw_${today}.json`)
  log(`Loaded ${raw.items.length} raw items`)

  const validRaw = raw.items.filter(isValidRaw)
  log(`Valid: ${validRaw.length}  Invalid/non-story: ${raw.items.length - validRaw.length}`)

  const normalized = validRaw.map(normalizeItem)

  const output: NormalizedOutput = {
    date: today,
    source: cfg.source,
    items: normalized,
  }

  const outPath = await writeWithLatest('data/normalized', `hn_normalized_${today}.json`, output)
  log(`Written: ${outPath}  (+ latest.json)`)
  log(`Normalized: ${normalized.length} items`)
}

main().catch(e => { err(e); process.exit(1) })
