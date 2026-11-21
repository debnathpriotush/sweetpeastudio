(function () {
  'use strict';
  var S = window.Shop;
  var modal = null;
  var cur = null;
  var qty = 1;

  function $(id) { return document.getElementById(id); }

  function close() {
    if (modal) { modal.remove(); modal = null; }
    document.body.style.overflow = '';
  }

  function validPhone(v) {
    var d = String(v).replace(/[\s-]/g, '');
    return /^(?:\+?88)?01[3-9]\d{8}$/.test(d);
  }

  function cleanPhone(v) {
    var d = String(v).replace(/[\s-]/g, '').replace(/^\+?88/, '');
    return d;
  }

  function deliveryCharge() {
    var d = $('o_district').value;
    if (d === 'inside') return Number(S.shop.deliveryInside) || 0;
    if (d === 'outside') return Number(S.shop.deliveryOutside) || 0;
    return 0;
  }

  function updateTotal() {
    var unit = S.finalPrice(cur);
    var items = unit * qty;
    var del = deliveryCharge();
    var hasDistrict = !!$('o_district').value;
    $('o_qty').textContent = qty;
    $('t_items').textContent = S.money(items);
    $('t_del').textContent = hasDistrict ? S.money(del) : '—';
    $('t_total').textContent = S.money(items + del);
  }

  function setErr(id, msg) {
    var f = $(id).closest('.field');
    var old = f.querySelector('.err');
    if (old) old.remove();
    f.classList.remove('bad');
    if (msg) {
      f.classList.add('bad');
      var e = document.createElement('div');
      e.className = 'err';
      e.textContent = msg;
      f.appendChild(e);
    }
  }

  function validate() {
    var ok = true, first = null;
    function check(id, bad, msg) {
      if (bad) { setErr(id, msg); ok = false; if (!first) first = $(id); }
      else setErr(id, '');
    }
    if ($('o_size')) check('o_size', !$('o_size').value, 'Please choose a size.');
    check('o_name', !$('o_name').value.trim(), 'Please enter your name.');
    var ph = $('o_phone').value.trim();
    check('o_phone', !ph ? true : !validPhone(ph),
      !ph ? 'Please enter your mobile number.' : 'Enter a valid mobile number, like 01712345678.');
    check('o_district', !$('o_district').value, 'Please choose Inside Sylhet or Outside Sylhet.');
    check('o_address', !$('o_address').value.trim(), 'Please enter your delivery address.');
    if (first) first.focus();
    return ok;
  }

  function buildMessage() {
    var unit = S.finalPrice(cur);
    var del = deliveryCharge();
    var total = unit * qty + del;
    var inside = $('o_district').value === 'inside';
    var lines = [];
    lines.push('Hi! I would like to place an order 🛍️');
    lines.push('');
    lines.push('Product: ' + cur.name);
    if ($('o_size')) lines.push('Size: ' + $('o_size').value);
    lines.push('Price: ' + S.money(unit) + (S.onSale(cur) ? ' (sale price, was ' + S.money(cur.price) + ')' : ''));
    lines.push('Quantity: ' + qty);
    lines.push('Delivery: ' + S.money(del) + (inside ? ' (Inside Sylhet)' : ' (Outside Sylhet)'));
    lines.push('Total: ' + S.money(total));
    lines.push('');
    lines.push('Name: ' + $('o_name').value.trim());
    lines.push('Mobile: ' + cleanPhone($('o_phone').value));
    lines.push('Address: ' + $('o_address').value.trim());
    var note = $('o_note').value.trim();
    if (note) lines.push('Note: ' + note);
    lines.push('');
    lines.push('Product link: ' + S.productUrl(cur));
    return lines.join('\n');
  }

  function open(p) {
    cur = p;
    qty = 1;
    close();

    var sh = S.shop;
    var sizes = (p.sizes || []).filter(Boolean);
    var sizeField = '';
    if (sizes.length) {
      sizeField =
        '<div class="field"><label for="o_size">Size</label>' +
        '<select id="o_size"><option value="">Choose a size</option>' +
        sizes.map(function (s) { return '<option>' + S.esc(s) + '</option>'; }).join('') +
        '</select></div>';
    }

    var pay = (sh.paymentNote || '').trim();

    modal = document.createElement('div');
    modal.className = 'modal';
    modal.innerHTML =
      '<div class="modal-box" role="dialog" aria-modal="true" aria-label="Order">' +
        '<button class="modal-x" type="button" id="o_close" aria-label="Close">✕</button>' +
        '<h3>Place your order</h3>' +
        '<div class="modal-prod">' + S.esc(p.name) + ' · <b>' + S.priceHtml(p).replace(/<span class="old">.*?<\/span>/, '') + '</b></div>' +
        sizeField +
        '<div class="field"><label>Quantity</label>' +
          '<div class="qty"><button type="button" id="o_minus" aria-label="Less">−</button>' +
          '<span id="o_qty">1</span>' +
          '<button type="button" id="o_plus" aria-label="More">+</button></div></div>' +
        '<div class="field"><label for="o_name">Your name</label><input id="o_name" type="text" autocomplete="name"></div>' +
        '<div class="field"><label for="o_phone">Mobile number</label><input id="o_phone" type="tel" inputmode="tel" placeholder="01XXXXXXXXX" autocomplete="tel"></div>' +
        '<div class="field"><label for="o_district">Delivery area</label>' +
          '<select id="o_district"><option value="">Choose area</option>' +
          '<option value="inside">Inside Sylhet</option><option value="outside">Outside Sylhet</option></select>' +
          '<div class="note">Delivery charge: ' + S.money(sh.deliveryInside || 0) + ' inside Sylhet, ' + S.money(sh.deliveryOutside || 0) + ' outside Sylhet</div></div>' +
        '<div class="field"><label for="o_address">Delivery address</label><textarea id="o_address" autocomplete="street-address"></textarea></div>' +
        '<div class="field"><label for="o_note">Note (optional)</label><textarea id="o_note" placeholder="Colour choice, gift message, anything else"></textarea></div>' +
        '<div class="total-box">' +
          '<div class="total-row"><span>Items</span><span id="t_items"></span></div>' +
          '<div class="total-row"><span>Delivery</span><span id="t_del"></span></div>' +
          '<div class="total-row big"><span>Total</span><span id="t_total"></span></div>' +
        '</div>' +
        (pay ? '<div class="pay-note">💳 ' + S.esc(pay) + '</div>' : '') +
        '<button class="btn btn-wa block" type="button" id="o_send">💬 Send order on WhatsApp</button>' +
      '</div>';

    document.body.appendChild(modal);
    document.body.style.overflow = 'hidden';

    modal.addEventListener('click', function (e) { if (e.target === modal) close(); });
    $('o_close').addEventListener('click', close);
    $('o_minus').addEventListener('click', function () { if (qty > 1) { qty--; updateTotal(); } });
    $('o_plus').addEventListener('click', function () { if (qty < 50) { qty++; updateTotal(); } });
    $('o_district').addEventListener('change', function () { setErr('o_district', ''); updateTotal(); });
    ['o_name', 'o_phone', 'o_address'].forEach(function (id) {
      $(id).addEventListener('input', function () { setErr(id, ''); });
    });
    if ($('o_size')) $('o_size').addEventListener('change', function () { setErr('o_size', ''); });

    $('o_send').addEventListener('click', function () {
      if (!validate()) return;
      window.open(S.waLink(buildMessage()), '_blank');
      close();
    });

    updateTotal();
  }

  document.addEventListener('keydown', function (e) { if (e.key === 'Escape') close(); });

  window.openOrder = open;
})();