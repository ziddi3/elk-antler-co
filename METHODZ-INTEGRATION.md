# Methodz integration contract

Bircham Elk & Antler Co. is a Methodz-managed ecommerce storefront.

## Canonical ownership
- Customer payment: Methodz Stripe, CAD
- Tax: GST added where applicable
- CRM/customer profile: Methodz CRM
- Lead/contact routing: Methodz API/router
- Transactional notifications: Methodz ecosystem
- Lifecycle automation: Methodz ecosystem
- Analytics/marketing routing: Methodz ecosystem
- Settlement: Methodz pays the downstream operator after customer payment
- GoHighLevel: not used

## Store API boundary
The browser never receives Methodz secrets. It calls local serverless endpoints under `/api/*`; those endpoints authenticate server-to-server with the Methodz ecosystem using deployment environment variables.

Current store endpoints:
- `POST /api/contact` -> Methodz CRM lead webhook
- `POST /api/checkout` -> Methodz Stripe checkout creation

This keeps storefront code provider-independent while Methodz remains the authority for commerce and customer operations.
