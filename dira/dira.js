(function () {
  'use strict';
  var ALLOW = ['https://paypal.me/QuoteKitIL/1ILS'];
  var P = 'dira:' + location.pathname + ':';
  var NAME = (location.pathname.split('/').pop() || 'index').replace(/\.html$/, '') || 'index';
  var SRC = ['index', 'walkthrough', 'wet-rooms', 'rental-condition'];
  var SITE = 'https://scocomakoko.github.io/quotekit-il/dira/';
  var d = document;
  var ui = {};

  function store(fn) { try { return fn(window.localStorage); } catch (e) { return null; } }
  function el(tag, cls, text) {
    var e = d.createElement(tag);
    if (cls) { e.className = cls; }
    if (text !== undefined) { e.textContent = text; }
    return e;
  }
  function svg(paths) { return window.QK ? window.QK.svg(paths) : d.createTextNode(''); }
  var FLAG = [['path', { d: 'M5 21V4M5 4h12l-2.5 4L17 12H5' }]];
  var NOTE = [['path', { d: 'M4 5h16v11H10l-5 4v-4H4z' }]];

  /* ---------- per-item extras: flag + note ---------- */
  function enhance() {
    var lis = d.querySelectorAll('ul.chk > li');
    for (var i = 0; i < lis.length; i++) {
      var li = lis[i], cb = li.querySelector('label input[type=checkbox]');
      if (!cb || !cb.id) { continue; }
      var sp = li.querySelector('label span'), txt = sp ? sp.textContent : '';
      var ia = el('div', 'ia');
      var fl = el('label', 'flagl');
      fl.title = 'סימון ליקוי';
      var fcb = el('input', 'fcb');
      fcb.type = 'checkbox';
      fcb.id = cb.id + '-f';
      fcb.setAttribute('aria-label', 'יש ליקוי: ' + txt);
      fl.appendChild(fcb);
      fl.appendChild(svg(FLAG));
      var nb = el('button', 'notebtn');
      nb.type = 'button';
      nb.title = 'הערה';
      nb.setAttribute('aria-label', 'הערה: ' + txt);
      nb.setAttribute('aria-expanded', 'false');
      nb.appendChild(svg(NOTE));
      var ni = el('input', 'note-in');
      ni.type = 'text';
      ni.id = cb.id + '-n';
      ni.maxLength = 200;
      ni.placeholder = 'הערה לשורה הזאת';
      ni.setAttribute('aria-label', 'הערה: ' + txt);
      ni.setAttribute('autocomplete', 'off');
      ni.hidden = true;
      (function (nb, ni) {
        nb.addEventListener('click', function () {
          ni.hidden = !ni.hidden;
          nb.setAttribute('aria-expanded', ni.hidden ? 'false' : 'true');
          if (!ni.hidden) { ni.focus(); }
        });
      })(nb, ni);
      ia.appendChild(fl);
      ia.appendChild(nb);
      li.appendChild(ia);
      li.appendChild(ni);
    }
  }

  function sync(li) {
    var cb = li.querySelector('label input[type=checkbox]');
    var f = li.querySelector('.fcb'), n = li.querySelector('.note-in'), nb = li.querySelector('.notebtn');
    li.classList.toggle('ok', !!(cb && cb.checked));
    if (f) { f.parentNode.classList.toggle('on', f.checked); }
    if (n && nb) {
      if (n.value) { n.hidden = false; nb.setAttribute('aria-expanded', 'true'); }
      nb.classList.toggle('has', !!n.value);
    }
  }

  function restore() {
    var els = d.querySelectorAll('input[id],select[id]');
    for (var i = 0; i < els.length; i++) {
      (function (el) {
        var v = store(function (s) { return s.getItem(P + el.id); });
        if (v !== null) { if (el.type === 'checkbox') { el.checked = v === '1'; } else { el.value = v; } }
        el.addEventListener('change', save);
        el.addEventListener('input', save);
        function save() {
          store(function (s) { s.setItem(P + el.id, el.type === 'checkbox' ? (el.checked ? '1' : '0') : el.value); });
        }
      })(els[i]);
    }
  }

  /* ---------- data ---------- */
  function collect() {
    var out = [], lis = d.querySelectorAll('ul.chk > li');
    for (var i = 0; i < lis.length; i++) {
      var li = lis[i], cb = li.querySelector('label input[type=checkbox]');
      if (!cb) { continue; }
      var sec = li.closest('section'), h = sec && sec.querySelector('h2');
      var sp = li.querySelector('label span'), f = li.querySelector('.fcb'), n = li.querySelector('.note-in');
      out.push({
        room: h ? h.textContent : '', text: sp ? sp.textContent : '',
        done: cb.checked, flag: !!(f && f.checked), note: n ? n.value.trim() : ''
      });
    }
    return out;
  }
  function pl(n) { return n === 1 ? 'פריט אחד' : n + ' פריטים'; }
  function leftOf(items) { return items.filter(function (it) { return !it.done || it.flag || it.note; }); }

  function waText(items) {
    var left = leftOf(items), done = items.filter(function (it) { return it.done; }).length;
    var t = ['*' + d.querySelector('h1').textContent + '*'];
    t.push(left.length ? 'עוד לא סימנתי: ' + pl(left.length) + ' (סימנתי ' + done + ' מתוך ' + items.length + ')' : 'סימנתי הכול (' + items.length + ' מתוך ' + items.length + '). אין מה להשלים.');
    var room = null;
    left.forEach(function (it) {
      if (it.room !== room) { room = it.room; t.push(''); t.push('*' + room + '*'); }
      t.push('• ' + (it.flag ? 'ליקוי: ' : '') + it.text);
      if (it.note) { t.push('   ↳ ' + it.note); }
    });
    t.push('');
    t.push('נוצר ב-QuoteKit IL: ' + SITE);
    return t.join('\n');
  }

  /* ---------- progress ---------- */
  function buildProg() {
    var NS = 'http://www.w3.org/2000/svg';
    var p = el('div', 'prog noprint');
    p.setAttribute('role', 'progressbar');
    p.setAttribute('aria-label', 'התקדמות ברשימה');
    p.setAttribute('aria-valuemin', '0');
    p.setAttribute('aria-valuemax', '100');
    var s = d.createElementNS(NS, 'svg');
    s.setAttribute('class', 'ring');
    s.setAttribute('viewBox', '0 0 40 40');
    s.setAttribute('aria-hidden', 'true');
    var c1 = d.createElementNS(NS, 'circle'), c2 = d.createElementNS(NS, 'circle'), tx = d.createElementNS(NS, 'text');
    [c1, c2].forEach(function (c) { c.setAttribute('cx', '20'); c.setAttribute('cy', '20'); c.setAttribute('r', '16'); });
    c1.setAttribute('class', 'rb');
    c2.setAttribute('class', 'rf');
    c2.setAttribute('transform', 'rotate(-90 20 20)');
    c2.setAttribute('stroke-dasharray', '0 100.53');
    tx.setAttribute('x', '20'); tx.setAttribute('y', '23.5');
    s.appendChild(c1); s.appendChild(c2); s.appendChild(tx);
    var b = el('div', 'pb');
    ui.pt = el('b'); ui.ps = el('span');
    b.appendChild(ui.pt); b.appendChild(ui.ps);
    var burst = el('div', 'burst');
    burst.setAttribute('aria-hidden', 'true');
    for (var i = 0; i < 8; i++) { burst.appendChild(el('i')); }
    var m = el('img', 'pm');
    m.src = '../mascot.svg'; m.alt = ''; m.width = 44; m.height = 46;
    p.appendChild(s); p.appendChild(b); p.appendChild(m); p.appendChild(burst);
    ui.prog = p; ui.rf = c2; ui.pp = tx;
    ui.done = el('p', 'msg noprint');
    ui.done.setAttribute('role', 'status');
    var first = d.querySelector('main > section');
    first.parentNode.insertBefore(p, first.nextSibling);
    first.parentNode.insertBefore(ui.done, p.nextSibling);
  }

  function paintProg(items) {
    var n = items.length, k = items.filter(function (it) { return it.done; }).length;
    var pct = n ? Math.round(k * 100 / n) : 0, left = n - k;
    ui.rf.setAttribute('stroke-dasharray', (pct * 1.0053).toFixed(2) + ' 100.53');
    ui.pp.textContent = pct + '%';
    ui.prog.setAttribute('aria-valuenow', String(pct));
    ui.prog.setAttribute('aria-valuetext', 'סימנת ' + k + ' מתוך ' + n);
    ui.pt.textContent = 'סימנת ' + k + ' מתוך ' + n;
    ui.ps.textContent = pct === 100 ? 'סיימת הכול. מגיע לך קפה.'
      : k === 0 ? 'עוד לא התחלנו. סימון אחד ואנחנו בדרך.'
      : left <= 3 ? 'כמעט שם, נשארו ' + (left === 1 ? 'רק אחד' : left) + '.'
      : pct < 50 ? 'יפה, ממשיכים.' : 'עברת את החצי. נשארו ' + left + '.';
    var was = ui.prog.classList.contains('done');
    ui.prog.classList.toggle('done', pct === 100);
    ui.done.textContent = pct === 100 ? (was ? ui.done.textContent : 'כל הכבוד! הכול מסומן.') : '';
  }

  /* ---------- summary ---------- */
  function emptyState(text) {
    var e = el('div', 'empty');
    var im = el('img');
    im.src = '../mascot.svg'; im.alt = ''; im.width = 56; im.height = 59;
    e.appendChild(im); e.appendChild(el('p', '', text));
    return e;
  }
  function groups(arr, parent, withNote) {
    var room = null, ul = null;
    arr.forEach(function (it) {
      if (it.room !== room) { room = it.room; parent.appendChild(el('h4', '', room)); ul = el('ul'); parent.appendChild(ul); }
      var li = el('li', '', it.text);
      if (withNote && it.note) { li.appendChild(el('span', 'nt', ' (' + it.note + ')')); }
      ul.appendChild(li);
    });
  }
  function buildSummary() {
    var s = el('section', 'sum');
    s.id = 'summary';
    if (d.getElementById('report')) { s.className = 'sum noprint'; }
    s.appendChild(el('h2', '', 'סיכום ליקויים'));
    s.appendChild(el('p', 'hint hintp', 'כאן מתאספים הליקויים שסימנת בדגל, השורות עם הערה, ומה שעוד לא סומן.'));
    ui.sf = el('div'); ui.sl = el('div'); ui.sl.id = 'sumLeft';
    s.appendChild(ui.sf); s.appendChild(ui.sl);
    var bt = el('div', 'sbtns noprint');
    ui.copy = el('button', '', 'העתק רק מה שנשאר');
    ui.copy.type = 'button';
    ui.wa = el('a', 'btn wa', 'פתח בוואטסאפ');
    ui.wa.target = '_blank'; ui.wa.rel = 'noopener noreferrer'; ui.wa.href = 'https://wa.me/';
    bt.appendChild(ui.copy); bt.appendChild(ui.wa);
    ui.cmsg = el('p', 'msg noprint');
    ui.cmsg.setAttribute('role', 'status');
    ui.box = el('textarea');
    ui.box.readOnly = true; ui.box.hidden = true;
    ui.box.setAttribute('aria-label', 'הטקסט להעתקה');
    s.appendChild(bt); s.appendChild(ui.cmsg); s.appendChild(ui.box);
    if (d.getElementById('report')) { s.querySelector('.hintp').textContent = 'כאן מתאסף מה שעוד לא סומן, כדי שאפשר יהיה לשלוח או להשלים.'; }
    var tip = d.getElementById('tip');
    tip.parentNode.insertBefore(s, tip);
    ui.copy.addEventListener('click', function () {
      var text = waText(collect());
      if (!window.QK) { return; }
      window.QK.copy(text, ui.box, function (ok, fb) {
        ui.cmsg.textContent = ok ? 'הועתק. אפשר להדביק בוואטסאפ.' : 'לא הצלחנו להעתיק לבד. סימנו לך את הטקסט, אפשר להעתיק אותו ידנית.';
        if (fb && ok) { ui.box.hidden = true; }
      });
    });
  }
  function paintSummary(items) {
    var flagged = items.filter(function (it) { return it.flag || it.note; });
    var left = items.filter(function (it) { return !it.done; });
    ui.sf.textContent = ''; ui.sl.textContent = '';
    ui.sf.appendChild(el('h3', '', 'ליקויים והערות (' + flagged.length + ')'));
    if (flagged.length) { groups(flagged, ui.sf, true); }
    else { ui.sf.appendChild(emptyState('עוד לא סימנת ליקוי. כשמוצאים משהו, לוחצים על הדגל ליד השורה.')); }
    ui.sl.appendChild(el('h3', '', 'עוד לא סומן (' + left.length + ')'));
    if (left.length) { groups(left, ui.sl, false); }
    else { ui.sl.appendChild(emptyState('הכול מסומן. אין מה להשלים.')); }
    ui.wa.href = 'https://wa.me/?text=' + encodeURIComponent(waText(items));
  }
  function saveDefects(items) {
    var def = items.filter(function (it) { return it.flag || it.note; }).map(function (it) { return { room: it.room, text: it.text, note: it.note }; });
    store(function (s) { s.setItem('dira-defects:' + NAME, JSON.stringify({ items: def })); });
  }
  function refresh() {
    var items = collect();
    if (ui.prog) { paintProg(items); }
    if (ui.sf) { paintSummary(items); saveDefects(items); }
  }

  /* ---------- defect list import ---------- */
  function setupImport() {
    var tbl = d.querySelector('table.defects');
    if (!tbl || !d.getElementById('t1i')) { return; }
    var sec = tbl.closest('section');
    var wrap = el('div', 'imp noprint');
    var b = el('button', 'alt', 'מלא מהליקויים שסימנתי ברשימות');
    b.type = 'button';
    var msg = el('p', 'msg');
    msg.setAttribute('role', 'status');
    wrap.appendChild(b); wrap.appendChild(msg);
    sec.insertBefore(wrap, sec.querySelector('h2').nextSibling);
    b.addEventListener('click', function () {
      var all = [];
      SRC.forEach(function (n) {
        var raw = store(function (s) { return s.getItem('dira-defects:' + n); });
        if (!raw) { return; }
        try { all = all.concat(JSON.parse(raw).items || []); } catch (e) {}
      });
      if (!all.length) { msg.textContent = 'עוד אין ליקויים מסומנים. ברשימות, לוחצים על הדגל ליד שורה עם בעיה.'; return; }
      var rows = [], n = 1;
      while (d.getElementById('t' + n + 'i')) { rows.push(n); n++; }
      var have = rows.map(function (r) { return d.getElementById('t' + r + 'i').value; });
      var put = 0;
      all.forEach(function (it) {
        var val = it.text + (it.note ? ' - ' + it.note : '');
        if (have.indexOf(val) >= 0) { return; }
        for (var k = 0; k < rows.length; k++) {
          if (!have[k]) {
            var ri = d.getElementById('t' + rows[k] + 'i'), rr = d.getElementById('t' + rows[k] + 'r');
            ri.value = val; rr.value = it.room;
            ri.dispatchEvent(new Event('input', { bubbles: true }));
            rr.dispatchEvent(new Event('input', { bubbles: true }));
            have[k] = val; put++;
            return;
          }
        }
      });
      var rest = all.length - put;
      msg.textContent = put ? 'נכנסו ' + put + ' ליקויים לטבלה.' + (rest > 0 ? ' ' + rest + ' כבר בטבלה או שאין מקום.' : '') : 'הכול כבר בטבלה, או שאין שורות פנויות.';
    });
  }

  function tipNode(link) {
    var url = ALLOW[0];
    if (ALLOW.indexOf(url) < 0) { return; }
    var a = d.createElement('a');
    a.href = url;
    a.rel = 'noopener noreferrer';
    a.target = '_blank';
    a.textContent = '₪1 ב-PayPal';
    link.textContent = 'עזר לך? אפשר להשאיר ';
    link.appendChild(a);
    link.appendChild(d.createTextNode('. לא חובה.'));
  }

  function clearAll() {
    if (!window.QK || !window.QK.ask) { return; }
    window.QK.ask('לנקות את כל מה שמילאת בדף הזה?', 'כן, לנקות', 'ביטול', function () {
      store(function (s) {
        var del = ['dira-defects:' + NAME];
        for (var i = 0; i < s.length; i++) { var k = s.key(i); if (k && k.indexOf(P) === 0) { del.push(k); } }
        del.forEach(function (k) { s.removeItem(k); });
      });
      location.reload();
    });
  }

  function makeCopy() {
    var src = d.getElementById('report'), dst = d.getElementById('copy2');
    if (!src || !dst) { return; }
    while (dst.firstChild) { dst.removeChild(dst.firstChild); }
    var c = src.cloneNode(true);
    var ins = c.querySelectorAll('input,select');
    var orig = src.querySelectorAll('input,select');
    for (var i = 0; i < ins.length; i++) {
      ins[i].removeAttribute('id');
      if (ins[i].type === 'checkbox') { if (orig[i].checked) { ins[i].setAttribute('checked', ''); } }
      else if (ins[i].tagName === 'SELECT') { ins[i].value = orig[i].value; }
      else { ins[i].setAttribute('value', orig[i].value); }
    }
    var lbl = c.querySelectorAll('[for]');
    for (var j = 0; j < lbl.length; j++) { lbl[j].removeAttribute('for'); }
    dst.appendChild(c);
    dst.className = 'copy2 on';
  }

  function init() {
    var hasList = !!d.querySelector('ul.chk > li');
    if (hasList) { enhance(); }
    restore();
    if (hasList) {
      var lis = d.querySelectorAll('ul.chk > li');
      for (var i = 0; i < lis.length; i++) { sync(lis[i]); }
      buildProg();
      buildSummary();
      refresh();
      var main = d.getElementById('main') || d.body;
      main.addEventListener('change', function (e) {
        var li = e.target.closest && e.target.closest('ul.chk > li');
        if (li) {
          sync(li);
          if (e.target.type === 'checkbox' && e.target.checked && !e.target.classList.contains('fcb')) {
            li.classList.add('tick');
            setTimeout(function () { li.classList.remove('tick'); }, 400);
          }
        }
        refresh();
      });
      main.addEventListener('input', function (e) {
        var li = e.target.closest && e.target.closest('ul.chk > li');
        if (li) { sync(li); refresh(); }
      });
    }
    setupImport();
    var pf = d.getElementById('pfoot');
    if (pf) { var bd = d.createElement('bdi'); bd.dir = 'ltr'; bd.textContent = SITE; pf.textContent = ''; pf.appendChild(bd); pf.appendChild(d.createTextNode(' · זו רשימה כללית בלבד, לא ייעוץ משפטי או הנדסי.')); }
    var tip = d.getElementById('tip');
    var pb = d.getElementById('printBtn');
    if (pb) { pb.addEventListener('click', function () { window.print(); }); }
    var cb = d.getElementById('clearBtn');
    if (cb) { cb.addEventListener('click', clearAll); }
    window.addEventListener('beforeprint', makeCopy);
    window.addEventListener('afterprint', function () {
      var dst = d.getElementById('copy2');
      if (dst) { dst.className = 'copy2'; while (dst.firstChild) { dst.removeChild(dst.firstChild); } }
      if (tip) { tipNode(tip); tip.hidden = false; }
    });
  }
  if (d.readyState === 'loading') { d.addEventListener('DOMContentLoaded', init); } else { init(); }
})();
