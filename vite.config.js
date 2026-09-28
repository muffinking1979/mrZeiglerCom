import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'
import fs from 'node:fs'

// Dev-only stand-in for public/api.php (same contract) so `npm run dev` works without PHP.
// Data is stored in ./dev-data and the admin password is "dev". Not included in the build.
function devCalendarApi() {
  return {
    name: 'dev-calendar-api',
    apply: 'serve',
    configureServer(server) {
      server.middlewares.use('/api.php', (req, res) => {
        const url = new URL(req.url, 'http://x')
        const slug = url.searchParams.get('cal') || ''
        const send = (code, data) => {
          res.statusCode = code
          res.setHeader('Content-Type', 'application/json')
          res.end(typeof data === 'string' ? data : JSON.stringify(data))
        }
        const file = `dev-data/${slug}.json`
        if (req.method === 'GET') {
          if (!/^[a-z0-9-]{1,40}$/.test(slug)) return send(400, { error: 'Bad calendar name' })
          return send(200, fs.existsSync(file) ? fs.readFileSync(file, 'utf8') : { events: {} })
        }
        let raw = ''
        req.on('data', (c) => { raw += c })
        req.on('end', () => {
          let body
          try { body = JSON.parse(raw) } catch { return send(400, { error: 'Bad JSON' }) }
          if (body.password !== 'dev') return send(401, { error: 'Wrong password' })
          if (url.searchParams.get('action') === 'login') return send(200, { ok: true })
          if (!/^[a-z0-9-]{1,40}$/.test(slug) || typeof body.events !== 'object') return send(400, { error: 'Bad request' })
          fs.mkdirSync('dev-data', { recursive: true })
          fs.writeFileSync(file, JSON.stringify({ events: body.events }, null, 2))
          send(200, { ok: true })
        })
      })
    },
  }
}

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), devCalendarApi()],
})
