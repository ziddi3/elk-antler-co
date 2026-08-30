import fs from 'node:fs/promises'
import path from 'node:path'

async function loadCatalog() {
  const catalogPath = path.join(process.cwd(), 'data', 'catalog.json')
  const text = await fs.readFile(catalogPath, 'utf8')
  return JSON.parse(text)
}

function normalizeQuantity(value) {
  const quantity = Number(value)
  if (!Number.isInteger(quantity) || quantity < 1 || quantity > 100) return null
  return quantity
}

function httpsOrigin(value) {
  try {
    const parsed = new URL(value)
    return parsed.protocol === 'https:' ? parsed.origin : null
  } catch {
    return null
  }
}

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' })

  const routerBase = process.env.METHODZ_ROUTER_BASE_URL || 'https://crm.methodz.ca'
  const secret = process.env.METHODZ_CRM_WEBHOOK_SECRET
  if (!secret) {
    console.error('METHODZ_CRM_WEBHOOK_SECRET is not configured on Vercel')
    return res.status(503).json({ error: 'Methodz commerce secret is not configured' })
  }

  const body = req.body || {}
  const requestedItems = Array.isArray(body.items) ? body.items : []
  if (!requestedItems.length) return res.status(400).json({ error: 'Cart is empty' })

  let catalog
  try {
    catalog = await loadCatalog()
  } catch (error) {
    console.error('Failed to load canonical Bircham catalog', error)
    return res.status(500).json({ error: 'Storefront catalog is unavailable' })
  }

  const products = Array.isArray(catalog.products) ? catalog.products : []
  const commerce = catalog.commerce || {}
  const authoritativeItems = []

  for (const requested of requestedItems) {
    const product = products.find((entry) => entry.id === requested.id)
    if (!product) return res.status(400).json({ error: `Unknown product: ${requested.id || 'missing id'}` })

    const variant = Array.isArray(product.variants)
      ? product.variants.find((entry) => entry.label === requested.variant)
      : null
    if (!variant) return res.status(400).json({ error: `Unknown variant for product ${product.id}` })

    const quantity = normalizeQuantity(requested.quantity)
    if (!quantity) return res.status(400).json({ error: `Invalid quantity for product ${product.id}` })

    authoritativeItems.push({
      id: product.id,
      name: product.name,
      variant: variant.label,
      unitPrice: Number(variant.price),
      quantity
    })
  }

  const subtotal = Number(authoritativeItems.reduce((sum, item) => sum + (item.unitPrice * item.quantity), 0).toFixed(2))
  const freeShippingThreshold = Number(commerce.freeShippingThreshold || 0)
  const shippingFlatRate = Number(commerce.shippingFlatRate || 0)
  const gstRate = Number(commerce.gstRate || 0)
  const shipping = subtotal > 0 && freeShippingThreshold > 0 && subtotal >= freeShippingThreshold ? 0 : shippingFlatRate
  const tax = Number((subtotal * gstRate).toFixed(2))
  const total = Number((subtotal + shipping + tax).toFixed(2))
  const origin = httpsOrigin(req.headers.origin) || 'https://birchamelkantler.com'
  const reviewUrl = process.env.BIRCHAM_REVIEW_URL

  const payload = {
    brand: 'elk_treats',
    storeName: 'Bircham Elk & Antler Co.',
    source: 'bircham-elk-antler-store',
    mode: 'ecommerce',
    paymentProvider: 'stripe',
    currency: String(commerce.currency || 'CAD').toUpperCase(),
    taxBehavior: 'exclusive_plus_gst',
    gstRate,
    items: authoritativeItems,
    subtotal,
    shipping,
    tax,
    total,
    sessionId: body.sessionId ? String(body.sessionId).slice(0, 200) : undefined,
    storefrontUrl: origin,
    reviewUrl: reviewUrl || undefined,
    successUrl: `${origin}/?checkout=success`,
    cancelUrl: `${origin}/?checkout=cancelled`
  }

  try {
    const response = await fetch(`${routerBase}/api/billing/create-checkout`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'x-methodz-crm-secret': secret },
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
    if (!checkoutUrl) return res.status(502).json({ error: 'Methodz checkout response did not include a checkout URL' })
    return res.status(200).json({ checkoutUrl })
  } catch (error) {
    console.error('Methodz checkout request failed', error)
    return res.status(502).json({ error: 'Failed to reach Methodz commerce router' })
  }
}
