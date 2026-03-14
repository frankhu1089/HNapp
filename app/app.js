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

let allStories = []

function render(stories) {
  const list = document.getElementById('story-list')
  list.innerHTML = ''

  if (!stories.length) {
    list.innerHTML = '<div class="state-msg">⚠ No matching stories.</div>'
    return
  }

  for (const s of stories) {
    const row = document.createElement('div')
    row.className = 'story-row'
    row.dataset.id = s.id

    const domain = s.domain ? ` · ${escHtml(s.domain)}` : ''

    row.innerHTML = `
      <div class="story-main">
        <span class="story-rank">${String(s.rank).padStart(2)}</span>
        <span class="story-title">${escHtml(s.title)}</span>
        <span class="story-score">↑${s.score}</span>
      </div>
      <div class="story-meta">💬 ${s.comments} · ${escHtml(s.author)} · ${relativeTime(s.time)}${domain}</div>
      <div class="story-expand">
        ${s.url ? `<a href="${escHtml(s.url)}" target="_blank" rel="noopener">article ↗</a>` : ''}
        <a href="${escHtml(s.hn_link)}" target="_blank" rel="noopener">discuss ↗</a>
      </div>
    `

    row.addEventListener('click', () => {
      row.classList.toggle('expanded')
    })

    list.appendChild(row)
  }
}

async function loadData() {
  const metaBar = document.getElementById('meta-bar')
  const list = document.getElementById('story-list')

  try {
    const res = await fetch('/data/processed/latest.json')
    if (!res.ok) throw new Error(`HTTP ${res.status}`)
    const data = await res.json()

    const { meta, stories } = data
    allStories = stories

    const excluded = meta.raw_count - meta.filtered_count
    metaBar.textContent = `${meta.date} · ${meta.final_count} stories · ${excluded} excluded · ${meta.source}`

    render(allStories)
  } catch (e) {
    metaBar.textContent = '⚠ No data found. Run: make daily'
    list.innerHTML = '<div class="state-msg">⚠ No data found. Run: make daily</div>'
  }
}

document.getElementById('search').addEventListener('input', (e) => {
  const q = e.target.value.toLowerCase().trim()
  render(q ? allStories.filter(s => s.title.toLowerCase().includes(q)) : allStories)
})

document.getElementById('refresh-btn').addEventListener('click', loadData)

loadData()
