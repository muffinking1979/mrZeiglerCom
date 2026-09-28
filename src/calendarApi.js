// Talks to public/api.php (a tiny JSON storage API — see that file for the contract).
// In `npm run dev`, vite.config.js mocks the same contract so no PHP server is needed locally.

const API = 'api.php'

export async function fetchCalendarEvents(slug) {
  const res = await fetch(`${API}?cal=${slug}`, { cache: 'no-store' })
  if (!res.ok) throw new Error('Could not load calendar')
  const data = await res.json()
  return data.events || {}
}

async function post(query, body) {
  const res = await fetch(`${API}?${query}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  })
  if (res.status === 401) throw Object.assign(new Error('Wrong password'), { unauthorized: true })
  if (!res.ok) {
    const data = await res.json().catch(() => ({}))
    throw new Error(data.error || 'Request failed')
  }
}

export const checkPassword = (password) => post('action=login', { password })

export const saveCalendarEvents = (slug, password, events) =>
  post(`cal=${slug}`, { password, events })
