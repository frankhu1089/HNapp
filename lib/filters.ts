// lib/filters.ts
import type { RawHNItem, NormalizedItem } from './types.js'

export function isValidRaw(item: RawHNItem): boolean {
  if (item.type !== 'story')       return false
  if (item.deleted === true)       return false
  if (item.dead === true)          return false
  if (item.id == null)             return false
  if (!item.title?.trim())         return false
  if (item.time == null)           return false
  return true
}

export function isBlocked(item: NormalizedItem, keywords: string[]): boolean {
  const blob = [item.title, item.text, item.url]
    .filter(Boolean)
    .join(' ')
    .toLowerCase()

  return keywords.some(kw => blob.includes(kw.toLowerCase()))
}
