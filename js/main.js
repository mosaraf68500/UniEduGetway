(function () {
  var $ = function (id) { return document.getElementById(id); };

  // Mobile menu
  var tg = document.querySelector('[data-js="hdr-toggle"]');
  var menu = document.querySelector('[data-js="hdr-menu"]');
  if (tg && menu) {
    var setMenu = function (open) { menu.hidden = !open; tg.textContent = open ? 'Close \u2715' : 'Menu \u2630'; };
    tg.addEventListener('click', function () { setMenu(menu.hidden); });
    menu.querySelectorAll('a').forEach(function (a) { a.addEventListener('click', function () { setMenu(false); }); });
  }

  // FAQ accordion
  var faqs = Array.prototype.slice.call(document.querySelectorAll('[data-js="faq-btn"]'));
  var cur = 0;
  var setFaq = function (i) {
    faqs.forEach(function (b, j) {
      var open = j === i;
      b.nextElementSibling.hidden = !open;
      b.querySelector('[data-js="faq-icon"]').textContent = open ? '\u00d7' : '+';
      b.setAttribute('aria-expanded', open);
    });
  };
  if (faqs.length) setFaq(0);
  faqs.forEach(function (b, i) { b.addEventListener('click', function () { cur = cur === i ? -1 : i; setFaq(cur); }); });

  // Forms (show thank-you message)
  document.querySelectorAll('[data-js="form"]').forEach(function (f) {
    var wrap = f.closest('[data-js="formwrap"]');
    var thanks = wrap.parentElement.querySelector('[data-js="thanks"]');
    f.addEventListener('submit', function (e) { e.preventDefault(); wrap.hidden = true; thanks.hidden = false; f.reset(); });
    var r = thanks.querySelector('[data-js="reset"]');
    if (r) r.addEventListener('click', function () { thanks.hidden = true; wrap.hidden = false; });
  });

  // Courses search + filters
  var results = $('f-results');
  if (!results) return;
  var grid = results.firstElementChild;
  var cards = Array.prototype.slice.call(grid.querySelectorAll('article[data-course]'));
  var s = { q: '', uni: '', subject: '', level: '', mode: '', fin: false, sort: 'rec' };
  var uniNames = {};
  Array.prototype.forEach.call($('f-uni').options, function (o) { if (o.value) uniNames[o.value] = o.textContent; });
  var chips = Array.prototype.slice.call(document.querySelectorAll('[data-chip]'));
  var cnt = $('f-count'), ctx = cnt.nextElementSibling;
  var clearWrap = document.querySelector('[data-js="clear-wrap"]');
  var finBtn = $('f-fin'), finBox = finBtn.querySelector('[data-js="fin-box"]');
  var sorts = {
    rec: function (a, b) { return a.dataset.course - b.dataset.course; },
    az: function (a, b) { return a.dataset.title.localeCompare(b.dataset.title); },
    short: function (a, b) { return a.dataset.years - b.dataset.years; },
    fee: function (a, b) { return ((+a.dataset.fee) || 1e9) - ((+b.dataset.fee) || 1e9); }
  };
  var jump = function () {
    var el = $('courses');
    if (el) window.scrollTo({ top: el.getBoundingClientRect().top + window.scrollY - 75, behavior: 'smooth' });
  };
  var render = function () {
    var q = s.q.trim().toLowerCase();
    var list = cards.filter(function (c) {
      var d = c.dataset;
      return (!s.uni || d.uni === s.uni) && (!s.subject || d.subject === s.subject) && (!s.level || d.level === s.level) &&
        (!s.mode || d.mode === s.mode) && (!s.fin || d.fin === '1') && (!q || d.search.indexOf(q) !== -1);
    }).sort(sorts[s.sort] || sorts.rec);
    cards.forEach(function (c) { c.hidden = true; });
    list.forEach(function (c) { c.hidden = false; grid.appendChild(c); });
    cnt.textContent = list.length === 1 ? '1 course' : list.length + ' courses';
    var parts = [s.uni && uniNames[s.uni], s.subject, s.level, s.mode, s.fin && 'Finance eligible', q && '\u201c' + s.q.trim() + '\u201d'].filter(Boolean);
    ctx.textContent = parts.length ? 'Filtered by: ' + parts.join(' \u00b7 ') : 'Showing all courses across ' + Object.keys(uniNames).length + ' partner universities';
    clearWrap.style.display = parts.length ? 'contents' : 'none';
    results.hidden = !list.length;
    $('f-empty').hidden = !!list.length;
    chips.forEach(function (b) {
      var on = b.dataset.chip === s.subject;
      b.style.background = on ? '#1F4F9F' : '#fff';
      b.style.color = on ? '#fff' : '#161C2D';
      b.style.borderColor = on ? '#1F4F9F' : '#DCE2EC';
    });
    finBtn.setAttribute('aria-pressed', s.fin);
    finBtn.style.borderColor = s.fin ? '#1F4F9F' : '#C3CCDD';
    finBtn.style.background = s.fin ? '#EEF3FD' : '#fff';
    finBox.style.borderColor = s.fin ? '#1F4F9F' : '#C3CCDD';
    finBox.style.background = s.fin ? '#1F4F9F' : '#fff';
    finBox.textContent = s.fin ? '\u2713' : '';
    ['uni', 'subject', 'level', 'mode', 'sort'].forEach(function (k) { $('f-' + k).value = s[k]; });
    if ($('f-q').value !== s.q) $('f-q').value = s.q;
  };
  ['uni', 'subject', 'level', 'mode', 'sort'].forEach(function (k) {
    $('f-' + k).addEventListener('change', function (e) { s[k] = e.target.value; render(); });
  });
  $('f-q').addEventListener('input', function (e) { s.q = e.target.value; render(); });
  $('f-search').addEventListener('submit', function (e) { e.preventDefault(); jump(); });
  chips.forEach(function (b) { b.addEventListener('click', function () { s.subject = s.subject === b.dataset.chip ? '' : b.dataset.chip; render(); jump(); }); });
  finBtn.addEventListener('click', function () { s.fin = !s.fin; render(); });
  document.querySelectorAll('[data-js="clear"]').forEach(function (b) {
    b.addEventListener('click', function () { s.q = ''; s.uni = ''; s.subject = ''; s.level = ''; s.mode = ''; s.fin = false; s.sort = 'rec'; render(); });
  });
  grid.addEventListener('click', function (e) {
    var t = e.target.closest('[data-js="toggle"]');
    if (!t) return;
    var d = t.closest('article').querySelector('[data-js="details"]');
    d.hidden = !d.hidden;
    t.textContent = d.hidden ? 'Course details \u25be' : 'Hide details \u25b4';
  });
  var u = new URLSearchParams(window.location.search).get('uni');
  if (u && uniNames[u]) s.uni = u;
  render();
})();
