// lib/normalize.ts
import type { RawHNItem, NormalizedItem } from './types.js'

export function extractDomain(url: string | undefined): string {
  if (!url) return ''
  try {
    return new URL(url).hostname.replace(/^www\./, '')
  } catch {
    return ''
  }
}

export function normalizeItem(raw: RawHNItem): NormalizedItem {
  return {
    id:       raw.id ?? 0,
    title:    raw.title ?? '',
    url:      raw.url ?? '',
    domain:   extractDomain(raw.url),
    author:   raw.by ?? '',
    score:    raw.score ?? 0,
    comments: raw.descendants ?? 0,
    time:     raw.time ?? 0,
    text:     raw.text ?? '',
  }
}
