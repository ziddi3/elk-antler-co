// Render web-service entry point. Zero dependencies.
// Serves the static storefront and mounts api/contact.js (the Vercel-style
// handler) at /api/contact so the same code runs on Render and Vercel.
import http from 'node:http'
import { readFile, stat } from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import contactHandler from './api/contact.js'

const ROOT = path.dirname(fileURLToPath(import.meta.url))
const PORT = process.env.PORT || 10000
const TYPES = {
  '.html': 'text/html; charset=utf-8', '.js': 'text/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8', '.json': 'application/json', '.svg': 'image/svg+xml',
  '.png': 'image/png', '.jpg': 'image/jpeg', '.jpeg': 'image/jpeg', '.webp': 'image/webp',
  '.gif': 'image/gif', '.ico': 'image/x-icon', '.woff2': 'font/woff2', '.txt': 'text/plain; charset=utf-8',
}
const BLOCKED = new Set(['server.js', 'package.json', 'package-lock.json', 'AGENTS.md', 'vercel.json'])

function vercelRes(res) {
  res.status = (code) => { res.statusCode = code; return res }
  res.json = (obj) => { res.setHeader('Content-Type', 'application/json'); res.end(JSON.stringify(obj)); return res }
  return res
}

async function readBody(req) {
  const chunks = []
  for await (const c of req) { chunks.push(c); if (chunks.reduce((n, b) => n + b.length, 0) > 1e6) break }
  const raw = Buffer.concat(chunks).toString('utf8')
  if (!raw) return {}
  try { return JSON.parse(raw) } catch { return Object.fromEntries(new URLSearchParams(raw)) }
}

async function tryFile(p) {
  try { const s = await stat(p); return s.isFile() ? p : null } catch { return null }
}

const server = http.createServer(async (req, res) => {
  try {
    const url = new URL(req.url, 'http://localhost')
    if (url.pathname === '/healthz') { res.writeHead(200, { 'Content-Type': 'text/plain' }); return res.end('ok') }
    if (url.pathname === '/api/contact') {
      req.body = req.method === 'POST' ? await readBody(req) : {}
      return await contactHandler(req, vercelRes(res))
    }
    let rel = decodeURIComponent(url.pathname).replace(/\/+$/, '') || '/index.html'
    const abs = path.normalize(path.join(ROOT, rel))
    if (!abs.startsWith(ROOT) || rel.split('/').some((seg) => seg.startsWith('.')) || BLOCKED.has(rel.replace(/^\//, '')) || rel.startsWith('/api/')) {
      res.writeHead(404); return res.end('Not found')
    }
    // cleanUrls parity with vercel.json: /about -> about.html, /dir -> dir/index.html
    const file = (await tryFile(abs)) || (await tryFile(abs + '.html')) || (await tryFile(path.join(abs, 'index.html')))
    if (!file) { res.writeHead(404, { 'Content-Type': 'text/plain' }); return res.end('Not found') }
    const headers = { 'Content-Type': TYPES[path.extname(file).toLowerCase()] || 'application/octet-stream' }
    if (rel.startsWith('/assets/')) headers['Cache-Control'] = 'public, max-age=31536000, immutable'
    res.writeHead(200, headers)
    res.end(await readFile(file))
  } catch (err) {
    console.error(err)
    if (!res.headersSent) res.writeHead(500)
    res.end('Server error')
  }
})

server.listen(PORT, () => console.log(`Elk & Antler storefront listening on ${PORT}`))
