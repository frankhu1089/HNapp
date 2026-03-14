// scripts/rank_hn_data.ts
import { loadConfig } from '../lib/config.js'
import { readJson, writeJson, writeWithLatest, todayStr } from '../lib/files.js'
import { computeScore, sortByImportance, computeSignalLabel } from '../lib/ranking.js'
import { markSeenBefore, updateHistory } from '../lib/history.js'
import { log, warn, err } from '../lib/logger.js'
import type { FilteredOutput, ProcessedOutput, RankedStory, SeenHistory, Manifest } from '../lib/types.js'

async function loadOrCreate<T>(path: string, fallback: T): Promise<T> {
  try {
    return await readJson<T>(path)
  } catch {
    return fallback
  }
}

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

  // Seen-before detection
  const history = await loadOrCreate<SeenHistory>('data/history/seen_ids.json', {})
  const seenFlags = markSeenBefore(top, history, today, cfg.seen_window_days)

  const stories: RankedStory[] = top.map((item, i) => ({
    ...item,
    rank: i + 1,
    importance_score: Math.round(computeScore(item, cfg.ranking_weights) * 100) / 100,
    hn_link: `https://news.ycombinator.com/item?id=${item.id}`,
    signal_label: computeSignalLabel(item, cfg.ranking_weights),
    seen_before: seenFlags[i],
  }))

  // Update history
  const updatedHistory = updateHistory(top, history, today, cfg.seen_window_days)
  await writeJson('data/history/seen_ids.json', updatedHistory)
  log(`History updated: ${Object.keys(updatedHistory).length} entries`)

  // Update manifest
  const manifest = await loadOrCreate<Manifest>(
    'data/processed/manifest.json',
    { dates: [], latest: '' }
  )
  if (!manifest.dates.includes(today)) {
    manifest.dates.push(today)
    manifest.dates.sort((a, b) => b.localeCompare(a))
  }
  manifest.latest = manifest.dates[0]
  await writeJson('data/processed/manifest.json', manifest)
  log(`Manifest updated: ${manifest.dates.length} dates`)

  const output: ProcessedOutput = {
    meta: {
      date: today,
      generated_at: new Date().toISOString(),
      source: cfg.sources.join('+'),
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
