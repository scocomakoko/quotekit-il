(function (root) {
  'use strict';
  /* Pure UTC-safe integer date math: a date is a day number (days since 1970-01-01). */
  function isLeap(y) { return (y % 4 === 0 && y % 100 !== 0) || y % 400 === 0; }
  function dim(y, m) { return [31, isLeap(y) ? 29 : 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31][m - 1]; }
  function toDays(y, m, d) {
    var yy = m <= 2 ? y - 1 : y;
    var era = Math.floor(yy / 400);
    var yoe = yy - era * 400;
    var doy = Math.floor((153 * (m + (m > 2 ? -3 : 9)) + 2) / 5) + d - 1;
    var doe = yoe * 365 + Math.floor(yoe / 4) - Math.floor(yoe / 100) + doy;
    return era * 146097 + doe - 719468;
  }
  function fromDays(z) {
    z += 719468;
    var era = Math.floor(z / 146097);
    var doe = z - era * 146097;
    var yoe = Math.floor((doe - Math.floor(doe / 1460) + Math.floor(doe / 36524) - Math.floor(doe / 146096)) / 365);
    var doy = doe - (365 * yoe + Math.floor(yoe / 4) - Math.floor(yoe / 100));
    var mp = Math.floor((5 * doy + 2) / 153);
    var d = doy - Math.floor((153 * mp + 2) / 5) + 1;
    var m = mp < 10 ? mp + 3 : mp - 9;
    return { y: yoe + era * 400 + (m <= 2 ? 1 : 0), m: m, d: d };
  }
  function weekday(days) { return (((days + 4) % 7) + 7) % 7; } /* 0 = Sunday */
  /* shotef+N: last day of the invoice month, plus N days */
  function shotef(y, m, d, n) { return toDays(y, m, dim(y, m)) + n; }
  /* plain: invoice date plus N days */
  function net(y, m, d, n) { return toDays(y, m, d) + n; }
  var core = { isLeap: isLeap, dim: dim, toDays: toDays, fromDays: fromDays, weekday: weekday, shotef: shotef, net: net };
  if (typeof module !== 'undefined' && module.exports) { module.exports = core; }
  if (!root || !root.document) { return; }

  var d = root.document;
  var ALLOW = ['https://paypal.me/QuoteKitIL/1ILS'];
  var MON = ['ינואר', 'פברואר', 'מרץ', 'אפריל', 'מאי', 'יוני', 'יולי', 'אוגוסט', 'ספטמבר', 'אוקטובר', 'נובמבר', 'דצמבר'];
  var DAY = ['ראשון', 'שני', 'שלישי', 'רביעי', 'חמישי', 'שישי', 'שבת'];
  var PRESETS = [['שוטף', 0], ['שוטף+30', 30], ['שוטף+45', 45], ['שוטף+60', 60], ['שוטף+90', 90]];
  var sel = 30, custom = false;
  var ui = {};

  function $(id) { return d.getElementById(id); }
  function p2(n) { return (n < 10 ? '0' : '') + n; }
  function longDate(z) { var o = fromDays(z); return o.d + ' ב' + MON[o.m - 1] + ' ' + o.y; }
  function shortDate(z) { var o = fromDays(z); return p2(o.d) + '.' + p2(o.m) + '.' + o.y; }
  function dayName(z) { return 'יום ' + DAY[weekday(z)]; }
  function parseIso(s) {
    var m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(s || '');
    if (!m) { return null; }
    var y = +m[1], mo = +m[2], da = +m[3];
    if (mo < 1 || mo > 12 || da < 1 || da > dim(y, mo)) { return null; }
    return { y: y, m: mo, d: da };
  }
  function todayDays() { var t = new Date(); return toDays(t.getFullYear(), t.getMonth() + 1, t.getDate()); }
  function todayIso() { var t = new Date(); return t.getFullYear() + '-' + p2(t.getMonth() + 1) + '-' + p2(t.getDate()); }

  function remaining(z) {
    var diff = z - todayDays();
    if (diff === 0) { return 'היום'; }
    if (diff === 1) { return 'מחר'; }
    if (diff > 1) { return 'עוד ' + diff + ' ימים'; }
    if (diff === -1) { return 'באיחור של יום אחד'; }
    return 'באיחור של ' + (-diff) + ' ימים';
  }

  var summary = '';
  function render() {
    var inv = parseIso(ui.date.value);
    var n = sel;
    if (custom) {
      var v = ui.days.value.trim();
      n = /^\d{1,4}$/.test(v) ? +v : null;
    }
    if (!inv || n === null) {
      summary = '';
      ui.err.textContent = !inv ? 'התאריך לא נראה תקין. אפשר לבחור אותו שוב?' : 'כאן צריך מספר ימים, בין 0 ל-9999.';
      ui.due.textContent = '-'; ui.dueSub.textContent = '';
      ui.alt.textContent = '-'; ui.altSub.textContent = '';
      ui.sum.textContent = '';
      ui.copy.disabled = true;
      return;
    }
    ui.err.textContent = '';
    ui.copy.disabled = false;
    var a = shotef(inv.y, inv.m, inv.d, n), b = net(inv.y, inv.m, inv.d, n);
    var name = n === 0 ? 'שוטף' : 'שוטף+' + n;
    ui.dueLbl.textContent = name + ': סוף החודש' + (n ? ' ועוד ' + n + ' ימים' : '');
    ui.due.textContent = longDate(a);
    ui.dueSub.textContent = dayName(a) + ' · ' + remaining(a);
    ui.altLbl.textContent = 'לשם השוואה: ' + n + ' ימים מתאריך החשבונית (לא שוטף)';
    ui.alt.textContent = longDate(b);
    ui.altSub.textContent = dayName(b) + ' · ' + remaining(b);
    summary = 'חשבונית מ-' + shortDate(toDays(inv.y, inv.m, inv.d)) + ', ' + name +
      ': לתשלום עד ' + shortDate(a) + ' (' + dayName(a) + '). ' +
      'לשם השוואה, ' + n + ' ימים מתאריך החשבונית: ' + shortDate(b) + '.';
    ui.sum.textContent = summary;
  }

  function mark() {
    var bs = ui.chips.querySelectorAll('button');
    for (var i = 0; i < bs.length; i++) {
      var k = bs[i].getAttribute('data-n');
      var on = k === 'x' ? custom : (!custom && +k === sel);
      bs[i].setAttribute('aria-pressed', on ? 'true' : 'false');
    }
  }

  function tipNode(link) {
    var url = ALLOW[0];
    if (ALLOW.indexOf(url) < 0) { return; }
    var a = d.createElement('a');
    a.href = url; a.rel = 'noopener noreferrer'; a.target = '_blank';
    a.textContent = '₪1 ב-PayPal';
    link.textContent = 'עזר לך? אפשר להשאיר ';
    link.appendChild(a);
    link.appendChild(d.createTextNode('. לא חובה.'));
  }

  function init() {
    ['date', 'days', 'chips', 'err', 'dueLbl', 'due', 'dueSub', 'altLbl', 'alt', 'altSub', 'sum', 'copy', 'msg', 'box', 'tip'].forEach(function (k) { ui[k] = $('pt-' + k); });
    if (!ui.date) { return; }
    ui.date.value = todayIso();
    PRESETS.forEach(function (p) {
      var b = d.createElement('button');
      b.type = 'button'; b.textContent = p[0]; b.setAttribute('data-n', String(p[1]));
      b.addEventListener('click', function () { custom = false; sel = p[1]; mark(); render(); });
      ui.chips.appendChild(b);
    });
    var x = d.createElement('button');
    x.type = 'button'; x.textContent = 'אחר'; x.setAttribute('data-n', 'x');
    x.addEventListener('click', function () { custom = true; mark(); ui.days.focus(); render(); });
    ui.chips.appendChild(x);
    ui.date.addEventListener('input', render);
    ui.days.addEventListener('input', function () { custom = true; mark(); render(); });
    ui.copy.addEventListener('click', function () {
      if (!summary || !root.QK) { return; }
      root.QK.copy(summary, ui.box, function (ok, fb) {
        ui.msg.textContent = ok ? 'הועתק. אפשר להדביק.' : (fb ? 'אפשר להעתיק ידנית מהתיבה.' : 'ההעתקה לא הצליחה.');
        if (ui.tip) { tipNode(ui.tip); ui.tip.hidden = false; }
      });
    });
    mark(); render();
  }
  if (d.readyState === 'loading') { d.addEventListener('DOMContentLoaded', init); } else { init(); }
})(typeof window !== 'undefined' ? window : this);
