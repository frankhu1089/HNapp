// lib/ranking.ts
import type { NormalizedItem } from './types.js'

interface Weights { score: number; descendants: number }

export function computeScore(item: NormalizedItem, weights: Weights): number {
  return (item.score * weights.score) + (item.comments * weights.descendants)
}

export function sortByImportance(items: NormalizedItem[], weights: Weights): NormalizedItem[] {
  return [...items].sort((a, b) => {
    const scoreDiff = computeScore(b, weights) - computeScore(a, weights)
    if (scoreDiff !== 0) return scoreDiff
    if (b.comments !== a.comments) return b.comments - a.comments
    if (b.score !== a.score) return b.score - a.score
    return b.time - a.time
  })
}
