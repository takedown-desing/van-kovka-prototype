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


  /* Фильтры, быстрые переключатели и сортировка карточек (каталог, элементы, портфолио).
     Карточка: class="f-item" data-f="type=raspashnye;kalitka=otdelnaya;opts=avto,fonari;price=12500;pop=1;new=5".
     Управление внутри [data-filter-scope]: input[data-f="key=value"] (И между группами, ИЛИ внутри группы),
     [data-f-tabs] > [data-f-tab="выражение"] (одна активная вкладка в группе; "" = все),
     input[data-f-min="price"], input[data-f-max="price"], [data-f-sort="key:asc|desc"], [data-f-reset]. */
  function parseF(str) {
    var o = {};
    (str || '').split(';').forEach(function (p) {
      var kv = p.split('=');
      if (kv.length < 2) return;
      var v = kv[1].trim();
      o[kv[0].trim()] = v.indexOf(',') > -1 ? v.split(',') : v;
    });
    return o;
  }
  function testCond(d, cond) {
    var m = cond.match(/^([a-z_]+)(<=|>=|!=|=|<|>)(.+)$/);
    if (!m) return true;
    var k = m[1], op = m[2], v = m[3], iv = d[k];
    if (iv === undefined) return op === '!=';
    var arr = Array.isArray(iv) ? iv : [iv];
    if (op === '=') return arr.indexOf(v) > -1;
    if (op === '!=') return arr.indexOf(v) === -1;
    var n = parseFloat(arr[0]), t = parseFloat(v);
    if (op === '<') return n < t;
    if (op === '>') return n > t;
    if (op === '<=') return n <= t;
    return n >= t;
  }
  function testExpr(d, expr) {
    if (!expr) return true;
    return expr.split('&').every(function (c) { return testCond(d, c.trim()); });
  }
  qsa('[data-filter-scope]').forEach(function (scope) {
    var grid = qs('[data-f-grid]', scope) || scope;
    var items = qsa('.f-item', scope).map(function (el, i) { return { el: el, d: parseF(el.getAttribute('data-f')), i: i }; });
    var total = items.length;
    var tabGroups = qsa('[data-f-tabs]', scope);
    var sortLinks = qsa('[data-f-sort]', scope);
    var checks = qsa('input[data-f]', scope);
    var ranges = qsa('input[data-f-min], input[data-f-max]', scope);
    var leads = qsa('.lead-card', grid);
    var sortKey = null, sortDir = 1;
    var initSort = sortLinks.filter(function (x) { return x.classList.contains('active'); })[0];
    if (initSort) { var p0 = initSort.getAttribute('data-f-sort').split(':'); sortKey = p0[0]; sortDir = p0[1] === 'desc' ? -1 : 1; }

    function matches(it) {
      var d = it.d;
      var okTabs = tabGroups.every(function (g) { var a = qs('.active', g); return testExpr(d, a ? (a.getAttribute('data-f-tab') || '') : ''); });
      if (!okTabs) return false;
      var groups = {};
      checks.forEach(function (c) { if (!c.checked) return; var kv = c.getAttribute('data-f').split('='); (groups[kv[0]] = groups[kv[0]] || []).push(kv[1]); });
      for (var k in groups) {
        var arr = Array.isArray(d[k]) ? d[k] : [d[k]];
        if (!groups[k].some(function (v) { return arr.indexOf(v) > -1; })) return false;
      }
      for (var r = 0; r < ranges.length; r++) {
        var inp = ranges[r], v = parseFloat((inp.value || '').replace(/[^\d.]/g, ''));
        if (!v) continue;
        var key = inp.getAttribute('data-f-min') || inp.getAttribute('data-f-max');
        var val = parseFloat(d[key]);
        if (inp.hasAttribute('data-f-min') && val < v) return false;
        if (inp.hasAttribute('data-f-max') && val > v) return false;
      }
      return true;
    }
    function apply() {
      var shown = 0, order = items.slice();
      order.sort(function (a, b) { return sortKey ? (parseFloat(a.d[sortKey]) - parseFloat(b.d[sortKey])) * sortDir : a.i - b.i; });
      order.forEach(function (it) { var m = matches(it); it.el.style.display = m ? '' : 'none'; if (m) shown++; grid.appendChild(it.el); });
      var vis = order.filter(function (it) { return it.el.style.display !== 'none'; });
      leads.forEach(function (l, i) {
        var anchor = vis[Math.min(vis.length, (i + 1) * 6) - 1];
        if (anchor && vis.length > (i + 1) * 6 - 1) grid.insertBefore(l, anchor.el.nextSibling); else grid.appendChild(l);
      });
      var empty = qs('[data-f-empty]', scope);
      if (empty) { empty.style.display = shown ? 'none' : ''; grid.appendChild(empty); }
      qsa('[data-f-shown]', scope).forEach(function (e) { e.textContent = shown; });
      qsa('[data-f-total]', scope).forEach(function (e) { e.textContent = total; });
      var pager = qs('[data-f-pager]', scope);
      if (pager) pager.style.display = (shown === total && !sortKey) ? '' : 'none';
      qsa('[data-f-apply]', scope).forEach(function (b) { b.textContent = shown ? 'Показать ' + shown : 'Ничего не найдено'; });
    }
    /* Счётчики во вкладках и чекбоксах считаются по карточкам прототипа */
    qsa('[data-f-tab]', scope).forEach(function (t) {
      var n = qs('small', t);
      if (n) n.textContent = items.filter(function (it) { return testExpr(it.d, t.getAttribute('data-f-tab') || ''); }).length;
    });
    checks.forEach(function (c) {
      var lab = c.closest('label'), n = lab && qs('small', lab);
      if (n) { var kv = c.getAttribute('data-f').split('='); n.textContent = items.filter(function (it) { var arr = Array.isArray(it.d[kv[0]]) ? it.d[kv[0]] : [it.d[kv[0]]]; return arr.indexOf(kv[1]) > -1; }).length; }
    });
    function resetTabsToAll() {
      tabGroups.forEach(function (g) { if (!g.hasAttribute('data-f-preset')) return; qsa('[data-f-tab]', g).forEach(function (x) { x.classList.toggle('active', (x.getAttribute('data-f-tab') || '') === ''); }); });
    }
    tabGroups.forEach(function (g) {
      qsa('[data-f-tab]', g).forEach(function (t) {
        t.addEventListener('click', function (e) {
          e.preventDefault();
          qsa('[data-f-tab]', g).forEach(function (x) { x.classList.remove('active'); });
          t.classList.add('active');
          if (g.hasAttribute('data-f-preset')) { checks.forEach(function (c) { c.checked = false; }); ranges.forEach(function (i) { i.value = ''; }); }
          apply();
        });
      });
    });
    checks.forEach(function (c) { c.addEventListener('change', function () { resetTabsToAll(); apply(); }); });
    ranges.forEach(function (i) { i.addEventListener('input', function () { resetTabsToAll(); apply(); }); });
    sortLinks.forEach(function (s) {
      s.addEventListener('click', function (e) {
        e.preventDefault();
        sortLinks.forEach(function (x) { x.classList.remove('active'); });
        s.classList.add('active');
        var p = (s.getAttribute('data-f-sort') || '').split(':');
        sortKey = p[0] || null; sortDir = p[1] === 'desc' ? -1 : 1;
        apply();
      });
    });
    qsa('[data-f-reset]', scope).forEach(function (r) {
      r.addEventListener('click', function (e) {
        e.preventDefault();
        checks.forEach(function (c) { c.checked = false; });
        ranges.forEach(function (i) { i.value = ''; });
        tabGroups.forEach(function (g) { qsa('[data-f-tab]', g).forEach(function (x) { x.classList.toggle('active', (x.getAttribute('data-f-tab') || '') === ''); }); });
        if (initSort) { sortLinks.forEach(function (x) { x.classList.remove('active'); }); initSort.classList.add('active'); var p1 = initSort.getAttribute('data-f-sort').split(':'); sortKey = p1[0]; sortDir = p1[1] === 'desc' ? -1 : 1; }
        apply();
      });
    });
    apply();
  });


  /* Поиск по каталогу и артикулу: подсказки по мере ввода (в прототипе по списку примеров) */
  var SEARCH = [
    ['Кованые ворота и калитки', 'раздел, 27 эскизов', 'catalog.html'],
    ['Кованые ворота AV-026 с калиткой', 'эскиз, от 12 500 ₽ за м²', 'product.html'],
    ['Кованые заборы и ограждения', 'раздел, 54 эскиза', 'catalog.html'],
    ['Перила и лестницы кованые', 'раздел, 36 эскизов', 'catalog.html'],
    ['Козырьки и навесы кованые', 'раздел, 62 эскиза', 'catalog.html'],
    ['Мангалы кованые', 'раздел, 25 эскизов', 'catalog.html'],
    ['Балясина 5379', 'элемент, 570 ₽, в наличии', 'catalog.html#elements'],
    ['Балясина 11.002', 'элемент, 470 ₽, в наличии', 'catalog.html#elements'],
    ['Балясина композиционная 4813', 'элемент, 487 ₽, в наличии', 'catalog.html#elements'],
    ['Начальный столб 5818', 'элемент, 1 092 ₽, в наличии', 'catalog.html#elements'],
    ['Пика А9/12', 'элемент, в наличии', 'catalog.html#elements'],
    ['Листья кованые', 'раздел элементов, 242 позиции', 'catalog.html#elements'],
    ['Краски и патина', 'раздел элементов, 17 позиций', 'catalog.html#elements'],
    ['Интерьерный декор Glanzepol', 'раздел, 227 позиций', 'catalog.html#elements'],
    ['Распашные ворота в Домодедово', 'объект из портфолио', 'project.html'],
    ['Замер, доставка и монтаж', 'условия', 'order.html'],
    ['Контакты и схема проезда', 'страница', 'contacts.html']
  ];
  qsa('[data-search]').forEach(function (form) {
    var inp = qs('input', form), drop = qs('.search-drop', form);
    if (!inp || !drop) return;
    function render() {
      var q = inp.value.trim().toLowerCase();
      if (!q) { drop.classList.remove('open'); return; }
      var words = q.split(/\s+/);
      var res = SEARCH.filter(function (r) { var t = (r[0] + ' ' + r[1]).toLowerCase(); return words.every(function (w) { return t.indexOf(w) > -1; }); }).slice(0, 6);
      drop.innerHTML = res.length
        ? res.map(function (r) { return '<a href="' + r[2] + '"><b>' + r[0] + '</b><span>' + r[1] + '</span></a>'; }).join('')
        : '<div class="none">Ничего не найдено. Пришлите фото или артикул в WhatsApp, подберём вручную.</div>';
      drop.classList.add('open');
    }
    inp.addEventListener('input', render);
    inp.addEventListener('focus', render);
    inp.addEventListener('keydown', function (e) { if (e.key === 'Escape') { drop.classList.remove('open'); inp.blur(); } });
    d.addEventListener('click', function (e) { if (!form.contains(e.target)) drop.classList.remove('open'); });
    form.addEventListener('submit', function (e) { var first = qs('a', drop); if (first) { e.preventDefault(); location.href = first.getAttribute('href'); } });
  });

  /* Активная ссылка в панели прототипа */
  var path = location.pathname.split('/').pop();
  qsa('.proto-bar nav a').forEach(function (a) {
    if (a.getAttribute('href').split('/').pop() === path) a.classList.add('active');
  });
})();
