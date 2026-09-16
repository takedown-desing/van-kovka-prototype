/* Прототип «Ван-Ковка»: интерактив без зависимостей. */
(function () {
  var d = document;
  function qs(s, r) { return (r || d).querySelector(s); }
  function qsa(s, r) { return Array.prototype.slice.call((r || d).querySelectorAll(s)); }

  /* Пометки блоков: показать / скрыть, состояние в localStorage */
  var toggle = qs('[data-toggle-tags]');
  try { if (localStorage.getItem('vk-hide-tags') === '1') d.body.classList.add('hide-tags'); } catch (e) {}
  function syncToggle() {
    if (!toggle) return;
    toggle.textContent = d.body.classList.contains('hide-tags') ? 'Показать пометки' : 'Скрыть пометки';
  }
  syncToggle();
  if (toggle) toggle.addEventListener('click', function () {
    d.body.classList.toggle('hide-tags');
    try { localStorage.setItem('vk-hide-tags', d.body.classList.contains('hide-tags') ? '1' : '0'); } catch (e) {}
    syncToggle();
  });

  /* Мобильное меню */
  var drawer = qs('.drawer');
  qsa('[data-open-menu]').forEach(function (b) { b.addEventListener('click', function () { drawer && drawer.classList.add('open'); }); });
  qsa('[data-close-menu]').forEach(function (b) { b.addEventListener('click', function () { drawer && drawer.classList.remove('open'); }); });
  if (drawer) drawer.addEventListener('click', function (e) { if (e.target === drawer) drawer.classList.remove('open'); });

  /* Модальное окно заявки: заголовок, подпись и товар подставляются из кнопки */
  var modal = qs('.modal');
  function openModal(title, sub, product) {
    if (!modal) return;
    if (title) qs('.modal h3').textContent = title;
    if (sub) qs('.modal .sub').textContent = sub;
    var pl = qs('.modal .prod-line');
    if (pl) pl.style.display = product ? 'flex' : 'none';
    if (pl && product) qs('.modal .prod-line span').textContent = product;
    modal.classList.add('open');
  }
  qsa('[data-ask]').forEach(function (b) {
    b.addEventListener('click', function (e) {
      e.preventDefault();
      openModal(b.getAttribute('data-ask-title'), b.getAttribute('data-ask-sub'), b.getAttribute('data-ask-product'));
    });
  });
  qsa('[data-close-modal]').forEach(function (b) { b.addEventListener('click', function () { modal && modal.classList.remove('open'); }); });
  if (modal) modal.addEventListener('click', function (e) { if (e.target === modal) modal.classList.remove('open'); });

  /* Все формы прототипа: не отправляем, показываем подтверждение */
  qsa('form').forEach(function (f) {
    f.addEventListener('submit', function (e) {
      e.preventDefault();
      var btn = qs('button[type="submit"]', f);
      var msg = f.getAttribute('data-done') || 'Принято, менеджер свяжется в течение 15 минут';
      if (btn) { btn.textContent = msg; btn.disabled = true; }
    });
  });

  /* Табы форм (замер / эскиз / вопрос) */
  qsa('.form-tabs').forEach(function (wrap) {
    var btns = qsa('button', wrap);
    btns.forEach(function (b) {
      b.addEventListener('click', function () {
        btns.forEach(function (x) { x.classList.remove('active'); });
        b.classList.add('active');
        var target = b.getAttribute('data-form');
        qsa('[data-form-panel]', wrap.parentNode).forEach(function (p) { p.style.display = p.getAttribute('data-form-panel') === target ? '' : 'none'; });
      });
    });
  });

  /* Табы-фильтры (портфолио по типу, отзывы) */
  qsa('[data-tabs]').forEach(function (wrap) {
    var tabs = qsa('.tab, a', wrap);
    var target = qs(wrap.getAttribute('data-tabs'));
    tabs.forEach(function (t) {
      t.addEventListener('click', function (e) {
        e.preventDefault();
        tabs.forEach(function (x) { x.classList.remove('active'); });
        t.classList.add('active');
        var f = t.getAttribute('data-filter');
        qsa('[data-type]', target).forEach(function (c) {
          var v = (c.getAttribute('data-type') || '').split(' ');
          c.style.display = (f === 'all' || v.indexOf(f) > -1) ? '' : 'none';
        });
      });
    });
  });

  /* Табы карточки */
  qsa('.p-tabs').forEach(function (wrap) {
    var btns = qsa('button', wrap);
    btns.forEach(function (b) {
      b.addEventListener('click', function () {
        btns.forEach(function (x) { x.classList.remove('active'); });
        b.classList.add('active');
        qsa('.p-panel').forEach(function (p) { p.classList.toggle('active', p.id === b.getAttribute('data-panel')); });
      });
    });
  });

  /* Галерея */
  var main = qs('.gallery .main img');
  var cap = qs('.gallery .main .chip');
  qsa('.gallery .thumbs div').forEach(function (t) {
    t.addEventListener('click', function () {
      qsa('.gallery .thumbs div').forEach(function (x) { x.classList.remove('active'); });
      t.classList.add('active');
      var img = qs('img', t);
      if (img && main) main.src = img.src;
      if (cap && t.getAttribute('data-cap')) cap.textContent = t.getAttribute('data-cap');
    });
  });

  /* Варианты в карточке: исполнение, покрытие, размеры, пересчёт цены «от» */
  function recalcProduct() {
    var base = qs('[data-base-price]');
    if (!base) return;
    var price = parseInt(base.getAttribute('data-base-price'), 10) || 0;
    var area = parseFloat((qs('[data-area]') || {}).value || base.getAttribute('data-area') || 1) || 1;
    var sum = price * area;
    qsa('.opt.on[data-add]').forEach(function (o) { sum += parseInt(o.getAttribute('data-add'), 10) || 0; });
    qsa('.sw.on[data-add]').forEach(function (o) { sum += (parseInt(o.getAttribute('data-add'), 10) || 0) * area; });
    var out = qs('[data-price-out]');
    if (out) out.textContent = 'от ' + Math.round(sum).toLocaleString('ru-RU') + ' ₽';
  }
  qsa('.opts').forEach(function (g) {
    qsa('.opt', g).forEach(function (o) {
      o.addEventListener('click', function () {
        qsa('.opt', g).forEach(function (x) { x.classList.remove('on'); });
        o.classList.add('on');
        recalcProduct();
      });
    });
  });
  qsa('.swatches').forEach(function (g) {
    qsa('.sw', g).forEach(function (o) {
      o.addEventListener('click', function () {
        qsa('.sw', g).forEach(function (x) { x.classList.remove('on'); });
        o.classList.add('on');
        recalcProduct();
      });
    });
  });
  var areaInput = qs('[data-area]');
  if (areaInput) areaInput.addEventListener('input', recalcProduct);
  recalcProduct();

  /* Фильтры листинга на мобильном */
  var filters = qs('.filters');
  qsa('[data-open-filters]').forEach(function (b) { b.addEventListener('click', function () { filters && filters.classList.add('open'); }); });
  qsa('[data-close-filters]').forEach(function (b) { b.addEventListener('click', function () { filters && filters.classList.remove('open'); }); });

  /* Сопутствующие товары: пересчёт суммы */
  function recalcCross() {
    var sum = 0;
    qsa('.cross input[type="checkbox"]:checked').forEach(function (c) { sum += parseInt(c.getAttribute('data-price') || '0', 10); });
    var out = qs('[data-cross-sum]');
    if (out) out.textContent = sum.toLocaleString('ru-RU') + ' ₽';
    var cnt = qs('[data-cross-cnt]');
    if (cnt) cnt.textContent = qsa('.cross input[type="checkbox"]:checked').length;
  }
  qsa('.cross input[type="checkbox"]').forEach(function (c) { c.addEventListener('change', recalcCross); });
  recalcCross();

  /* Корзина: количество и суммы */
  function recalcCart() {
    var total = 0, cnt = 0;
    qsa('.cart-item[data-price]').forEach(function (it) {
      var p = parseInt(it.getAttribute('data-price'), 10) || 0;
      var q = parseInt((qs('.qty input', it) || {}).value || 1, 10) || 1;
      var s = qs('.sum', it);
      if (s) s.textContent = (p * q).toLocaleString('ru-RU') + ' ₽';
      total += p * q; cnt += q;
    });
    var disc = total >= 45000 ? 0.10 : total >= 10000 ? 0.05 : 0;
    var t = qs('[data-cart-total]'); if (t) t.textContent = total.toLocaleString('ru-RU') + ' ₽';
    var dsc = qs('[data-cart-discount]'); if (dsc) dsc.textContent = disc ? '−' + Math.round(total * disc).toLocaleString('ru-RU') + ' ₽ (' + Math.round(disc * 100) + '%)' : 'нет';
    var g = qs('[data-cart-grand]'); if (g) g.textContent = Math.round(total * (1 - disc)).toLocaleString('ru-RU') + ' ₽';
    var c = qs('[data-cart-cnt]'); if (c) c.textContent = cnt;
    var bar = qs('.progress i'); if (bar) bar.style.width = Math.min(100, Math.round(total / 45000 * 100)) + '%';
    var next = qs('[data-cart-next]');
    if (next) next.textContent = total >= 45000 ? 'Максимальная скидка 10% применена' : total >= 10000 ? 'До скидки 10% не хватает ' + (45000 - total).toLocaleString('ru-RU') + ' ₽' : 'До скидки 5% не хватает ' + (10000 - total).toLocaleString('ru-RU') + ' ₽';
  }
  qsa('.cart-item .qty button').forEach(function (b) {
    b.addEventListener('click', function () {
      var inp = qs('input', b.parentNode);
      var v = parseInt(inp.value, 10) || 1;
      v = b.getAttribute('data-dir') === '-' ? Math.max(1, v - 1) : v + 1;
      inp.value = v; recalcCart();
    });
  });
  qsa('.cart-item .qty input').forEach(function (i) { i.addEventListener('input', recalcCart); });
  qsa('.cart-item .del').forEach(function (b) { b.addEventListener('click', function () { b.closest('.cart-item').remove(); recalcCart(); }); });
  qsa('.delivery-opt').forEach(function (o) {
    o.addEventListener('click', function () {
      qsa('.delivery-opt').forEach(function (x) { x.classList.remove('on'); });
      o.classList.add('on');
      var out = qs('[data-delivery-out]');
      if (out) out.textContent = o.getAttribute('data-cost') || '';
    });
  });
  recalcCart();

  /* Количество в карточках элементов */
  qsa('.el .qty button').forEach(function (b) {
    b.addEventListener('click', function () {
      var inp = qs('input', b.parentNode);
      var v = parseInt(inp.value, 10) || 1;
      inp.value = b.getAttribute('data-dir') === '-' ? Math.max(1, v - 1) : v + 1;
    });
  });

  /* Активная ссылка в панели прототипа */
  var path = location.pathname.split('/').pop();
  qsa('.proto-bar nav a').forEach(function (a) {
    if (a.getAttribute('href').split('/').pop() === path) a.classList.add('active');
  });
})();
