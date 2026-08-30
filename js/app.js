/* =====================================================================
   APP LOGIC — Bircham Elk & Antler Co.
   Canonical catalog UI, cart, Methodz checkout and first-party events.
   ===================================================================== */
(function () {
  'use strict';

  var CFG = window.STORE_CONFIG;
  var PRODUCTS = window.PRODUCTS || [];
  var FAQS = window.FAQS || [];
  var CART_KEY = 'elk_antler_cart_v1';
  var SESSION_KEY = 'methodz_storefront_session_v1';

  function makeSessionId() {
    if (window.crypto && typeof window.crypto.randomUUID === 'function') return window.crypto.randomUUID();
    return 'web-' + Date.now().toString(36) + '-' + Math.random().toString(36).slice(2);
  }

  function sessionId() {
    var value = localStorage.getItem(SESSION_KEY);
    if (!value) {
      value = makeSessionId();
      localStorage.setItem(SESSION_KEY, value);
    }
    return value;
  }

  function trackMethodz(eventName, payload, email) {
    var occurredAt = new Date().toISOString();
    var body = {
      eventName: eventName,
      sessionId: sessionId(),
      eventId: sessionId() + ':' + eventName + ':' + Date.now().toString(36) + ':' + Math.random().toString(36).slice(2, 8),
      occurredAt: occurredAt,
      email: email || undefined,
      payload: Object.assign({ url: window.location.href }, payload || {})
    };
    fetch('/api/events', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
      keepalive: true
    }).catch(function (error) {
      console.warn('[methodz-events] event delivery failed', error);
    });
  }

  var money = function (n) { return 'CA$' + Number(n).toFixed(2); };
  var cart = loadCart();

  function loadCart() {
    try { return JSON.parse(localStorage.getItem(CART_KEY)) || []; }
    catch (e) { return []; }
  }
  function saveCart() { localStorage.setItem(CART_KEY, JSON.stringify(cart)); }
  function cartCount() { return cart.reduce(function (s, i) { return s + i.qty; }, 0); }
  function cartSubtotal() { return cart.reduce(function (s, i) { return s + i.price * i.qty; }, 0); }
  function shipping() {
    var sub = cartSubtotal();
    if (sub <= 0) return 0;
    return sub >= CFG.freeShippingThreshold ? 0 : CFG.shippingFlatRate;
  }
  function tax() { return Number((cartSubtotal() * Number(CFG.gstRate || 0)).toFixed(2)); }
  function cartTotal() { return Number((cartSubtotal() + shipping() + tax()).toFixed(2)); }

  function addToCart(productId, variantIndex) {
    var p = PRODUCTS.find(function (x) { return x.id === productId; });
    if (!p) return;
    var v = p.variants[variantIndex];
    var key = productId + '::' + variantIndex;
    var existing = cart.find(function (i) { return i.key === key; });
    if (existing) existing.qty += 1;
    else cart.push({ key: key, id: p.id, name: p.name, variant: v.label, price: v.price, image: p.image, qty: 1 });
    saveCart(); renderCart(); updateCount();
    trackMethodz('add_to_cart', { productId: p.id, variant: v.label, quantity: existing ? existing.qty : 1, value: v.price, currency: 'CAD' });
    showToast(p.name + ' added to cart');
    openCart();
  }

  function changeQty(key, delta) {
    var item = cart.find(function (i) { return i.key === key; });
    if (!item) return;
    item.qty += delta;
    if (item.qty <= 0) cart = cart.filter(function (i) { return i.key !== key; });
    saveCart(); renderCart(); updateCount();
  }
  function removeItem(key) {
    cart = cart.filter(function (i) { return i.key !== key; });
    saveCart(); renderCart(); updateCount();
  }

  function renderProducts() {
    var grid = document.getElementById('productGrid');
    if (!grid) return;
    grid.innerHTML = PRODUCTS.map(function (p) {
      var opts = p.variants.map(function (v, i) {
        return '<option value="' + i + '">' + v.label + ' — ' + money(v.price) + '</option>';
      }).join('');
      return '<div class="product-card" data-product-id="' + p.id + '">' +
        '<div class="product-media">' + (p.tag ? '<span class="product-tag">' + p.tag + '</span>' : '') +
        '<img src="' + p.image + '" alt="' + p.name + '" /></div>' +
        '<div class="product-body"><div class="product-meta"><h3 class="product-title">' + p.name + '</h3></div>' +
        '<div class="product-stars">' + (p.stars || '') + '</div><p class="product-desc">' + p.desc + '</p>' +
        '<div class="size-row"><label for="sz-' + p.id + '">Choose size</label>' +
        '<select class="size-select" id="sz-' + p.id + '">' + opts + '</select></div>' +
        '<button class="btn btn--primary btn--block" data-add="' + p.id + '">Add to Cart</button></div></div>';
    }).join('');

    grid.querySelectorAll('[data-add]').forEach(function (btn) {
      btn.addEventListener('click', function () {
        var id = btn.getAttribute('data-add');
        var sel = document.getElementById('sz-' + id);
        addToCart(id, parseInt(sel.value, 10));
      });
    });

    if ('IntersectionObserver' in window) {
      var viewed = {};
      var observer = new IntersectionObserver(function (entries) {
        entries.forEach(function (entry) {
          if (!entry.isIntersecting) return;
          var id = entry.target.getAttribute('data-product-id');
          if (!id || viewed[id]) return;
          viewed[id] = true;
          trackMethodz('product_view', { productId: id });
          observer.unobserve(entry.target);
        });
      }, { threshold: 0.5 });
      grid.querySelectorAll('[data-product-id]').forEach(function (card) { observer.observe(card); });
    }
  }

  function updateCount() {
    var el = document.getElementById('cartCount');
    if (el) el.textContent = cartCount();
  }

  function renderCart() {
    var wrap = document.getElementById('cartItems');
    var totalEl = document.getElementById('cartTotal');
    var checkout = document.getElementById('methodz-checkout-container');
    if (!wrap || !totalEl) return;

    if (cart.length === 0) {
      wrap.innerHTML = '<div class="cart-empty"><span class="ico">🛒</span>Your cart is empty.<br>Add some chews your pup will love!</div>';
      totalEl.textContent = money(0);
      if (checkout) checkout.innerHTML = '';
      return;
    }

    wrap.innerHTML = cart.map(function (i) {
      return '<div class="cart-item"><img src="' + i.image + '" alt="' + i.name + '" />' +
        '<div class="cart-item-info"><h4>' + i.name + '</h4><div class="ci-variant">' + i.variant + '</div>' +
        '<div class="ci-price">' + money(i.price) + '</div><div class="qty"><button data-dec="' + i.key + '">−</button>' +
        '<span>' + i.qty + '</span><button data-inc="' + i.key + '">+</button></div><br>' +
        '<button class="ci-remove" data-rem="' + i.key + '">Remove</button></div></div>';
    }).join('');

    var ship = shipping();
    wrap.insertAdjacentHTML('beforeend', ship === 0
      ? '<div class="cart-note" style="margin:4px 0 0">You qualify for free shipping.</div>'
      : '<div class="cart-note" style="margin:4px 0 0">+ ' + money(ship) + ' shipping</div>');
    wrap.insertAdjacentHTML('beforeend', '<div class="cart-note" style="margin:4px 0 0">+ ' + money(tax()) + ' GST</div>');
    totalEl.textContent = money(cartTotal());

    wrap.querySelectorAll('[data-inc]').forEach(function (b) { b.onclick = function () { changeQty(b.getAttribute('data-inc'), 1); }; });
    wrap.querySelectorAll('[data-dec]').forEach(function (b) { b.onclick = function () { changeQty(b.getAttribute('data-dec'), -1); }; });
    wrap.querySelectorAll('[data-rem]').forEach(function (b) { b.onclick = function () { removeItem(b.getAttribute('data-rem')); }; });

    if (checkout) {
      checkout.innerHTML = '<button class="btn btn--forest btn--block" id="methodzCheckout">Secure Checkout — ' + money(cartTotal()) + '</button>' +
        '<p class="cart-note">Payments are securely processed by Methodz through Stripe in Canadian dollars.</p>';
      document.getElementById('methodzCheckout').onclick = beginMethodzCheckout;
    }
  }

  function beginMethodzCheckout() {
    var btn = document.getElementById('methodzCheckout');
    if (btn) { btn.disabled = true; btn.textContent = 'Opening secure checkout...'; }
    trackMethodz('checkout_started', { total: cartTotal(), value: cartTotal(), currency: 'CAD', itemCount: cartCount() });

    fetch(CFG.checkoutEndpoint || '/api/checkout', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        sessionId: sessionId(),
        items: cart.map(function (i) { return { id: i.id, variant: i.variant, quantity: i.qty }; })
      })
    })
      .then(function (res) { if (!res.ok) throw new Error('Checkout request failed'); return res.json(); })
      .then(function (data) {
        var url = data.checkoutUrl || data.url;
        if (!url) throw new Error('Checkout URL missing');
        window.location.assign(url);
      })
      .catch(function (err) {
        console.error(err);
        showToast('Checkout could not start. Please try again.');
        if (btn) { btn.disabled = false; btn.textContent = 'Secure Checkout — ' + money(cartTotal()); }
      });
  }

  function renderFAQ() {
    var list = document.getElementById('faqList');
    if (!list) return;
    list.innerHTML = FAQS.map(function (f) {
      return '<div class="faq-item"><button class="faq-q">' + f.q + '<span class="chev">▾</span></button><div class="faq-a"><p>' + f.a + '</p></div></div>';
    }).join('');
    list.querySelectorAll('.faq-q').forEach(function (q) {
      q.addEventListener('click', function () { q.parentElement.classList.toggle('open'); });
    });
  }

  function openCart() {
    document.getElementById('cartDrawer').classList.add('open');
    document.getElementById('cartOverlay').classList.add('open');
  }
  function closeCart() {
    document.getElementById('cartDrawer').classList.remove('open');
    document.getElementById('cartOverlay').classList.remove('open');
  }

  var toastTimer;
  function showToast(msg) {
    var t = document.getElementById('toast');
    if (!t) return;
    t.textContent = msg; t.classList.add('show'); clearTimeout(toastTimer);
    toastTimer = setTimeout(function () { t.classList.remove('show'); }, 2600);
  }

  window.handleContact = function (e) {
    e.preventDefault();
    var form = e.target;
    var submit = form.querySelector('button[type="submit"]');
    var originalText = submit ? submit.textContent : '';
    var email = document.getElementById('cemail').value.trim();
    var payload = {
      name: document.getElementById('cname').value.trim(),
      email: email,
      message: document.getElementById('cmsg').value.trim(),
      cart: cart,
      cartTotal: cartTotal(),
      currency: 'CAD',
      sessionId: sessionId(),
      pageUrl: window.location.href
    };
    if (submit) { submit.disabled = true; submit.textContent = 'Sending...'; }
    fetch('/api/contact', {
      method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload)
    })
      .then(function (res) {
        if (!res.ok) throw new Error('Contact request failed');
        trackMethodz('contact_submitted', { source: 'contact_form' }, email);
        showToast('Thanks! We\'ll be in touch soon.');
        form.reset();
      })
      .catch(function (err) {
        console.error(err);
        showToast('Message failed — please email ' + CFG.supportEmail + '.');
      })
      .finally(function () {
        if (submit) { submit.disabled = false; submit.textContent = originalText; }
      });
    return false;
  };

  document.addEventListener('DOMContentLoaded', function () {
    renderProducts(); renderFAQ(); renderCart(); updateCount();
    document.getElementById('year').textContent = new Date().getFullYear();
    document.getElementById('cartBtn').addEventListener('click', openCart);
    document.getElementById('cartClose').addEventListener('click', closeCart);
    document.getElementById('cartOverlay').addEventListener('click', closeCart);
    var navToggle = document.getElementById('navToggle');
    var navLinks = document.getElementById('navLinks');
    navToggle.addEventListener('click', function () { navLinks.classList.toggle('open'); });
    navLinks.querySelectorAll('a').forEach(function (a) {
      a.addEventListener('click', function () { navLinks.classList.remove('open'); });
    });
    trackMethodz('page_view', { path: window.location.pathname, title: document.title });
  });
})();
