// app/app.js

function relativeTime(unix) {
  const diffSec = Math.floor(Date.now() / 1000) - unix
  if (diffSec < 3600)  return `${Math.floor(diffSec / 60)}m ago`
  if (diffSec < 86400) return `${Math.floor(diffSec / 3600)}h ago`
  return `${Math.floor(diffSec / 86400)}d ago`
}

function escHtml(str) {
  return String(str ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
}

// State
let allStories = []
let availableDates = []   // sorted descending
let currentDateIndex = 0  // 0 = latest

function updateNavButtons() {
  document.getElementById('prev-btn').disabled = currentDateIndex >= availableDates.length - 1
  document.getElementById('next-btn').disabled = currentDateIndex <= 0
  const date = availableDates[currentDateIndex] ?? '–'
  document.getElementById('current-date').textContent = date
}

function render(stories) {
  const list = document.getElementById('story-list')
  list.innerHTML = ''

  if (!stories.length) {
    list.innerHTML = '<div class="state-msg">⚠ No matching stories.</div>'
    return
  }

  for (const s of stories) {
    const row = document.createElement('div')
    const seenClass = s.seen_before ? ' seen-before' : ''
    row.className = `story-row${seenClass}`
    row.dataset.id = s.id

    const domain = s.domain ? ` · ${escHtml(s.domain)}` : ''
    const label = s.signal_label ? ` · ${escHtml(s.signal_label)}` : ''
    const seen = s.seen_before ? ' · seen' : ''

    row.innerHTML = `
      <div class="story-main">
        <span class="story-rank">${String(s.rank).padStart(2)}</span>
        <span class="story-title">${escHtml(s.title)}</span>
        <span class="story-score">↑${s.score}</span>
      </div>
      <div class="story-meta">💬 ${s.comments} · ${escHtml(s.author)} · ${relativeTime(s.time)}${domain}${label}${seen}</div>
      <div class="story-expand">
        ${s.url && /^https?:\/\//i.test(s.url) ? `<a href="${escHtml(s.url)}" target="_blank" rel="noopener">article ↗</a>` : ''}
        <a href="${escHtml(s.hn_link)}" target="_blank" rel="noopener">discuss ↗</a>
      </div>
    `

    row.addEventListener('click', () => row.classList.toggle('expanded'))
    list.appendChild(row)
  }
}

async function loadDate(dateStr) {
  const metaBar = document.getElementById('meta-bar')
  const list = document.getElementById('story-list')

  try {
    const url = (currentDateIndex === 0)
      ? '/data/processed/latest.json'
      : `/data/processed/hn_daily_${dateStr}.json`

    const res = await fetch(url)
    if (!res.ok) throw new Error(`HTTP ${res.status}`)
    const data = await res.json()

    const { meta, stories } = data
    allStories = stories

    const excluded = meta.raw_count - meta.filtered_count
    metaBar.textContent = `${meta.date} · ${meta.final_count} stories · ${excluded} excluded · ${meta.source}`

    render(allStories)
    updateNavButtons()
  } catch (e) {
    metaBar.textContent = '⚠ No data found. Run: make daily'
    list.innerHTML = '<div class="state-msg">⚠ No data found. Run: make daily</div>'
  }
}

async function loadManifest() {
  try {
    const res = await fetch('/data/processed/manifest.json')
    if (!res.ok) throw new Error(`HTTP ${res.status}`)
    const manifest = await res.json()
    availableDates = manifest.dates ?? []
  } catch {
    availableDates = []
  }
}

async function init() {
  await loadManifest()
  currentDateIndex = 0
  updateNavButtons()
  if (availableDates.length > 0) {
    await loadDate(availableDates[0])
  } else {
    await loadDate(null)
  }
}

// Navigation
document.getElementById('prev-btn').addEventListener('click', async () => {
  if (currentDateIndex < availableDates.length - 1) {
    currentDateIndex++
    await loadDate(availableDates[currentDateIndex])
  }
})

document.getElementById('next-btn').addEventListener('click', async () => {
  if (currentDateIndex > 0) {
    currentDateIndex--
    await loadDate(availableDates[currentDateIndex])
  }
})

// Refresh — always jump to latest
document.getElementById('refresh-btn').addEventListener('click', async () => {
  await loadManifest()
  currentDateIndex = 0
  await loadDate(availableDates[0])
})

// Search
document.getElementById('search').addEventListener('input', (e) => {
  const q = e.target.value.toLowerCase().trim()
  render(q ? allStories.filter(s => s.title.toLowerCase().includes(q)) : allStories)
})

init()
