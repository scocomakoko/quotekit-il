(function () {
  'use strict';
  var ALLOW = ['https://paypal.me/QuoteKitIL/10ILS'];
  var P = 'dira:' + location.pathname + ':';
  var d = document;

  function store(fn) { try { return fn(window.localStorage); } catch (e) { return null; } }

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

  function tipNode(link) {
    var url = ALLOW[0];
    if (ALLOW.indexOf(url) < 0) { return; }
    var a = d.createElement('a');
    a.href = url;
    a.rel = 'noopener noreferrer';
    a.target = '_blank';
    a.textContent = '₪10 ב-PayPal';
    link.textContent = 'עזר לך? אפשר להשאיר ';
    link.appendChild(a);
    link.appendChild(d.createTextNode('. לא חובה.'));
  }

  function clearAll() {
    if (!window.confirm('לנקות את כל מה שמילאת בדף הזה?')) { return; }
    store(function (s) {
      var del = [];
      for (var i = 0; i < s.length; i++) { var k = s.key(i); if (k && k.indexOf(P) === 0) { del.push(k); } }
      del.forEach(function (k) { s.removeItem(k); });
    });
    location.reload();
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
    restore();
    var tip = d.getElementById('tip'), pf = d.getElementById('pfoot');
    if (pf) { pf.textContent = 'https://scocomakoko.github.io/quotekit-il/dira/ · זו רשימה כללית בלבד, לא ייעוץ משפטי או הנדסי.'; }
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
