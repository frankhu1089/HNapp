// tests/lib/ranking.test.ts
import { describe, it, expect } from 'vitest'
import { computeScore, sortByImportance, computeSignalLabel } from '../../lib/ranking'
import type { NormalizedItem } from '../../lib/types'

const item = (overrides: Partial<NormalizedItem>): NormalizedItem => ({
  id: 1, title: 'T', url: '', domain: '', author: '',
  score: 0, comments: 0, time: 0, text: '',
  ...overrides,
})

describe('computeScore', () => {
  it('applies weighted formula', () => {
    const weights = { score: 0.6, descendants: 0.4 }
    // (100 * 0.6) + (50 * 0.4) = 60 + 20 = 80
    expect(computeScore(item({ score: 100, comments: 50 }), weights)).toBeCloseTo(80)
  })

  it('returns 0 for zero-value item', () => {
    expect(computeScore(item({}), { score: 0.6, descendants: 0.4 })).toBe(0)
  })
})

describe('sortByImportance', () => {
  const weights = { score: 0.6, descendants: 0.4 }

  it('sorts descending by importance_score', () => {
    const items = [
      item({ id: 1, score: 100, comments: 10 }),  // (60 + 4) = 64
      item({ id: 2, score: 200, comments: 50 }),  // (120 + 20) = 140
      item({ id: 3, score: 50,  comments: 5  }),  // (30 + 2) = 32
    ]
    const sorted = sortByImportance(items, weights)
    expect(sorted.map(i => i.id)).toEqual([2, 1, 3])
  })

  it('tie-breaks by comments descending', () => {
    // same importance_score: (100*0.6)+(0*0.4)=60 vs (0*0.6)+(150*0.4)=60
    const items = [
      item({ id: 1, score: 100, comments: 0  }),
      item({ id: 2, score: 0,   comments: 150 }),
    ]
    const sorted = sortByImportance(items, weights)
    expect(sorted[0].id).toBe(2)  // higher comments wins
  })

  it('tie-breaks by score if comments equal', () => {
    const items = [
      item({ id: 1, score: 10, comments: 50 }),
      item({ id: 2, score: 20, comments: 50 }),
    ]
    const sorted = sortByImportance(items, weights)
    expect(sorted[0].id).toBe(2)  // higher score wins
  })

  it('tie-breaks by time (newer wins) if score and comments equal', () => {
    const items = [
      item({ id: 1, score: 10, comments: 5, time: 1000 }),
      item({ id: 2, score: 10, comments: 5, time: 2000 }),
    ]
    const sorted = sortByImportance(items, weights)
    expect(sorted[0].id).toBe(2)  // newer wins
  })
})

describe('computeSignalLabel', () => {
  const weights = { score: 0.6, descendants: 0.4 }

  it('returns "high score" when score contribution > 2x comments contribution', () => {
    // score_contrib = 300 * 0.6 = 180, comments_contrib = 10 * 0.4 = 4
    // 180 > 4 * 2 → high score
    expect(computeSignalLabel(item({ score: 300, comments: 10 }), weights)).toBe('high score')
  })

  it('returns "high discussion" when comments contribution > 2x score contribution', () => {
    // score_contrib = 10 * 0.6 = 6, comments_contrib = 200 * 0.4 = 80
    // 80 > 6 * 2 → high discussion
    expect(computeSignalLabel(item({ score: 10, comments: 200 }), weights)).toBe('high discussion')
  })

  it('returns "trending" when contributions are balanced', () => {
    // score_contrib = 200 * 0.6 = 120, comments_contrib = 100 * 0.4 = 40
    // neither > 2x the other
    expect(computeSignalLabel(item({ score: 200, comments: 100 }), weights)).toBe('trending')
  })

  it('returns "trending" for zero-value item', () => {
    expect(computeSignalLabel(item({ score: 0, comments: 0 }), weights)).toBe('trending')
  })
})
