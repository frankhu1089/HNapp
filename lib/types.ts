// lib/types.ts

export interface Config {
  source: string
  candidate_limit: number
  final_limit: number
  blocked_keywords: string[]
  ranking_weights: {
    score: number
    descendants: number
  }
}

// Exact HN API shape (fields optional — API is inconsistent)
export interface RawHNItem {
  id?: number
  type?: string
  title?: string
  text?: string
  url?: string
  by?: string
  time?: number
  score?: number
  descendants?: number
  kids?: number[]
  deleted?: boolean
  dead?: boolean
  fetched_at?: string
}

export interface RawOutput {
  date: string
  source: string
  candidate_limit: number
  fetched_at: string
  items: RawHNItem[]
  failed_ids: number[]
}

// Stable intermediate schema
export interface NormalizedItem {
  id: number
  title: string
  url: string
  domain: string
  author: string
  score: number
  comments: number
  time: number
  text: string
}

export interface NormalizedOutput {
  date: string
  source: string
  items: NormalizedItem[]
}

// After filtering — same shape, items are all valid
export interface FilteredOutput {
  date: string
  source: string
  raw_count: number
  filtered_count: number
  items: NormalizedItem[]
}

export interface ExcludedItem {
  id: number
  title: string
  reason: string
}

// Final ranked output
export interface RankedStory extends NormalizedItem {
  rank: number
  importance_score: number
  hn_link: string
}

export interface ProcessedOutput {
  meta: {
    date: string
    generated_at: string
    source: string
    raw_count: number
    filtered_count: number
    final_count: number
  }
  stories: RankedStory[]
}
