// scripts/notify_telegram.ts
import { readJson } from '../lib/files.js'
import { log, warn, err } from '../lib/logger.js'
import type { ProcessedOutput } from '../lib/types.js'

// Escape special characters per Telegram MarkdownV2 spec
function escapeMd(str: string): string {
  return String(str ?? '').replace(/[_*[\]()~`>#+=|{}.!\\-]/g, '\\$&')
}

function formatDayName(dateStr: string): string {
  const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
  return days[new Date(dateStr + 'T00:00:00').getDay()]
}

async function main() {
  const token    = process.env.TELEGRAM_BOT_TOKEN
  const chatId   = process.env.TELEGRAM_CHAT_ID
  const pagesUrl = process.env.PAGES_URL

  if (!token || !chatId || !pagesUrl) {
    warn('Missing TELEGRAM_BOT_TOKEN, TELEGRAM_CHAT_ID, or PAGES_URL — skipping notification')
    process.exit(0)
  }

  const data = await readJson<ProcessedOutput>('data/processed/latest.json')
  const { meta, stories } = data
  const top5 = stories.slice(0, 5)

  const dayName = formatDayName(meta.date)
  const dateEsc = escapeMd(meta.date)

  const lines = top5.map((s, i) => {
    const title = escapeMd(s.title)
    const url = s.url || s.hn_link
    return `${i + 1}\\. [${title}](${url}) — ↑${s.score} 💬${s.comments}`
  })

  const text = [
    `📡 *HN Daily Signal* · ${dayName} ${dateEsc}`,
    '',
    ...lines,
    '',
    `[View all ${meta.final_count} stories →](${pagesUrl})`,
  ].join('\n')

  const res = await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      chat_id: chatId,
      text,
      parse_mode: 'MarkdownV2',
      disable_web_page_preview: true,
    }),
  })

  if (!res.ok) {
    const body = await res.text()
    err(`Telegram API error ${res.status}: ${body}`)
    process.exit(1)
  }

  log('Telegram notification sent successfully')
}

main().catch(e => { err(e); process.exit(1) })
