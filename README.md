# 🦌 Elk & Antler Co. — Online Store

A complete, ready-to-launch online store for selling **all-natural elk antler dog chews** and **organic wheat berries**, with secure **PayPal checkout**.

Built as a fast, free-to-host static website (HTML + CSS + JavaScript) — no monthly fees, no complicated backend, no database. Perfect for a small business.

![Elk & Antler Co.](assets/img/hero.png)

---

## ✨ Features

- 🛒 **Shopping cart** with size/quantity selection (saved in the browser)
- 💳 **PayPal checkout** — accepts PayPal *and* all major credit/debit cards
- 📱 **Fully mobile-responsive** — looks great on phones, tablets & desktops
- 🚚 **Automatic shipping** — free over $45, flat rate otherwise (configurable)
- 🦴 Product pages with descriptions, benefits, feeding guide & FAQ
- 🌲 Rustic, professional, trustworthy design
- 🆓 **Free to host** on Vercel / GitHub Pages / Netlify
- 🔗 **Methodz CRM integration** — contact form leads are forwarded to `crm.methodz.ca` under brand `elk_treats`

---

## 🚀 Quick Start (for Mom!)

### 1. See the site right now
Just open `index.html` in any web browser. The store works immediately in **demo mode** — you can browse products and test the cart.

### 2. Turn on real payments (takes ~5 minutes)
1. Create a **free PayPal Business account** at [paypal.com](https://www.paypal.com/).
2. Go to the [PayPal Developer Dashboard](https://developer.paypal.com/dashboard/) → **Apps & Credentials**.
3. Switch the toggle to **Live**, click **Create App**, name it (e.g. "Elk Antler Store"), and copy the **Client ID**.
4. Open the file **`js/config.js`** and paste your Client ID where it says `REPLACE_WITH_YOUR_PAYPAL_CLIENT_ID`.
5. Save. Done! 🎉 Payments now go straight to your PayPal account.

> 💡 PayPal is free to set up. They only take a small fee per sale (no monthly cost) — the cheapest, easiest way to accept payments online.

### 3. Edit your products & prices
Open **`js/products.js`**. Each product has a name, image, description, and sizes/prices in plain English — just change the numbers and text. To swap a photo, drop a new image in `assets/img/` and update the filename.

---

## 🔗 Methodz CRM (already wired)

The contact form on the site posts to `/api/contact`, which forwards the lead to:

```
POST https://crm.methodz.ca/api/webhooks/lead
```

Brand: `elk_treats`  
Source: `elk-treats-website`

**Required Vercel environment variable:**

| Key | Value |
|-----|-------|
| `METHODZ_CRM_WEBHOOK_SECRET` | Same value as `CRM_WEBHOOK_SECRET` on the Render service `methodz-crm-core` |

Once that secret is set, every contact form submission appears as a lead in the Methodz CRM.

---

## 🌐 Publishing your store online (free)

### Option A — Vercel (current)
Push to the connected GitHub repo; Vercel auto-deploys.

### Option B — GitHub Pages
1. Push this folder to a GitHub repository.
2. In your repo, go to **Settings → Pages**.
3. Under "Branch", select `main` and `/ (root)`, then **Save**.
4. Your store goes live at `https://YOUR-USERNAME.github.io/REPO-NAME/` 🎉

### Option C — Netlify / Cloudflare Pages
Drag-and-drop this folder onto [netlify.com/drop](https://app.netlify.com/drop) for an instant free site.

---

## 📁 Project Structure

```
elk-antler-co/
├── index.html          # The whole store (one page)
├── api/
│   └── contact.js      # Forwards contact form → Methodz CRM
├── css/
│   └── styles.css      # All styling
├── js/
│   ├── config.js       # ⭐ EDIT THIS: PayPal ID, currency, shipping
│   ├── products.js     # ⭐ EDIT THIS: products, prices, FAQ
│   └── app.js          # Cart + checkout + contact logic
├── assets/
│   └── img/            # Logo + product photos
└── README.md
```

---

## ⚙️ Configuration cheat-sheet (`js/config.js`)

| Setting | What it does |
|---|---|
| `paypalClientId` | Your PayPal Client ID (turns on real payments) |
| `currency` | `"USD"` or `"CAD"` |
| `freeShippingThreshold` | Orders above this ship free (default 45) |
| `shippingFlatRate` | Shipping cost below the threshold (default 7.95) |

---

Made with ❤️ for happy dogs and the people who love them.

---

🔥 **Site built & powered by [Method-Media](https://methodz.ca)** — a proud Methodz Partner.  
*Member of the Method Alliance — HVAC • Media • Hub • Partners.*
