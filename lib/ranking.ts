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

export function computeSignalLabel(
  item: NormalizedItem,
  weights: Weights
): 'high score' | 'high discussion' | 'trending' {
  const scoreContrib = item.score * weights.score
  const commentsContrib = item.comments * weights.descendants
  if (scoreContrib > commentsContrib * 3) return 'high score'
  if (commentsContrib > scoreContrib * 3) return 'high discussion'
  return 'trending'
}
