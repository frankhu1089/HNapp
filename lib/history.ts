// lib/history.ts
import type { NormalizedItem, SeenHistory } from './types.js'

function daysDiff(from: string, to: string): number {
  const msPerDay = 86400000
  return Math.round((new Date(to).getTime() - new Date(from).getTime()) / msPerDay)
}

// Returns boolean[] — one per story — true if seen within windowDays
export function markSeenBefore(
  stories: NormalizedItem[],
  history: SeenHistory,
  today: string,
  windowDays: number
): boolean[] {
  return stories.map(s => {
    const lastSeen = history[String(s.id)]
    if (!lastSeen) return false
    return daysDiff(lastSeen, today) <= windowDays
  })
}

// Returns updated history with today's stories added and old entries pruned
export function updateHistory(
  stories: NormalizedItem[],
  history: SeenHistory,
  today: string,
  windowDays: number
): SeenHistory {
  const updated = { ...history }

  for (const s of stories) {
    updated[String(s.id)] = today
  }

  const pruneWindow = windowDays * 2
  for (const [id, date] of Object.entries(updated)) {
    if (daysDiff(date, today) > pruneWindow) {
      delete updated[id]
    }
  }

  return updated
}
