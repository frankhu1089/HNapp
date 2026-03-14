// lib/files.ts
import { readFile, writeFile, mkdir } from 'fs/promises'
import { resolve, dirname } from 'path'

export function todayStr(): string {
  return new Date().toISOString().slice(0, 10)
}

export async function writeJson(path: string, data: unknown): Promise<void> {
  await mkdir(dirname(resolve(path)), { recursive: true })
  await writeFile(resolve(path), JSON.stringify(data, null, 2), 'utf-8')
}

export async function readJson<T>(path: string): Promise<T> {
  const raw = await readFile(resolve(path), 'utf-8')
  return JSON.parse(raw) as T
}

// Write both a dated file and latest.json in the same directory
export async function writeWithLatest(dir: string, filename: string, data: unknown): Promise<string> {
  const dated = `${dir}/${filename}`
  const latest = `${dir}/latest.json`
  await writeJson(dated, data)
  await writeJson(latest, data)
  return dated
}
