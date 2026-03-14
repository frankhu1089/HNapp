// scripts/filter_hn_data.ts
import { loadConfig } from '../lib/config.js'
import { readJson, writeJson, todayStr } from '../lib/files.js'
import { isBlocked, findBlockedKeyword } from '../lib/filters.js'
import { log, err } from '../lib/logger.js'
import type { NormalizedOutput, FilteredOutput, ExcludedItem, NormalizedItem } from '../lib/types.js'

async function main() {
  const cfg = await loadConfig()
  const today = todayStr()

  const normalized = await readJson<NormalizedOutput>(`data/normalized/hn_normalized_${today}.json`)
  log(`Loaded ${normalized.items.length} normalized items`)

  const kept: NormalizedItem[] = []
  const excluded: ExcludedItem[] = []

  for (const item of normalized.items) {
    if (isBlocked(item, cfg.blocked_keywords)) {
      const matched = findBlockedKeyword(item, cfg.blocked_keywords)
      excluded.push({ id: item.id, title: item.title, reason: `blocked_keyword: ${matched}` })
    } else {
      kept.push(item)
    }
  }

  log(`Kept: ${kept.length}  Blocked: ${excluded.length}`)

  const output: FilteredOutput = {
    date: today,
    source: cfg.sources.join('+'),
    raw_count: normalized.items.length,
    filtered_count: kept.length,
    items: kept,
  }

  const outPath = `data/processed/hn_filtered_${today}.json`
  await writeJson(outPath, output)
  log(`Written: ${outPath}`)

  if (excluded.length > 0) {
    const excPath = `data/processed/hn_excluded_${today}.json`
    await writeJson(excPath, excluded)
    log(`Exclusions written: ${excPath}`)
  }
}

main().catch(e => { err(e); process.exit(1) })
