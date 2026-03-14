import type { RawHNItem } from './types.js'
import { warn } from './logger.js'

const BASE = 'https://hacker-news.firebaseio.com/v0'

async function fetchWithRetry(url: string, retries = 2): Promise<unknown> {
  let lastError: unknown
  for (let attempt = 0; attempt <= retries; attempt++) {
    try {
      const res = await fetch(url)
      if (!res.ok) throw new Error(`HTTP ${res.status} for ${url}`)
      return await res.json()
    } catch (e) {
      lastError = e
      if (attempt < retries) warn(`Retry ${attempt + 1}/${retries} for ${url}`)
    }
  }
  throw lastError
}

export async function fetchTopStoryIds(limit: number): Promise<number[]> {
  const ids = await fetchWithRetry(`${BASE}/topstories.json`) as number[]
  return ids.slice(0, limit)
}

export async function fetchItem(id: number): Promise<RawHNItem> {
  return await fetchWithRetry(`${BASE}/item/${id}.json`) as RawHNItem
}
