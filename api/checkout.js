export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  const routerBase = process.env.METHODZ_ROUTER_BASE_URL || 'https://crm.methodz.ca'
  const secret = process.env.METHODZ_CRM_WEBHOOK_SECRET

  if (!secret) {
    console.error('METHODZ_CRM_WEBHOOK_SECRET is not configured on Vercel')
    return res.status(500).json({ error: 'Methodz commerce secret is not configured' })
  }

  const body = req.body || {}
  const items = Array.isArray(body.items) ? body.items : []

  if (!items.length) {
    return res.status(400).json({ error: 'Cart is empty' })
  }

  const payload = {
    brand: 'elk_treats',
    source: 'bircham-elk-antler-store',
    mode: 'ecommerce',
    paymentProvider: 'stripe',
    currency: 'CAD',
    taxBehavior: 'exclusive_plus_gst',
    gstRate: 0.05,
    items,
    subtotal: Number(body.subtotal || 0),
    shipping: Number(body.shipping || 0),
    tax: Number(body.tax || 0),
    total: Number(body.total || 0),
    successUrl: `${req.headers.origin || 'https://birchamelkantler.com'}/?checkout=success`,
    cancelUrl: `${req.headers.origin || 'https://birchamelkantler.com'}/?checkout=cancelled`
  }

  try {
    const response = await fetch(`${routerBase}/api/billing/create-checkout`, {
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
      console.error('Methodz checkout creation failed', response.status, data)
      return res.status(response.status).json({ error: 'Failed to create checkout', details: data })
    }

    const checkoutUrl = data.checkoutUrl || data.url || data.sessionUrl
    if (!checkoutUrl) {
      return res.status(502).json({ error: 'Methodz checkout response did not include a checkout URL', details: data })
    }

    return res.status(200).json({ checkoutUrl })
  } catch (error) {
    console.error('Methodz checkout request failed', error)
    return res.status(500).json({ error: 'Failed to reach Methodz commerce router' })
  }
}
