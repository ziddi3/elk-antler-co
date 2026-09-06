export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' })

  const secret = process.env.METHODZ_CRM_WEBHOOK_SECRET
  const routerBase = process.env.METHODZ_ROUTER_BASE_URL || 'https://crm.methodz.ca'
  if (!secret) {
    console.error('METHODZ_CRM_WEBHOOK_SECRET is not configured on Vercel')
    return res.status(503).json({ error: 'CRM webhook secret is not configured' })
  }

  const body = req.body || {}
  const name = String(body.name || '').trim()
  const email = String(body.email || '').trim()
  const message = String(body.message || '').trim()
  if (!name || name.length < 2) return res.status(400).json({ error: 'Name is required' })
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return res.status(400).json({ error: 'Valid email is required' })

  const cart = Array.isArray(body.cart) ? body.cart : []
  const cartSummary = cart.length
    ? cart.map((item) => `${item.qty || 1}× ${item.name || 'item'}${item.variant ? ` (${item.variant})` : ''}`).join(', ')
    : null

  const payload = {
    brand: 'elk_treats',
    source: 'bircham-elk-antler-store',
    serviceType: 'contact-inquiry',
    sessionId: body.sessionId || undefined,
    contact: { name, email, notes: message || undefined },
    metadata: {
      sessionId: body.sessionId || undefined,
      url: body.pageUrl || undefined,
      message: message || undefined
    },
    estimate: {
      serviceLabel: 'Bircham Elk & Antler contact inquiry',
      packageLabel: cartSummary || 'Website inquiry'
    },
    cart: cart.length ? cart : undefined,
    cartTotal: body.cartTotal ?? undefined,
    currency: body.currency || 'CAD',
    raw: body
  }

  try {
    const response = await fetch(`${routerBase}/api/webhooks/lead`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'x-methodz-crm-secret': secret },
      body: JSON.stringify(payload)
    })
    const text = await response.text()
    let data
    try { data = JSON.parse(text) } catch { data = { raw: text } }
    if (!response.ok) {
      console.error('CRM lead forward failed', response.status, data)
      return res.status(response.status).json({ error: 'Failed to forward lead to CRM', details: data })
    }
    return res.status(202).json({ accepted: true, forwarded: true, brand: 'elk_treats', crm: data })
  } catch (error) {
    console.error('CRM lead forward error', error)
    return res.status(502).json({ error: 'Failed to forward lead to CRM' })
  }
}
