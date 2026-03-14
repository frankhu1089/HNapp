// lib/config.ts
import { readFile } from 'fs/promises'
import { resolve } from 'path'
import type { Config } from './types.js'

export async function loadConfig(path = 'config/hn.config.json'): Promise<Config> {
  const raw = await readFile(resolve(path), 'utf-8')
  const cfg = JSON.parse(raw) as Config

  const required = ['source', 'candidate_limit', 'final_limit', 'blocked_keywords', 'ranking_weights'] as const
  for (const key of required) {
    if (cfg[key] == null) throw new Error(`Config missing required field: ${key}`)
  }

  if (typeof cfg.ranking_weights?.score !== 'number' || typeof cfg.ranking_weights?.descendants !== 'number') {
    throw new Error('Config ranking_weights must have numeric score and descendants fields')
  }

  return cfg
}
