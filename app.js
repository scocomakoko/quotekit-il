(function(){
var PAY={he:{url:"https://paypal.me/QuoteKitIL/4ILS",amount:4,currency:"ILS",pre:"להשאיר ",price:"₪4",post:" ב-PayPal"},en:{url:"https://paypal.me/QuoteKitIL/1USD",amount:1,currency:"USD",pre:"Leave ",price:"$1",post:" on PayPal"}};
var CFG={provider:"paypal.me",telemetryEndpoint:"",vatRateDefault:18,vatRateAsOf:"2026-11-20"};
var T={
 he:{title:"הצעת מחיר ומע\"מ לפרילנסרים | QuoteKit IL",desc:"תיאור",qty:"כמות",price:"מחיר ליחידה (לפני מע\"מ)",lt:"סה\"כ שורה",rm:"הסרת שורה",
  sub:"סכום ביניים",vat:"מע\"מ",total:"סה\"כ לתשלום",biz:"שם העסק",bizId:"מספר עוסק",client:"שם הלקוח",date:"תאריך",valid:"תוקף ההצעה",days:"ימים",terms:"תנאי תשלום",
  exempt:"עוסק פטור - ללא מע\"מ",asOf:"נכון ל-",check:". כדאי לבדוק אם השתנה.",sample:["עיצוב לוגו","שעות ייעוץ"],loc:"he-IL"},
 en:{title:"Quote and VAT for freelancers | QuoteKit IL",desc:"Description",qty:"Qty",price:"Unit price (ex-VAT)",lt:"Line total",rm:"Remove line",
  sub:"Subtotal",vat:"VAT",total:"Total due",biz:"Business name",bizId:"Business ID",client:"Client",date:"Date",valid:"Valid for",days:"days",terms:"Payment terms",
  exempt:"Exempt dealer - no VAT",asOf:"As of ",check:". Worth checking if it changed.",sample:["Logo design","Consulting hours"],loc:"en-US"}};
var lang="he",$=function(i){return document.getElementById(i)},used=false,sampleOn=true;
function round2(x){return Math.round((x+Number.EPSILON)*100)/100}
// Pure calculation: lines [{q,p}], vat percent, exempt flag.
function totals(lines,vatPct,exempt){var s=0;lines.forEach(function(r){s+=round2((+r.q||0)*(+r.p||0))});s=round2(s);
 var v=exempt?0:(+vatPct||0),va=round2(s*v/100);return{sub:s,rate:v,vat:va,total:round2(s+va)}}
function fmt(n,l){return n.toLocaleString((T[l||lang]).loc,{style:"currency",currency:"ILS"})}
function log(ev,d){var e={event:ev,t:new Date().toISOString(),lang:lang,data:d||null};
 try{var a=JSON.parse(localStorage.getItem("qk_events")||"[]");a.push(e);localStorage.setItem("qk_events",JSON.stringify(a.slice(-200)))}catch(x){}
 console.log("[event]",e);
 if(CFG.telemetryEndpoint&&navigator.sendBeacon){try{navigator.sendBeacon(CFG.telemetryEndpoint,JSON.stringify(e))}catch(x){}}}
function asOfText(){var m=/^(\d{4})-(\d{2})-(\d{2})$/.exec(CFG.vatRateAsOf),t=T[lang];
 if(!m)return"";var d=new Date(+m[1],+m[2]-1,+m[3]);if(isNaN(d.getTime())||d.getMonth()!==+m[2]-1||d.getDate()!==+m[3])return"";
 var ds=lang==="he"?m[3]+"."+m[2]+"."+m[1]:d.toLocaleDateString(t.loc,{day:"numeric",month:"long",year:"numeric"});
 return t.asOf+ds+": "+(+CFG.vatRateDefault)+"%"+t.check}
function exempt(){return $("dealer").value==="exempt"}
function applyLang(){var t=T[lang];document.documentElement.lang=lang;document.documentElement.dir=lang==="he"?"rtl":"ltr";document.title=t.title;
 document.querySelectorAll("[data-he]").forEach(function(el){el.textContent=el.getAttribute("data-"+lang)});
 $("langBtn").textContent=lang==="he"?"English":"עברית";$("langBtn").lang=lang==="he"?"en":"he";
 var pp=PAY[lang],pb=$("payBtn"),bd=document.createElement("bdi");bd.dir="ltr";bd.textContent=pp.price;pb.textContent=pp.pre;pb.appendChild(bd);pb.appendChild(document.createTextNode(pp.post));pb.href=pp.url;$("vatHint").textContent=asOfText();
 Array.prototype.forEach.call($("items").children,labelRow);calc()}
function field(cls,key,type,val,mode){var l=document.createElement("label");l.className=cls;var s=document.createElement("span");s.className="sm";s.setAttribute("data-k",key);l.appendChild(s);
 var n=document.createElement("input");n.type=type;n.value=val;if(mode){n.setAttribute("inputmode",mode);n.dir="ltr";n.min="0";n.step="any"}n.addEventListener("input",function(){sampleOn=false;calc()});l.appendChild(n);return l}
function labelRow(r){var t=T[lang];r.querySelectorAll("label").forEach(function(l){var k=l.firstChild.getAttribute("data-k");l.firstChild.textContent=t[k];l.lastChild.setAttribute("aria-label",t[k])});
 var b=r.querySelector("button");b.textContent="×";b.setAttribute("aria-label",t.rm);b.title=t.rm;r.querySelector(".ltl").textContent=t.lt}
function row(d,q,p){var r=document.createElement("div");r.className="row";
 r.appendChild(field("desc","desc","text",d||""));r.appendChild(field("q","qty","number",q===undefined?"1":q,"decimal"));r.appendChild(field("p","price","number",p===undefined?"0":p,"decimal"));
 var lt=document.createElement("div");lt.className="lt";var a=document.createElement("span");a.className="ltl";var b=document.createElement("bdi");b.className="ltv";b.dir="ltr";lt.appendChild(a);lt.appendChild(b);r.appendChild(lt);
 var x=document.createElement("button");x.type="button";x.className="rm";x.addEventListener("click",function(){r.remove();calc()});r.appendChild(x);
 $("items").appendChild(r);labelRow(r);calc()}
function rows(){return Array.prototype.map.call($("items").children,function(r){var i=r.querySelectorAll("input");return{d:i[0].value,q:+i[1].value||0,p:+i[2].value||0}})}
function calc(){var rs=rows(),ex=exempt();$("vat").disabled=ex;
 Array.prototype.forEach.call($("items").children,function(r,i){r.querySelector(".ltv").textContent=fmt(round2(rs[i].q*rs[i].p))});
 var c=totals(rs,$("vat").value,ex);$("sub").textContent=fmt(c.sub);$("vatAmt").textContent=fmt(c.vat);$("total").textContent=fmt(c.total);
 $("vatLbl").textContent=T[lang].vat+(ex?"":" ("+c.rate+"%)");
 if(!used){used=true;log("calc_used")}return c}
function cell(tr,txt,num,th){var c=document.createElement(th?"th":"td");if(num){c.className="n";c.dir="ltr"}c.textContent=txt;tr.appendChild(c)}
function render(){var c=calc(),t=$("qTable"),tt=T[lang],h;t.textContent="";
 var th=t.createTHead().insertRow();cell(th,tt.desc,0,1);cell(th,tt.qty,1,1);cell(th,tt.price,1,1);cell(th,tt.lt,1,1);
 var tb=t.createTBody();
 rows().forEach(function(r){var tr=tb.insertRow();cell(tr,r.d);cell(tr,String(r.q),1);cell(tr,fmt(r.p),1);cell(tr,fmt(round2(r.q*r.p)),1)});
 var m=$("qMeta");m.textContent="";
 function kv(k,v){if(!v)return;var a=document.createElement("dt");a.textContent=k;var b=document.createElement("dd");b.textContent=v;m.appendChild(a);m.appendChild(b)}
 kv(tt.biz,$("biz").value);kv(tt.bizId,$("bizId").value);kv(tt.client,$("client").value);
 kv(tt.date,new Date().toLocaleDateString(tt.loc));
 var vd=+$("validity").value;if(vd>0)kv(tt.valid,vd+" "+tt.days);kv(tt.terms,$("terms").value);
 var q=$("qTot");q.textContent="";[[tt.sub,c.sub],[tt.vat+(exempt()?"":" ("+c.rate+"%)"),c.vat],[tt.total,c.total]].forEach(function(p){var tr=q.insertRow();cell(tr,p[0]);cell(tr,fmt(p[1]),1)});
 $("qVat").textContent=exempt()?tt.exempt:"";
 $("qTitle").textContent=lang==="he"?"הצעת מחיר":"Quote"}
function fillSample(){$("items").textContent="";var s=T[lang].sample;row(s[0],"1","1500");row(s[1],"4","250");sampleOn=true}
function init(){try{var sv=localStorage.getItem("qk_lang");if(sv==="en"||sv==="he")lang=sv}catch(x){}
 fillSample();
 $("langBtn").onclick=function(){lang=lang==="he"?"en":"he";try{localStorage.setItem("qk_lang",lang)}catch(x){}
  if(sampleOn){var s=T[lang].sample,i=$("items").querySelectorAll(".desc input");if(i.length===2){i[0].value=s[0];i[1].value=s[1]}}
  log("lang_toggle",lang);applyLang()};
 $("addRow").onclick=function(){row("","1","0");sampleOn=false};
 $("clearBtn").onclick=function(){$("items").textContent="";row("","1","0");sampleOn=false};
 $("vat").oninput=calc;$("dealer").onchange=function(){log("dealer_change",$("dealer").value);calc()};
 $("printBtn").onclick=function(){log("print_click");render();window.print()};
 $("payBtn").onclick=function(){var p=PAY[lang];log("pay_click",{provider:CFG.provider,lang:lang,url:p.url,amount:p.amount,currency:p.currency})};
 $("dlLink").onclick=function(){log("download_click")};
 $("vat").value=CFG.vatRateDefault;applyLang();log("page_view")}
if(typeof document==="undefined"){module.exports={totals:totals,round2:round2};return}
if(location.protocol==="file:"){init()}else{
 fetch("payment.config.json").then(function(r){return r.json()}).then(function(c){if(!c||typeof c!=="object")return;if(c.he&&c.he.url==="https://paypal.me/QuoteKitIL/4ILS")PAY.he.url=c.he.url;if(c.en&&c.en.url==="https://paypal.me/QuoteKitIL/1USD")PAY.en.url=c.en.url;if(typeof c.telemetryEndpoint==="string"&&c.telemetryEndpoint){try{var u=new URL(c.telemetryEndpoint,location.href);if(u.protocol==="https:"&&u.origin===location.origin)CFG.telemetryEndpoint=u.href}catch(e){}}if(typeof c.vatRateDefault==="number"&&isFinite(c.vatRateDefault))CFG.vatRateDefault=c.vatRateDefault;if(typeof c.vatRateAsOf==="string"&&/^\d{4}-\d{2}-\d{2}$/.test(c.vatRateAsOf))CFG.vatRateAsOf=c.vatRateAsOf}).catch(function(){}).then(init)}
})();
