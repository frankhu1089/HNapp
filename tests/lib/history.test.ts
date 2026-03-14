// tests/lib/history.test.ts
import { describe, it, expect } from 'vitest'
import { markSeenBefore, updateHistory } from '../../lib/history'
import type { NormalizedItem, SeenHistory } from '../../lib/types'

const item = (id: number): NormalizedItem => ({
  id, title: 'T', url: '', domain: '', author: '',
  score: 0, comments: 0, time: 0, text: '',
})

describe('markSeenBefore', () => {
  it('returns false for items not in history', () => {
    const result = markSeenBefore([item(123)], {}, '2026-03-15', 3)
    expect(result[0]).toBe(false)
  })

  it('returns true for item seen within window', () => {
    const history: SeenHistory = { '123': '2026-03-13' }  // 2 days ago
    const result = markSeenBefore([item(123)], history, '2026-03-15', 3)
    expect(result[0]).toBe(true)
  })

  it('returns true for item seen exactly on window boundary', () => {
    const history: SeenHistory = { '123': '2026-03-12' }  // exactly 3 days ago
    const result = markSeenBefore([item(123)], history, '2026-03-15', 3)
    expect(result[0]).toBe(true)
  })

  it('returns false for item seen beyond window', () => {
    const history: SeenHistory = { '123': '2026-03-10' }  // 5 days ago
    const result = markSeenBefore([item(123)], history, '2026-03-15', 3)
    expect(result[0]).toBe(false)
  })

  it('handles multiple items correctly', () => {
    const history: SeenHistory = { '1': '2026-03-14', '3': '2026-03-01' }
    const result = markSeenBefore([item(1), item(2), item(3)], history, '2026-03-15', 3)
    expect(result).toEqual([true, false, false])
  })
})

describe('updateHistory', () => {
  it('adds new story IDs with today date', () => {
    const updated = updateHistory([item(123), item(456)], {}, '2026-03-15', 3)
    expect(updated['123']).toBe('2026-03-15')
    expect(updated['456']).toBe('2026-03-15')
  })

  it('overwrites existing ID with today date', () => {
    const history: SeenHistory = { '123': '2026-03-13' }
    const updated = updateHistory([item(123)], history, '2026-03-15', 3)
    expect(updated['123']).toBe('2026-03-15')
  })

  it('prunes entries older than windowDays * 2', () => {
    const history: SeenHistory = {
      '999': '2026-03-01',  // 14 days ago, beyond prune window (3*2=6)
      '888': '2026-03-13',  // 2 days ago, within prune window
    }
    const updated = updateHistory([], history, '2026-03-15', 3)
    expect(updated['999']).toBeUndefined()
    expect(updated['888']).toBe('2026-03-13')
  })

  it('does not mutate input history', () => {
    const history: SeenHistory = { '123': '2026-03-14' }
    updateHistory([item(456)], history, '2026-03-15', 3)
    expect(history['456']).toBeUndefined()
  })
})
