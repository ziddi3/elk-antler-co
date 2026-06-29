/* =====================================================================
   APP LOGIC  —  Elk & Antler Co.
   Renders products, manages cart (localStorage), drawer, PayPal checkout.
   ===================================================================== */
(function () {
  'use strict';

  var CFG = window.STORE_CONFIG;
  var PRODUCTS = window.PRODUCTS || [];
  var FAQS = window.FAQS || [];
  var CART_KEY = 'elk_antler_cart_v1';

  var money = function (n) {
    var sym = CFG.currency === 'CAD' ? 'CA$' : '$';
    return sym + Number(n).toFixed(2);
  };

  /* ---------- Cart state ---------- */
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
  function cartTotal() { return cartSubtotal() + shipping(); }

  function addToCart(productId, variantIndex) {
    var p = PRODUCTS.find(function (x) { return x.id === productId; });
    if (!p) return;
    var v = p.variants[variantIndex];
    var key = productId + '::' + variantIndex;
    var existing = cart.find(function (i) { return i.key === key; });
    if (existing) { existing.qty += 1; }
    else {
      cart.push({ key: key, id: p.id, name: p.name, variant: v.label, price: v.price, image: p.image, qty: 1 });
    }
    saveCart(); renderCart(); updateCount();
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

  /* ---------- Render products ---------- */
  function renderProducts() {
    var grid = document.getElementById('productGrid');
    if (!grid) return;
    grid.innerHTML = PRODUCTS.map(function (p) {
      var opts = p.variants.map(function (v, i) {
        return '<option value="' + i + '">' + v.label + ' — ' + money(v.price) + '</option>';
      }).join('');
      return '' +
        '<div class="product-card">' +
          '<div class="product-media">' +
            (p.tag ? '<span class="product-tag">' + p.tag + '</span>' : '') +
            '<img src="' + p.image + '" alt="' + p.name + '" />' +
          '</div>' +
          '<div class="product-body">' +
            '<div class="product-meta">' +
              '<h3 class="product-title">' + p.name + '</h3>' +
            '</div>' +
            '<div class="product-stars">' + (p.stars || '') + '</div>' +
            '<p class="product-desc">' + p.desc + '</p>' +
            '<div class="size-row">' +
              '<label for="sz-' + p.id + '">Choose size</label>' +
              '<select class="size-select" id="sz-' + p.id + '">' + opts + '</select>' +
            '</div>' +
            '<button class="btn btn--primary btn--block" data-add="' + p.id + '">Add to Cart</button>' +
          '</div>' +
        '</div>';
    }).join('');

    grid.querySelectorAll('[data-add]').forEach(function (btn) {
      btn.addEventListener('click', function () {
        var id = btn.getAttribute('data-add');
        var sel = document.getElementById('sz-' + id);
        addToCart(id, parseInt(sel.value, 10));
      });
    });
  }

  /* ---------- Render cart ---------- */
  function updateCount() {
    var el = document.getElementById('cartCount');
    if (el) el.textContent = cartCount();
  }

  function renderCart() {
    var wrap = document.getElementById('cartItems');
    var totalEl = document.getElementById('cartTotal');
    if (!wrap) return;

    if (cart.length === 0) {
      wrap.innerHTML = '<div class="cart-empty"><span class="ico">🛒</span>Your cart is empty.<br>Add some chews your pup will love!</div>';
      totalEl.textContent = money(0);
      renderPayPal();
      return;
    }

    wrap.innerHTML = cart.map(function (i) {
      return '' +
        '<div class="cart-item">' +
          '<img src="' + i.image + '" alt="' + i.name + '" />' +
          '<div class="cart-item-info">' +
            '<h4>' + i.name + '</h4>' +
            '<div class="ci-variant">' + i.variant + '</div>' +
            '<div class="ci-price">' + money(i.price) + '</div>' +
            '<div class="qty">' +
              '<button data-dec="' + i.key + '">−</button>' +
              '<span>' + i.qty + '</span>' +
              '<button data-inc="' + i.key + '">+</button>' +
            '</div><br>' +
            '<button class="ci-remove" data-rem="' + i.key + '">Remove</button>' +
          '</div>' +
        '</div>';
    }).join('');

    // shipping line
    var ship = shipping();
    var shipText = ship === 0
      ? '<div class="cart-note" style="margin:4px 0 0">🎉 You qualify for FREE shipping!</div>'
      : '<div class="cart-note" style="margin:4px 0 0">+ ' + money(ship) + ' shipping (free over ' + money(CFG.freeShippingThreshold) + ')</div>';
    wrap.insertAdjacentHTML('beforeend', shipText);

    totalEl.textContent = money(cartTotal());

    wrap.querySelectorAll('[data-inc]').forEach(function (b) { b.onclick = function () { changeQty(b.getAttribute('data-inc'), 1); }; });
    wrap.querySelectorAll('[data-dec]').forEach(function (b) { b.onclick = function () { changeQty(b.getAttribute('data-dec'), -1); }; });
    wrap.querySelectorAll('[data-rem]').forEach(function (b) { b.onclick = function () { removeItem(b.getAttribute('data-rem')); }; });

    renderPayPal();
  }

  /* ---------- PayPal ---------- */
  var paypalRendered = false;
  function isPayPalConfigured() {
    return CFG.paypalClientId && CFG.paypalClientId.indexOf('REPLACE_WITH') === -1;
  }

  function renderPayPal() {
    var container = document.getElementById('paypal-button-container');
    if (!container) return;
    container.innerHTML = '';
    paypalRendered = false;

    if (cart.length === 0) return;

    // DEMO mode if PayPal not configured yet
    if (!isPayPalConfigured() || !window.paypal) {
      container.innerHTML =
        '<button class="btn btn--forest btn--block" id="demoCheckout">Checkout — ' + money(cartTotal()) + '</button>' +
        '<p class="cart-note" style="color:#b08400">⚙️ Demo mode: add your PayPal Client ID in <strong>js/config.js</strong> to take real payments.</p>';
      var d = document.getElementById('demoCheckout');
      if (d) d.onclick = function () {
        showToast('Demo checkout — set up PayPal to go live!');
        alert('🧾 DEMO CHECKOUT\n\nOrder total: ' + money(cartTotal()) + '\n\nThis is a demo. Once Mom adds her PayPal Client ID in js/config.js, real PayPal buttons appear here and payments go straight to her account.');
      };
      return;
    }

    try {
      window.paypal.Buttons({
        style: { layout: 'vertical', color: 'gold', shape: 'pill', label: 'paypal' },
        createOrder: function (data, actions) {
          return actions.order.create({
            purchase_units: [{
              amount: {
                value: cartTotal().toFixed(2),
                currency_code: CFG.currency,
                breakdown: {
                  item_total: { value: cartSubtotal().toFixed(2), currency_code: CFG.currency },
                  shipping: { value: shipping().toFixed(2), currency_code: CFG.currency }
                }
              },
              items: cart.map(function (i) {
                return {
                  name: (i.name + ' — ' + i.variant).slice(0, 127),
                  quantity: String(i.qty),
                  unit_amount: { value: i.price.toFixed(2), currency_code: CFG.currency }
                };
              })
            }]
          });
        },
        onApprove: function (data, actions) {
          return actions.order.capture().then(function (details) {
            var name = (details.payer && details.payer.name && details.payer.name.given_name) || 'friend';
            cart = []; saveCart(); renderCart(); updateCount();
            closeCart();
            showToast('Thank you, ' + name + '! 🐾 Order confirmed.');
            alert('🎉 Thank you for your order, ' + name + '!\n\nYour payment was successful. A confirmation has been sent to your email by PayPal.');
          });
        },
        onError: function (err) {
          console.error(err);
          showToast('Something went wrong — please try again.');
        }
      }).render('#paypal-button-container');
      paypalRendered = true;
    } catch (e) {
      console.warn('PayPal render error', e);
    }
  }

  // Re-render PayPal once SDK finishes loading
  var ppWait = setInterval(function () {
    if (window.paypal && !paypalRendered && cart.length > 0) { renderCart(); }
    if (window.paypal) clearInterval(ppWait);
  }, 600);
  setTimeout(function(){ clearInterval(ppWait); }, 12000);

  /* ---------- FAQ ---------- */
  function renderFAQ() {
    var list = document.getElementById('faqList');
    if (!list) return;
    list.innerHTML = FAQS.map(function (f) {
      return '' +
        '<div class="faq-item">' +
          '<button class="faq-q">' + f.q + '<span class="chev">▾</span></button>' +
          '<div class="faq-a"><p>' + f.a + '</p></div>' +
        '</div>';
    }).join('');
    list.querySelectorAll('.faq-q').forEach(function (q) {
      q.addEventListener('click', function () {
        var item = q.parentElement;
        item.classList.toggle('open');
      });
    });
  }

  /* ---------- Cart drawer ---------- */
  function openCart() {
    document.getElementById('cartDrawer').classList.add('open');
    document.getElementById('cartOverlay').classList.add('open');
  }
  function closeCart() {
    document.getElementById('cartDrawer').classList.remove('open');
    document.getElementById('cartOverlay').classList.remove('open');
  }

  /* ---------- Toast ---------- */
  var toastTimer;
  function showToast(msg) {
    var t = document.getElementById('toast');
    if (!t) return;
    t.textContent = msg;
    t.classList.add('show');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(function () { t.classList.remove('show'); }, 2600);
  }

  /* ---------- Contact form ---------- */
  window.handleContact = function (e) {
    e.preventDefault();
    showToast('Thanks! We\'ll be in touch soon. 🐾');
    e.target.reset();
    return false;
  };

  /* ---------- Init ---------- */
  document.addEventListener('DOMContentLoaded', function () {
    renderProducts();
    renderFAQ();
    renderCart();
    updateCount();

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
  });
})();
