// tests/lib/normalize.test.ts
import { describe, it, expect } from 'vitest'
import { normalizeItem, extractDomain } from '../../lib/normalize'
import type { RawHNItem } from '../../lib/types'

describe('extractDomain', () => {
  it('extracts hostname from a full URL', () => {
    expect(extractDomain('https://example.com/foo')).toBe('example.com')
  })

  it('strips www. prefix', () => {
    expect(extractDomain('https://www.nytimes.com/article')).toBe('nytimes.com')
  })

  it('returns empty string for missing URL', () => {
    expect(extractDomain(undefined)).toBe('')
    expect(extractDomain('')).toBe('')
  })

  it('returns empty string for invalid URL', () => {
    expect(extractDomain('not-a-url')).toBe('')
  })
})

describe('normalizeItem', () => {
  const raw: RawHNItem = {
    id: 123,
    type: 'story',
    title: 'Test Story',
    url: 'https://example.com/test',
    by: 'author1',
    time: 1710000000,
    score: 200,
    descendants: 80,
    text: '<p>some text</p>',
  }

  it('maps raw fields to stable schema', () => {
    const result = normalizeItem(raw)
    expect(result.id).toBe(123)
    expect(result.title).toBe('Test Story')
    expect(result.url).toBe('https://example.com/test')
    expect(result.domain).toBe('example.com')
    expect(result.author).toBe('author1')
    expect(result.score).toBe(200)
    expect(result.comments).toBe(80)
    expect(result.time).toBe(1710000000)
    expect(result.text).toBe('<p>some text</p>')
  })

  it('defaults missing optional fields safely', () => {
    const minimal: RawHNItem = { id: 1, title: 'Minimal', time: 1000 }
    const result = normalizeItem(minimal)
    expect(result.url).toBe('')
    expect(result.domain).toBe('')
    expect(result.author).toBe('')
    expect(result.score).toBe(0)
    expect(result.comments).toBe(0)
    expect(result.text).toBe('')
  })
})
