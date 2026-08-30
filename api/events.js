export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  const secret = process.env.METHODZ_CRM_WEBHOOK_SECRET
  const routerBase = process.env.METHODZ_ROUTER_BASE_URL || 'https://crm.methodz.ca'
  if (!secret) {
    console.error('METHODZ_CRM_WEBHOOK_SECRET is not configured on Vercel')
    return res.status(503).json({ error: 'Methodz event routing is not configured' })
  }

  const body = req.body && typeof req.body === 'object' ? req.body : {}
  const eventName = String(body.eventName || '').trim()
  const sessionId = String(body.sessionId || '').trim()
  if (!eventName || !sessionId) {
    return res.status(400).json({ error: 'eventName and sessionId are required' })
  }

  const payload = {
    brand: 'elk_treats',
    source: 'bircham-elk-antler-store',
    eventName,
    sessionId,
    eventId: body.eventId,
    occurredAt: body.occurredAt,
    email: body.email,
    payload: body.payload && typeof body.payload === 'object' ? body.payload : {}
  }

  try {
    const response = await fetch(`${routerBase}/api/events/storefront`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-methodz-crm-secret': secret
      },
      body: JSON.stringify(payload)
    })
    const text = await response.text()
    let data
    try { data = JSON.parse(text) } catch { data = { raw: text } }
    if (!response.ok) {
      console.error('Methodz storefront event rejected', response.status, data)
      return res.status(response.status).json({ error: 'Methodz event routing failed' })
    }
    return res.status(202).json(data)
  } catch (error) {
    console.error('Methodz storefront event forwarding failed', error)
    return res.status(502).json({ error: 'Failed to reach Methodz event conductor' })
  }
}
