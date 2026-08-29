# Bircham Elk & Antler Co. integration checklist status

Canonical architecture: Methodz-first. GoHighLevel is retired from this design.

## Business information
- Business/store name: configured
- Customer email: orders@birchamelkantler.com
- Operational email: LECINC123@gmail.com
- Phone: 403-869-1869
- Address: not yet evidenced in supplied documents
- Social accounts: not yet evidenced
- Business hours: not yet evidenced

## Domain & hosting
- Vercel deployment config: present
- Domain/DNS/SSL/backup: deployment/account verification required

## Payments
- Provider: Methodz Stripe
- Currency: CAD
- Tax: exclusive + GST
- Browser checkout now routes through server-side `/api/checkout`
- Settlement model: Methodz collects first and settles downstream operator

## CRM
- Provider: Methodz CRM / Methodz API
- GoHighLevel: intentionally not used
- Contact capture: server-side `/api/contact`
- Customer profiles/order notifications/follow-ups: Methodz-owned

## Email
- Customer-facing support email configured
- Transactional notifications: Methodz-owned
- Lifecycle email/review/abandoned cart: Methodz-owned configuration added

## Products
- Descriptions: present
- Pricing: present
- Product photos: present
- Size options: present
- Inventory tracking: enabled by architecture, item quantities still need authoritative inventory source
- Shipping weights: not evidenced in supplied documents

## Policies
- Privacy Policy: added
- Terms of Service: added
- Refund Policy: added
- Shipping Policy: added
- Cookie Policy: added

## Marketing
- Google Analytics: Methodz-routed configuration added
- Google Search Console: external verification flag added
- Meta Pixel: Methodz-routed configuration added
- Email marketing: Methodz
- Review requests: Methodz
- Discount codes: Methodz

## AI & automation
- Lead capture: Methodz
- Customer profiles: Methodz
- Automated follow-ups: Methodz
- Abandoned cart reminders: Methodz
- Support AI: future

## Future Methodz integrations
- Methodz CRM: canonical
- Unified customer database: Methodz
- AI dashboard: Methodz architecture
- Sales reporting: Methodz
- Inventory reporting: Methodz
- Multi-business management: Methodz
- Method Hub integration: enabled by architecture
