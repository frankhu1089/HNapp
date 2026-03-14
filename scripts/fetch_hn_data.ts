// scripts/fetch_hn_data.ts
import { fetchStoryIds, fetchItem } from '../lib/hn-api.js'
import { loadConfig } from '../lib/config.js'
import { writeJson, todayStr } from '../lib/files.js'
import { log, warn, err } from '../lib/logger.js'
import type { RawOutput, RawHNItem } from '../lib/types.js'

async function main() {
  const cfg = await loadConfig()
  log(`Sources: ${cfg.sources.join(', ')}  limit: ${cfg.candidate_limit}`)

  // Fetch IDs from all sources concurrently, deduplicate
  const allIdArrays = await Promise.all(
    cfg.sources.map(source => fetchStoryIds(source, cfg.candidate_limit))
  )
  const merged = [...new Set(allIdArrays.flat())].slice(0, cfg.candidate_limit)
  log(`Merged unique IDs: ${merged.length}`)

  const results = await Promise.allSettled(merged.map(id => fetchItem(id)))

  const items: RawHNItem[] = []
  const failedIds: number[] = []

  results.forEach((result, i) => {
    if (result.status === 'fulfilled' && result.value) {
      items.push({ ...result.value, fetched_at: new Date().toISOString() })
    } else {
      failedIds.push(merged[i])
      warn(`Failed to fetch item ${merged[i]}`)
    }
  })

  log(`Fetched: ${items.length}  Failed: ${failedIds.length}`)

  const today = todayStr()
  const output: RawOutput = {
    date: today,
    source: cfg.sources.join('+'),
    candidate_limit: cfg.candidate_limit,
    fetched_at: new Date().toISOString(),
    items,
    failed_ids: failedIds,
  }

  const outPath = `data/raw/hn_raw_${today}.json`
  await writeJson(outPath, output)
  log(`Written: ${outPath}`)
}

main().catch(e => { err(e); process.exit(1) })
