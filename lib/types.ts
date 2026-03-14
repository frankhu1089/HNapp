// lib/types.ts

export interface Config {
  sources: string[]           // replaces source: string
  candidate_limit: number
  final_limit: number
  seen_window_days: number    // NEW
  blocked_keywords: string[]
  ranking_weights: {
    score: number
    descendants: number
  }
}

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

export interface RankedStory extends NormalizedItem {
  rank: number
  importance_score: number
  hn_link: string
  signal_label: 'high score' | 'high discussion' | 'trending'
  seen_before: boolean
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

// NEW: manifest of available dates for history navigation
export interface Manifest {
  dates: string[]   // sorted descending ["2026-03-15", "2026-03-14", ...]
  latest: string
}

// NEW: seen IDs history store
export interface SeenHistory {
  [id: string]: string   // id → last_seen_date "YYYY-MM-DD"
}
