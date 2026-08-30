/* =====================================================================
   CATALOG LOADER — Bircham Elk & Antler Co.
   =====================================================================
   The canonical product, variant, price, commerce, and FAQ data lives in
   /data/catalog.json. The browser loads that same catalog that the server
   checkout adapter validates, keeping display prices and payment authority
   aligned without duplicating product values across runtime layers.
   ===================================================================== */

window.PRODUCTS = [];
window.FAQS = [];

window.CATALOG_READY = fetch('/data/catalog.json', { cache: 'no-cache' })
  .then(function (res) {
    if (!res.ok) throw new Error('Catalog request failed with status ' + res.status);
    return res.json();
  })
  .then(function (catalog) {
    window.PRODUCTS = Array.isArray(catalog.products) ? catalog.products : [];
    window.FAQS = Array.isArray(catalog.faqs) ? catalog.faqs : [];
    window.BIRCHAM_COMMERCE = catalog.commerce || {};
    return catalog;
  })
  .catch(function (error) {
    console.error('[catalog] Failed to load canonical storefront catalog', error);
    throw error;
  });
