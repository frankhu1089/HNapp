// tests/lib/filters.test.ts
import { describe, it, expect } from 'vitest'
import { isValidRaw, isBlocked } from '../../lib/filters'
import type { RawHNItem, NormalizedItem } from '../../lib/types'

describe('isValidRaw', () => {
  const valid: RawHNItem = {
    id: 1, type: 'story', title: 'Hello', time: 1000,
    deleted: false, dead: false,
  }

  it('accepts a valid story item', () => {
    expect(isValidRaw(valid)).toBe(true)
  })

  it('rejects non-story type', () => {
    expect(isValidRaw({ ...valid, type: 'job' })).toBe(false)
  })

  it('rejects deleted items', () => {
    expect(isValidRaw({ ...valid, deleted: true })).toBe(false)
  })

  it('rejects dead items', () => {
    expect(isValidRaw({ ...valid, dead: true })).toBe(false)
  })

  it('rejects missing id', () => {
    const { id: _, ...noId } = valid
    expect(isValidRaw(noId)).toBe(false)
  })

  it('rejects missing title', () => {
    expect(isValidRaw({ ...valid, title: '' })).toBe(false)
    const { title: _, ...noTitle } = valid
    expect(isValidRaw(noTitle)).toBe(false)
  })

  it('rejects missing time', () => {
    const { time: _, ...noTime } = valid
    expect(isValidRaw(noTime)).toBe(false)
  })
})

describe('isBlocked', () => {
  const keywords = ['openclawd', 'clawdbot', 'moltbot', '龍蝦']

  const clean: NormalizedItem = {
    id: 1, title: 'Clean Story', url: 'https://example.com',
    domain: 'example.com', author: 'user', score: 100,
    comments: 50, time: 1000, text: '',
  }

  it('returns false for clean item', () => {
    expect(isBlocked(clean, keywords)).toBe(false)
  })

  it('matches keyword in title (case-insensitive)', () => {
    expect(isBlocked({ ...clean, title: 'OpenClawd is great' }, keywords)).toBe(true)
  })

  it('matches keyword in url', () => {
    expect(isBlocked({ ...clean, url: 'https://clawdbot.com' }, keywords)).toBe(true)
  })

  it('matches keyword in text', () => {
    expect(isBlocked({ ...clean, text: 'built with MoltBot engine' }, keywords)).toBe(true)
  })

  it('matches Chinese keyword 龍蝦', () => {
    expect(isBlocked({ ...clean, title: '我愛龍蝦' }, keywords)).toBe(true)
  })

  it('matches keyword even when embedded in a longer word (substring match)', () => {
    expect(isBlocked({ ...clean, title: 'superclawdbotapp' }, keywords)).toBe(true)
  })
})
