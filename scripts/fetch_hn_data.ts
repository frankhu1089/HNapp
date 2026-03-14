// scripts/fetch_hn_data.ts
import { fetchTopStoryIds, fetchItem } from '../lib/hn-api.js'
import { loadConfig } from '../lib/config.js'
import { writeJson, todayStr } from '../lib/files.js'
import { log, warn, err } from '../lib/logger.js'
import type { RawOutput, RawHNItem } from '../lib/types.js'

async function main() {
  const cfg = await loadConfig()
  log(`Fetching top ${cfg.candidate_limit} story IDs from ${cfg.source}`)

  const ids = await fetchTopStoryIds(cfg.candidate_limit)
  log(`Got ${ids.length} IDs`)

  const results = await Promise.allSettled(ids.map(id => fetchItem(id)))

  const items: RawHNItem[] = []
  const failedIds: number[] = []

  results.forEach((result, i) => {
    if (result.status === 'fulfilled' && result.value) {
      items.push({ ...result.value, fetched_at: new Date().toISOString() })
    } else {
      failedIds.push(ids[i])
      warn(`Failed to fetch item ${ids[i]}`)
    }
  })

  log(`Fetched: ${items.length}  Failed: ${failedIds.length}`)

  const today = todayStr()
  const output: RawOutput = {
    date: today,
    source: cfg.source,
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
