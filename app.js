(function(){
var CFG={provider:"paypal.me",url:"https://paypal.me/QuoteKitIL/1USD",amount:1,currency:"USD",
label:{he:"שלמו מה שהוגן, $1 מומלץ",en:"Pay what's fair, $1 suggested"},telemetryEndpoint:"",vatRateDefault:18,vatRateAsOf:"2025-01"};
var lang="he",$=function(i){return document.getElementById(i)},used=false;
function log(ev,d){var e={event:ev,t:new Date().toISOString(),lang:lang,data:d||null};
 try{var a=JSON.parse(localStorage.getItem("qk_events")||"[]");a.push(e);localStorage.setItem("qk_events",JSON.stringify(a.slice(-200)))}catch(x){}
 console.log("[event]",e);
 if(CFG.telemetryEndpoint&&navigator.sendBeacon){try{navigator.sendBeacon(CFG.telemetryEndpoint,JSON.stringify(e))}catch(x){}}}
function vatLabel(){var d=$("vatDate").value;
 return lang==="he"?"שיעור מע\"מ (%) נכון ל-"+d+", ערכו אם השתנה":"VAT rate (%) as of "+d+", edit if changed"}
function applyLang(){document.documentElement.lang=lang;document.documentElement.dir=lang==="he"?"rtl":"ltr";
 document.querySelectorAll("[data-he]").forEach(function(el){el.textContent=el.getAttribute("data-"+lang)});
 $("langBtn").textContent=lang==="he"?"English":"עברית";$("payBtn").textContent=CFG.label[lang]||CFG.label.en;
 $("vatLbl").textContent=vatLabel();render()}
function row(){var d=document.createElement("div");d.className="row";
 ["text","number","number"].forEach(function(t,i){var n=document.createElement("input");n.type=t;if(i){n.min="0";n.step="any";n.value=i==1?"1":"0"}n.addEventListener("input",calc);d.appendChild(n)});
 $("items").appendChild(d)}
function rows(){return Array.prototype.map.call($("items").children,function(r){var i=r.querySelectorAll("input");return{d:i[0].value,q:+i[1].value||0,p:+i[2].value||0}})}
function calc(){var s=0;rows().forEach(function(r){s+=r.q*r.p});var v=+$("vat").value||0,va=s*v/100;
 $("sub").textContent=s.toFixed(2);$("vatAmt").textContent=va.toFixed(2);$("total").textContent=(s+va).toFixed(2);
 if(!used){used=true;log("calc_used")}return[s,va,v]}
function render(){var c=calc(),t=$("qTable");t.textContent="";
 rows().forEach(function(r){var tr=t.insertRow();[r.d,r.q,r.p.toFixed(2),(r.q*r.p).toFixed(2)].forEach(function(x){tr.insertCell().textContent=x})});
 $("qMeta").textContent=$("biz").value+" | "+$("client").value+" | "+new Date().toISOString().slice(0,10);
 $("qTot").textContent=(lang==="he"?"סכום ביניים ":"Subtotal ")+c[0].toFixed(2)+" | "+(lang==="he"?"מע\"מ ":"VAT ")+c[2]+"% = "+c[1].toFixed(2)+" | "+(lang==="he"?"סה\"כ ":"Total ")+(c[0]+c[1]).toFixed(2)}
function init(){row();row();
 $("langBtn").onclick=function(){lang=lang==="he"?"en":"he";log("lang_toggle",lang);applyLang()};
 $("addRow").onclick=row;$("vat").oninput=calc;$("vatDate").oninput=function(){$("vatLbl").textContent=vatLabel()};
 $("printBtn").onclick=function(){render();window.print()};
 $("payBtn").href=CFG.url;$("payBtn").onclick=function(){log("pay_click",{provider:CFG.provider,amount:CFG.amount,currency:CFG.currency})};
 $("dlLink").onclick=function(){log("download_click")};
 $("vat").value=CFG.vatRateDefault;$("vatDate").value=CFG.vatRateAsOf;applyLang();log("page_view")}
if(location.protocol==="file:"){init()}else{
 fetch("payment.config.json").then(function(r){return r.json()}).then(function(c){if(!c||typeof c!=="object")return;if(c.url==="https://paypal.me/QuoteKitIL/1USD")CFG.url=c.url;if(typeof c.telemetryEndpoint==="string"&&c.telemetryEndpoint){try{var u=new URL(c.telemetryEndpoint,location.href);if(u.protocol==="https:"&&u.origin===location.origin)CFG.telemetryEndpoint=u.href}catch(e){}}if(typeof c.vatRateDefault==="number"&&isFinite(c.vatRateDefault))CFG.vatRateDefault=c.vatRateDefault;if(typeof c.vatRateAsOf==="string")CFG.vatRateAsOf=c.vatRateAsOf.slice(0,20)}).catch(function(){}).then(init)}
})();
