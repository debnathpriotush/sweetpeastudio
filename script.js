(function () {
  'use strict';

  /* ---------- Sample content (used in preview mode, when the page is opened by double-click) ---------- */
  var SAMPLE = {
    shop: {
      shopName: 'Sweet Pea Studio', logo: '',
      headline: 'Handmade with love, made to make you smile',
      tagline: 'Cute hair accessories and little gifts, made by hand in Sylhet',
      ownerName: 'Nusrat Jahan',
      story: "Hi, I'm Nusrat! I started Sweet Pea Studio from my bedroom table with a pack of ribbons and a lot of patience. Every piece is made by hand with soft fabrics and happy colours.",
      ownerPhoto: '', whatsapp: '8801XXXXXXXXX',
      instagram: 'https://instagram.com/sweetpeastudio', facebook: 'https://facebook.com/sweetpeastudio',
      currency: '৳',
      sellingPoints: ['100% handmade, no two are exactly alike', 'Soft, skin-friendly fabrics', 'Gift wrapping available on request'],
      goodToKnow: ['Delivery takes 2 to 3 days inside Sylhet and 4 to 6 days outside Sylhet', 'Colours may look slightly different on your screen', 'Exchange within 3 days if the item arrives damaged'],
      deliveryInside: 60, deliveryOutside: 120,
      paymentNote: 'Cash on delivery, or bKash 01XXXXXXXXX (send money, then share the transaction ID on WhatsApp).'
    },
    categories: [
      { name: 'Hair Bands', emoji: '🎀', image: '', hidden: false },
      { name: 'Scrunchies', emoji: '🌸', image: '', hidden: false },
      { name: 'Keychains', emoji: '🔑', image: '', hidden: false },
      { name: 'Gift Boxes', emoji: '🎁', image: '', hidden: false }
    ],
    products: [
      { code: 'gb-001', name: 'Mini Surprise Gift Box', category: 'Gift Boxes', price: 850, salePrice: 699, emoji: '🎁', soldOut: false, description: 'A cute box filled with 2 hair bands, 1 scrunchie and a keychain, wrapped with a ribbon.', sizes: ['Small', 'Large'], qa: [{ question: 'Can I choose the colours?', answer: 'Yes! Tell us your favourite colours on WhatsApp.' }] },
      { code: 'hb-001', name: 'Lavender Bow Hair Band', category: 'Hair Bands', price: 180, emoji: '🎀', soldOut: false, description: 'A soft padded hair band with a handmade lavender bow.', sizes: [], qa: [] },
      { code: 'hb-002', name: 'Mint Pearl Hair Band', category: 'Hair Bands', price: 220, salePrice: 180, emoji: '🤍', soldOut: false, description: 'Mint green hair band decorated with tiny pearl beads.', sizes: [], qa: [] },
      { code: 'sc-001', name: 'Satin Scrunchie Set (3 pcs)', category: 'Scrunchies', price: 300, emoji: '🌸', soldOut: false, description: 'Three silky satin scrunchies in pink, lilac and mint.', sizes: ['Regular', 'Jumbo'], qa: [] },
      { code: 'sc-002', name: 'Floral Cotton Scrunchie', category: 'Scrunchies', price: 120, emoji: '🌼', soldOut: true, description: 'Soft cotton scrunchie in a small floral print.', sizes: [], qa: [] },
      { code: 'kc-001', name: 'Cherry Blossom Keychain', category: 'Keychains', price: 150, salePrice: 120, emoji: '🌸', soldOut: false, description: 'A tiny handmade blossom charm on a strong metal ring.', sizes: [], qa: [] },
      { code: 'kc-002', name: 'Tiny Teddy Keychain', category: 'Keychains', price: 200, emoji: '🧸', soldOut: false, description: 'A cuddly little hand-stitched teddy keychain.', sizes: [], qa: [] }
    ]
  };

  /* ---------- Shared helpers (also used by product.html and order.js) ---------- */
  var S = window.Shop = { shop: {}, cats: [], products: [], preview: false };

  S.esc = function (s) {
    return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
    });
  };

  S.img = function (p) {
    if (!p) return '';
    if (/^(https?:|data:)/.test(p)) return p;
    return String(p).replace(/^\/+/, '');
  };

  S.money = function (n) {
    return (S.shop.currency || '৳') + Number(n).toLocaleString('en-US');
  };

  S.onSale = function (p) {
    var s = Number(p.salePrice), pr = Number(p.price);
    return s > 0 && pr > 0 && s < pr;
  };
  S.finalPrice = function (p) { return S.onSale(p) ? Number(p.salePrice) : Number(p.price); };
  S.percent = function (p) { return Math.max(1, Math.round((1 - Number(p.salePrice) / Number(p.price)) * 100)); };

  S.priceHtml = function (p) {
    if (S.onSale(p)) return S.money(p.salePrice) + '<span class="old">' + S.money(p.price) + '</span>';
    return S.money(p.price);
  };
  S.badgeHtml = function (p) {
    return S.onSale(p) ? '<span class="badge">' + S.percent(p) + '% OFF</span>' : '';
  };

  S.productUrl = function (p) {
    return new URL('product.html?p=' + encodeURIComponent(p.code), location.href).href;
  };

  S.waLink = function (msg) {
    var num = String(S.shop.whatsapp || '').replace(/\D/g, '');
    return 'https://wa.me/' + num + (msg ? '?text=' + encodeURIComponent(msg) : '');
  };

  S.orderMessage = function (p) {
    var price = S.onSale(p)
      ? S.money(p.salePrice) + ' (sale price, was ' + S.money(p.price) + ')'
      : S.money(p.price);
    return 'Hi! I would like to order:\n\n🛍️ ' + p.name + '\n💰 ' + price + '\n🔗 ' + S.productUrl(p);
  };

  S.tint = function (i) { return 't' + (i % 4); };

  S.hiddenCats = function () {
    var h = {};
    S.cats.forEach(function (c) { if (c.hidden) h[c.name] = true; });
    return h;
  };
  S.visibleCats = function () { return S.cats.filter(function (c) { return !c.hidden; }); };
  S.visibleProducts = function () {
    var h = S.hiddenCats();
    return S.products.filter(function (p) { return !h[p.category]; });
  };
  S.findProduct = function (code) {
    for (var i = 0; i < S.products.length; i++) if (S.products[i].code === code) return S.products[i];
    return null;
  };

  S.thumbInner = function (p) {
    if (p.photo) return '<img src="' + S.esc(S.img(p.photo)) + '" alt="' + S.esc(p.name) + '" loading="lazy">';
    return S.esc(p.emoji || '🎁');
  };

  S.cardHtml = function (p, i) {
    var action;
    if (p.soldOut) action = '<span class="sold">Sold out</span>';
    else if (typeof window.openOrder === 'function')
      action = '<button class="btn btn-wa" type="button" data-order="' + S.esc(p.code) + '">🛒 Order</button>';
    else
      action = '<a class="btn btn-wa" target="_blank" rel="noopener" href="' + S.esc(S.waLink(S.orderMessage(p))) + '">💬 Order on WhatsApp</a>';

    return '<article class="card">' +
      '<a class="card-link" href="product.html?p=' + encodeURIComponent(p.code) + '">' +
        '<div class="card-img ' + S.tint(i) + '">' + S.thumbInner(p) + S.badgeHtml(p) + '</div>' +
        '<div class="card-body">' +
          '<div class="card-cat">' + S.esc(p.category || '') + '</div>' +
          '<div class="card-name">' + S.esc(p.name) + '</div>' +
          '<div class="price">' + S.priceHtml(p) + '</div>' +
        '</div>' +
      '</a>' +
      '<div class="card-act">' + action + '</div>' +
    '</article>';
  };

  function fetchJson(url) {
    return fetch(url + '?v=' + Date.now()).then(function (r) {
      if (!r.ok) throw new Error('Could not load ' + url);
      return r.json();
    });
  }

  S.load = function () {
    var done = function (shop, cats, prods) {
      S.shop = shop || {};
      S.cats = (cats && cats.categories) || [];
      S.products = ((prods && prods.products) || []).map(function (p, i) {
        if (!p.code) p.code = 'item-' + (i + 1);
        return p;
      });
      return S;
    };
    if (location.protocol === 'file:') {
      S.preview = true;
      return Promise.resolve(done(SAMPLE.shop, { categories: SAMPLE.categories }, { products: SAMPLE.products }));
    }
    return Promise.all([
      fetchJson('content/shop.json'),
      fetchJson('content/categories.json'),
      fetchJson('content/products.json')
    ]).then(function (r) { return done(r[0], r[1], r[2]); });
  };

  function $(id) { return document.getElementById(id); }

  S.applyCommon = function () {
    var sh = S.shop;
    if (S.preview && $('previewBar')) $('previewBar').hidden = false;

    document.title = sh.shopName || 'Shop';
    if ($('shopName')) $('shopName').textContent = sh.shopName || '';
    if ($('footName')) $('footName').textContent = sh.shopName || '';
    if ($('year')) $('year').textContent = new Date().getFullYear();

    if (sh.logo && $('logo')) {
      $('logo').src = S.img(sh.logo);
      $('logo').alt = sh.shopName || '';
      $('logo').hidden = false;
    }

    var fav = $('favicon');
    if (fav) {
      if (sh.logo) {
        fav.href = S.img(sh.logo);
      } else {
        var letter = (sh.shopName || 'S').charAt(0).toUpperCase();
        var svg = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64"><circle cx="32" cy="32" r="32" fill="#7a5bd0"/><text x="32" y="43" font-size="34" text-anchor="middle" fill="#fff" font-family="Arial" font-weight="700">' + letter + '</text></svg>';
        fav.href = 'data:image/svg+xml,' + encodeURIComponent(svg);
      }
    }

    var hello = S.waLink('Hi ' + (sh.shopName || '') + '! I have a question 😊');
    ['topWa', 'heroWa', 'footWa'].forEach(function (id) { if ($(id)) $(id).href = hello; });

    if ($('fb') && sh.facebook) { $('fb').href = sh.facebook; $('fb').hidden = false; }
    if ($('ig') && sh.instagram) { $('ig').href = sh.instagram; $('ig').hidden = false; }
  };

  /* ---------- Shop page ---------- */
  var PER_PAGE = 12;
  var state = { cat: '', q: '', page: 1 };
  var scrollTimer = null;

  function filtered() {
    var q = state.q.trim().toLowerCase();
    return S.visibleProducts().filter(function (p) {
      if (state.cat && p.category !== state.cat) return false;
      if (!q) return true;
      return ((p.name || '') + ' ' + (p.category || '') + ' ' + (p.description || '')).toLowerCase().indexOf(q) > -1;
    });
  }

  function renderChips() {
    var h = '<button class="chip' + (state.cat === '' ? ' active' : '') + '" data-cat=""><span class="ci">✨</span>All</button>';
    S.visibleCats().forEach(function (c) {
      var ico = c.image ? '<img src="' + S.esc(S.img(c.image)) + '" alt="" loading="lazy">' : S.esc(c.emoji || '•');
      h += '<button class="chip' + (state.cat === c.name ? ' active' : '') + '" data-cat="' + S.esc(c.name) + '"><span class="ci">' + ico + '</span>' + S.esc(c.name) + '</button>';
    });
    $('chips').innerHTML = h;
  }

  function pagerHtml(pages) {
    if (pages <= 1) return '';
    var h = '<button data-pg="prev"' + (state.page === 1 ? ' disabled' : '') + '>‹ Prev</button>';
    var last = 0;
    for (var i = 1; i <= pages; i++) {
      if (i === 1 || i === pages || Math.abs(i - state.page) <= 1) {
        if (last && i - last > 1) h += '<button disabled>…</button>';
        h += '<button data-pg="' + i + '"' + (i === state.page ? ' class="active"' : '') + '>' + i + '</button>';
        last = i;
      }
    }
    h += '<button data-pg="next"' + (state.page === pages ? ' disabled' : '') + '>Next ›</button>';
    return h;
  }

  function render() {
    renderChips();
    var list = filtered();
    var n = list.length;
    var pages = Math.max(1, Math.ceil(n / PER_PAGE));
    if (state.page > pages) state.page = pages;
    var start = (state.page - 1) * PER_PAGE;
    var slice = list.slice(start, start + PER_PAGE);
    var q = state.q.trim();

    var text;
    if (q) text = n + (n === 1 ? ' result' : ' results') + ' for “' + q + '”';
    else if (state.cat) text = n + (n === 1 ? ' product' : ' products') + ' in ' + state.cat;
    else text = 'Showing all ' + n + (n === 1 ? ' product' : ' products');
    $('resultCount').textContent = text;

    if (!n) {
      $('grid').innerHTML = '';
      $('grid').hidden = true;
      $('pager').innerHTML = '';
      $('empty').hidden = false;
      $('emptyWa').href = S.waLink(q ? 'Hi! I am looking for "' + q + '". Do you have it?' : 'Hi! I am looking for something. Can you help?');
      return;
    }
    $('empty').hidden = true;
    $('grid').hidden = false;
    $('grid').innerHTML = slice.map(function (p) { return S.cardHtml(p, S.products.indexOf(p)); }).join('');
    $('pager').innerHTML = pagerHtml(pages);
  }

  function initShop() {
    var sh = S.shop;

    $('headline').textContent = sh.headline || '';
    $('tagline').textContent = sh.tagline || '';

    var pts = (sh.sellingPoints || []).filter(Boolean);
    if (pts.length) $('points').innerHTML = pts.map(function (t) { return '<li>' + S.esc(t) + '</li>'; }).join('');
    else $('points').hidden = true;

    $('collage').innerHTML = S.visibleProducts().slice(0, 3).map(function (p) {
      return '<div class="c ' + S.tint(S.products.indexOf(p)) + '">' + S.thumbInner(p) + '</div>';
    }).join('');

    var story = (sh.story || '').trim();
    if (story) {
      $('about').hidden = false;
      $('story').textContent = story;
      if (sh.ownerName) $('ownerName').textContent = sh.ownerName;
      else $('ownerName').textContent = sh.shopName || 'us';
      if (sh.ownerPhoto) { $('ownerPhoto').src = S.img(sh.ownerPhoto); $('ownerPhoto').hidden = false; }
    }

    var know = (sh.goodToKnow || []).filter(Boolean);
    if (know.length) $('knowList').innerHTML = know.map(function (t) { return '<li>' + S.esc(t) + '</li>'; }).join('');
    else $('knowBox').hidden = true;

    // events
    $('chips').addEventListener('click', function (e) {
      var b = e.target.closest('[data-cat]');
      if (!b) return;
      state.cat = b.getAttribute('data-cat');
      state.page = 1;
      render();
    });

    $('search').addEventListener('input', function () {
      state.q = this.value;
      state.page = 1;
      $('clearSearch').hidden = !this.value;
      render();
      clearTimeout(scrollTimer);
      if (this.value.trim()) {
        scrollTimer = setTimeout(function () {
          $('results').scrollIntoView({ behavior: 'smooth', block: 'start' });
        }, 500);
      }
    });

    $('clearSearch').addEventListener('click', function () {
      $('search').value = '';
      state.q = '';
      state.page = 1;
      this.hidden = true;
      render();
      $('search').focus();
    });

    $('pager').addEventListener('click', function (e) {
      var b = e.target.closest('[data-pg]');
      if (!b || b.disabled) return;
      var v = b.getAttribute('data-pg');
      if (v === 'prev') state.page--;
      else if (v === 'next') state.page++;
      else state.page = parseInt(v, 10);
      render();
      $('shopTop').scrollIntoView({ behavior: 'smooth', block: 'start' });
    });

    $('grid').addEventListener('click', function (e) {
      var b = e.target.closest('[data-order]');
      if (!b) return;
      var p = S.findProduct(b.getAttribute('data-order'));
      if (p && typeof window.openOrder === 'function') window.openOrder(p);
    });

    render();
  }

  if ($('grid')) {
    S.load().then(function () {
      S.applyCommon();
      initShop();
    }).catch(function () {
      $('grid').innerHTML = '<div class="msg" style="grid-column:1/-1"><div class="empty-emoji">😕</div><h2>Something went wrong</h2><p>We could not load the shop right now. Please refresh the page.</p></div>';
    });
  }
})();