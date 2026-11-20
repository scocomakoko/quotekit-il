(function () {
  'use strict';
  var d = document, root = d.documentElement, KEY = 'qk_theme';
  function get() { try { return localStorage.getItem(KEY); } catch (e) { return null; } }
  function set(v) { try { localStorage.setItem(KEY, v); } catch (e) {} }
  function dark() {
    var t = root.getAttribute('data-theme');
    if (t) { return t === 'dark'; }
    return !!(window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches);
  }
  var s0 = get();
  if (s0 === 'dark' || s0 === 'light') { root.setAttribute('data-theme', s0); }

  var NS = 'http://www.w3.org/2000/svg';
  function svg(paths) {
    var s = d.createElementNS(NS, 'svg');
    s.setAttribute('viewBox', '0 0 24 24');
    s.setAttribute('aria-hidden', 'true');
    paths.forEach(function (p) {
      var el = d.createElementNS(NS, p[0]);
      for (var k in p[1]) { el.setAttribute(k, p[1][k]); }
      s.appendChild(el);
    });
    return s;
  }
  var MOON = [['path', { d: 'M20 14.5A8 8 0 0 1 9.5 4 8 8 0 1 0 20 14.5z' }]];
  var SUN = [['circle', { cx: 12, cy: 12, r: 4 }], ['path', { d: 'M12 2v2M12 20v2M2 12h2M20 12h2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4' }]];

  function label() {
    return root.lang === 'en'
      ? (dark() ? 'Switch to light mode' : 'Switch to dark mode')
      : (dark() ? 'מעבר למצב בהיר' : 'מעבר למצב כהה');
  }
  function paint(btn) {
    while (btn.firstChild) { btn.removeChild(btn.firstChild); }
    btn.appendChild(svg(dark() ? SUN : MOON));
    var l = label();
    btn.setAttribute('aria-label', l);
    btn.title = l;
    btn.setAttribute('aria-pressed', dark() ? 'true' : 'false');
  }
  function init() {
    var wrap = d.querySelector('.site-header .wrap');
    if (!wrap) { return; }
    var b = d.createElement('button');
    b.type = 'button';
    b.className = 'themebtn';
    paint(b);
    b.addEventListener('click', function () {
      var n = dark() ? 'light' : 'dark';
      root.setAttribute('data-theme', n);
      set(n);
      paint(b);
    });
    wrap.appendChild(b);
    if (window.MutationObserver) {
      new MutationObserver(function () { paint(b); }).observe(root, { attributes: true, attributeFilter: ['lang'] });
    }
  }

  // Shared helper: copy text, with a visible manual fallback (readonly textarea).
  function copy(text, box, done) {
    function fallback() {
      if (box) {
        box.hidden = false;
        box.value = text;
        try { box.focus(); box.select(); } catch (e) {}
      }
      var ok = false;
      try { ok = !!(d.execCommand && box && d.execCommand('copy')); } catch (e) {}
      done(ok, true);
    }
    if (box) { box.hidden = true; }
    try {
      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(text).then(function () { done(true, false); }, fallback);
        return;
      }
    } catch (e) {}
    fallback();
  }
  window.QK = { copy: copy, svg: svg };
  if (d.readyState === 'loading') { d.addEventListener('DOMContentLoaded', init); } else { init(); }
})();
