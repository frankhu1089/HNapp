// scripts/rank_hn_data.ts
import { loadConfig } from '../lib/config.js'
import { readJson, writeWithLatest, todayStr } from '../lib/files.js'
import { computeScore, sortByImportance } from '../lib/ranking.js'
import { log, warn, err } from '../lib/logger.js'
import type { FilteredOutput, ProcessedOutput, RankedStory } from '../lib/types.js'

async function main() {
  const cfg = await loadConfig()
  const today = todayStr()

  const filtered = await readJson<FilteredOutput>(`data/processed/hn_filtered_${today}.json`)
  log(`Loaded ${filtered.items.length} filtered items`)

  const sorted = sortByImportance(filtered.items, cfg.ranking_weights)
  const top = sorted.slice(0, cfg.final_limit)

  if (top.length < 10) {
    warn(`Only ${top.length} valid stories — below minimum of 10`)
  }

  const stories: RankedStory[] = top.map((item, i) => ({
    ...item,
    rank: i + 1,
    importance_score: Math.round(computeScore(item, cfg.ranking_weights) * 100) / 100,
    hn_link: `https://news.ycombinator.com/item?id=${item.id}`,
  }))

  const output: ProcessedOutput = {
    meta: {
      date: today,
      generated_at: new Date().toISOString(),
      source: cfg.source,
      raw_count: filtered.raw_count,
      filtered_count: filtered.filtered_count,
      final_count: stories.length,
    },
    stories,
  }

  const outPath = await writeWithLatest('data/processed', `hn_daily_${today}.json`, output)
  log(`Written: ${outPath}  (+ latest.json)`)
  log(`Final stories: ${stories.length}`)
}

main().catch(e => { err(e); process.exit(1) })
