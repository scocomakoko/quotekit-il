(function(){
// VAT rate fixed by law. Change here only if the law changes.
var VAT_RATE=18;
var PAY={he:{url:"https://paypal.me/QuoteKitIL/1ILS",amount:1,currency:"ILS",pre:"לפרגן בשקל (",price:"₪1",post:") דרך PayPal"},en:{url:"https://paypal.me/QuoteKitIL/1USD",amount:1,currency:"USD",pre:"Chip in ",price:"$1",post:" via PayPal"}};
var CFG={provider:"paypal.me",telemetryEndpoint:""};
var T={
 he:{title:"הצעת מחיר ומע\"מ לפרילנסרים | QuoteKit IL",desc:"תיאור",qty:"כמות",price:"מחיר ליחידה",pricePrint:"מחיר ליחידה (לפני מע\"מ)",lt:"סה\"כ שורה",rm:"הסרת שורה",
  sub:"סכום ביניים",vat:"מע\"מ",total:"סה\"כ לתשלום",biz:"שם העסק",bizId:"מספר עוסק",client:"שם הלקוח",date:"תאריך",valid:"תוקף ההצעה",days:"ימים",terms:"תנאי תשלום",
  exempt:"עוסק פטור - ללא מע\"מ",terms0:"שוטף + 30",sample:["עיצוב לוגו","שעות ייעוץ"],loc:"he-IL",
  quote:"הצעת מחיר",num:"מספר הצעה",forClient:"ללקוח",item:"פריט",copied:"הועתק. אפשר להדביק בוואטסאפ.",manual:"לא הצלחנו להעתיק לבד. סימנו לך את הטקסט, אפשר להעתיק אותו ידנית.",
  deleted:"נמחק מהמכשיר הזה.",pname:"שם הקיצור",pprice:"מחיר",copyAria:"הטקסט להעתקה",notes:"הערות"},
 en:{title:"Quote and VAT for freelancers | QuoteKit IL",desc:"Description",qty:"Qty",price:"Unit price",pricePrint:"Unit price (ex-VAT)",lt:"Line total",rm:"Remove line",
  sub:"Subtotal",vat:"VAT",total:"Total due",biz:"Business name",bizId:"Business ID",client:"Client",date:"Date",valid:"Valid for",days:"days",terms:"Payment terms",
  exempt:"Exempt dealer - no VAT",terms0:"Net 30",sample:["Logo design","Consulting hours"],loc:"en-US",
  quote:"Quote",num:"Quote no.",forClient:"For",item:"Item",copied:"Copied. Paste it into WhatsApp.",manual:"Could not copy automatically. The text is selected below, copy it by hand.",
  deleted:"Deleted from this device.",pname:"Shortcut name",pprice:"Price",copyAria:"Text to copy",notes:"Notes"}};
var DEF={he:[{n:"שעת עבודה",p:250},{n:"נסיעה",p:100},{n:"תוספת דחיפות",p:150}],en:[{n:"Work hour",p:60},{n:"Travel",p:25},{n:"Rush surcharge",p:40}]};
var PF=["biz","bizId","terms","validity","notes","dealer"];
var lang="he",$=function(i){return document.getElementById(i)},used=false,sampleOn=true,presets,autoNum="",issued=false;
function round2(x){return Math.round((x+Number.EPSILON)*100)/100}
// Pure calculation: lines [{q,p}], exempt flag. VAT is the fixed VAT_RATE (0 for exempt dealers).
function totals(lines,exempt){var s=0;lines.forEach(function(r){s+=round2((+r.q||0)*(+r.p||0))});s=round2(s);
 var v=exempt?0:VAT_RATE,va=round2(s*v/100);return{sub:s,rate:v,vat:va,total:round2(s+va)}}
function fmt(n,l){l=l||lang;return l==="en"?n.toLocaleString("en-US",{style:"currency",currency:"USD"}):n.toLocaleString("he-IL",{style:"currency",currency:"ILS"})}
function fmt0(n){return n.toLocaleString(lang==="en"?"en-US":"he-IL",{style:"currency",currency:lang==="en"?"USD":"ILS",minimumFractionDigits:0,maximumFractionDigits:2})}
function load(k,def){try{var v=JSON.parse(localStorage.getItem(k));return v==null?def:v}catch(x){return def}}
function save(k,v){try{localStorage.setItem(k,JSON.stringify(v))}catch(x){}}
function del(k){try{localStorage.removeItem(k)}catch(x){}}
function log(ev,d){var e={event:ev,t:new Date().toISOString(),lang:lang,data:d||null};
 try{var a=JSON.parse(localStorage.getItem("qk_events")||"[]");a.push(e);localStorage.setItem("qk_events",JSON.stringify(a.slice(-200)))}catch(x){}
 console.log("[event]",e);
 if(CFG.telemetryEndpoint&&navigator.sendBeacon){try{navigator.sendBeacon(CFG.telemetryEndpoint,JSON.stringify(e))}catch(x){}}}
function exempt(){return $("dealer").value==="exempt"}
function p2(n){return("0"+n).slice(-2)}
function todayISO(){var n=new Date();return n.getFullYear()+"-"+p2(n.getMonth()+1)+"-"+p2(n.getDate())}
function dateObj(){var m=/^(\d{4})-(\d\d)-(\d\d)$/.exec($("qdate").value);return m?new Date(+m[1],+m[2]-1,+m[3]):new Date()}

/* ---- count-up (skipped for reduced motion / no rAF) ---- */
function canAnim(){return !!(window.matchMedia&&window.requestAnimationFrame&&!window.matchMedia("(prefers-reduced-motion: reduce)").matches)}
function setNum(el,val){var from=+el._v||0,txt=fmt(val);el._v=val;
 if(el._raf&&window.cancelAnimationFrame)cancelAnimationFrame(el._raf);
 if(!canAnim()||from===val){el.textContent=txt;return}
 var t0=null;function step(t){if(t0===null)t0=t;var k=Math.min(1,(t-t0)/350),e=1-Math.pow(1-k,3);
  if(k<1){el.textContent=fmt(round2(from+(val-from)*e));el._raf=requestAnimationFrame(step)}else el.textContent=txt}
 el._raf=requestAnimationFrame(step)}

/* ---- presets ---- */
function loadPresets(){presets=JSON.parse(JSON.stringify(DEF));var p=load("qk_presets",null);
 if(p&&typeof p==="object")["he","en"].forEach(function(l){if(Array.isArray(p[l]))p[l].slice(0,3).forEach(function(x,i){if(x&&typeof x.n==="string"&&isFinite(+x.p))presets[l][i]={n:x.n.slice(0,40),p:Math.max(0,+x.p)}})})}
function buildChips(){var c=$("presetChips");c.textContent="";
 presets[lang].forEach(function(p,i){if(!p.n.trim())return;var b=document.createElement("button");b.type="button";b.appendChild(document.createTextNode(p.n));
  var bd=document.createElement("bdi");bd.dir="ltr";bd.textContent=fmt0(p.p);b.appendChild(bd);
  b.onclick=function(){if(sampleOn)$("items").textContent="";sampleOn=false;row(p.n,"1",String(p.p));log("preset_add")};c.appendChild(b)})}
function buildEdit(){var e=$("presetEdit"),t=T[lang];e.textContent="";
 presets[lang].forEach(function(p,i){var w=document.createElement("div");w.className="pe";
  var a=document.createElement("input"),b=document.createElement("input");
  a.type="text";a.value=p.n;a.maxLength=40;a.placeholder=t.pname;a.setAttribute("aria-label",t.pname+" "+(i+1));
  b.type="number";b.value=String(p.p);b.min="0";b.step="any";b.dir="ltr";b.setAttribute("inputmode","decimal");b.setAttribute("aria-label",t.pprice+" "+(i+1));
  function up(){presets[lang][i]={n:a.value,p:Math.max(0,+b.value||0)};save("qk_presets",presets);buildChips()}
  a.addEventListener("input",up);b.addEventListener("input",up);w.appendChild(a);w.appendChild(b);e.appendChild(w)})}

/* ---- numbering ---- */
function nextNum(){var y=new Date().getFullYear(),s=load("qk_seq",{});return y+"-"+("000"+((s&&s.y===y?+s.n||0:0)+1)).slice(-4)}
function issue(){if(issued)return;issued=true;var v=$("qnum").value.trim();
 if(v===autoNum){var m=/-(\d+)$/.exec(v);save("qk_seq",{y:new Date().getFullYear(),n:m?+m[1]:1})}}

/* ---- profile (remember my details) ---- */
function saveProfile(){if(!$("remember").checked)return;var o={};PF.forEach(function(k){o[k]=$(k).value});save("qk_profile",o)}
function loadProfile(){var o=load("qk_profile",null);if(!o||typeof o!=="object")return;
 PF.forEach(function(k){if(typeof o[k]==="string")$(k).value=o[k]});if(!$("dealer").value)$("dealer").value="licensed";$("remember").checked=true}
function forget(){del("qk_profile");del("qk_presets");loadPresets();
 ["biz","bizId","notes"].forEach(function(k){$(k).value=""});$("terms").value=T[lang].terms0;$("validity").value="30";$("dealer").value="licensed";$("remember").checked=false;
 buildChips();buildEdit();calc();$("remMsg").textContent=T[lang].deleted;log("profile_deleted")}

function applyLang(){var t=T[lang];document.documentElement.lang=lang;document.documentElement.dir=lang==="he"?"rtl":"ltr";document.title=t.title;
 document.querySelectorAll("[data-he]").forEach(function(el){el.textContent=el.getAttribute("data-"+lang)});
 $("langBtn").textContent=lang==="he"?"English":"עברית";$("langBtn").lang=lang==="he"?"en":"he";
 $("copyBox").setAttribute("aria-label",t.copyAria);
 var pp=PAY[lang];["payBtn","payBtn2"].forEach(function(id){var pb=$(id),bd=document.createElement("bdi");bd.dir="ltr";bd.textContent=pp.price;pb.textContent=pp.pre;pb.appendChild(bd);pb.appendChild(document.createTextNode(pp.post));pb.href=pp.url});
 var tm=$("terms");if(tm.value===T.he.terms0||tm.value===T.en.terms0)tm.value=t.terms0;
 $("copyMsg").textContent="";$("remMsg").textContent="";
 Array.prototype.forEach.call($("items").children,labelRow);buildChips();buildEdit();calc()}
function field(cls,key,type,val,mode){var l=document.createElement("label");l.className=cls;var s=document.createElement("span");s.className="sm";s.setAttribute("data-k",key);l.appendChild(s);
 var n=document.createElement("input");n.type=type;n.value=val;if(mode){n.setAttribute("inputmode",mode);n.dir="ltr";n.min="0";n.step="any"}n.addEventListener("input",function(){sampleOn=false;calc()});l.appendChild(n);return l}
function labelRow(r){var t=T[lang];r.querySelectorAll("label").forEach(function(l){var k=l.firstChild.getAttribute("data-k");l.firstChild.textContent=t[k];l.lastChild.setAttribute("aria-label",t[k])});
 var b=r.querySelector("button");b.textContent="×";b.setAttribute("aria-label",t.rm);b.title=t.rm;r.querySelector(".ltl").textContent=t.lt}
function row(d,q,p){var r=document.createElement("div");r.className="row";
 r.appendChild(field("desc","desc","text",d||""));r.appendChild(field("q","qty","number",q===undefined?"1":q,"decimal"));r.appendChild(field("p","price","number",p===undefined?"0":p,"decimal"));
 var lt=document.createElement("div");lt.className="lt";var a=document.createElement("span");a.className="ltl";var b=document.createElement("bdi");b.className="ltv";b.dir="ltr";lt.appendChild(a);lt.appendChild(b);r.appendChild(lt);
 var x=document.createElement("button");x.type="button";x.className="rm";x.addEventListener("click",function(){r.remove();if(!$("items").children.length)row("","1","0");else calc()});r.appendChild(x);
 $("items").appendChild(r);labelRow(r);calc()}
function rows(){return Array.prototype.map.call($("items").children,function(r){var i=r.querySelectorAll("input");return{d:i[0].value,q:Math.max(0,+i[1].value||0),p:Math.max(0,+i[2].value||0)}})}
function visible(rs){return rs.filter(function(r){return r.d.trim()||r.q*r.p>0})}
function calc(){var rs=rows(),ex=exempt();
 Array.prototype.forEach.call($("items").children,function(r,i){r.querySelector(".ltv").textContent=fmt(round2(rs[i].q*rs[i].p))});
 var c=totals(rs,ex);setNum($("sub"),c.sub);setNum($("vatAmt"),c.vat);setNum($("total"),c.total);
 $("vatLbl").textContent=T[lang].vat+(ex?"":" ("+c.rate+"%)");
 paint(c,rs,ex);
 if(!used){used=true;log("calc_used")}return c}
function cell(tr,txt,num,th){var c=document.createElement(th?"th":"td");if(num){c.className="n";c.dir="ltr"}c.textContent=txt;tr.appendChild(c)}
/* live preview == the printed quote */
function paint(c,rs,ex){var t=$("qTable"),tt=T[lang],vis=visible(rs);t.textContent="";
 $("qEmpty").hidden=vis.length>0;
 var th=t.createTHead().insertRow();cell(th,tt.desc,0,1);cell(th,tt.qty,1,1);cell(th,tt.pricePrint,1,1);cell(th,tt.lt,1,1);
 var tb=t.createTBody();
 vis.forEach(function(r){var tr=tb.insertRow();cell(tr,r.d);cell(tr,String(r.q),1);cell(tr,fmt(r.p),1);cell(tr,fmt(round2(r.q*r.p)),1)});
 var m=$("qMeta");m.textContent="";
 function kv(k,v){if(!v)return;var a=document.createElement("dt");a.textContent=k;var b=document.createElement("dd");b.textContent=v;m.appendChild(a);m.appendChild(b)}
 kv(tt.num,$("qnum").value.trim());kv(tt.biz,$("biz").value);kv(tt.bizId,$("bizId").value);kv(tt.client,$("client").value);
 kv(tt.date,dateObj().toLocaleDateString(tt.loc));
 var vd=+$("validity").value;if(vd>0)kv(tt.valid,vd+" "+tt.days);kv(tt.terms,$("terms").value);
 var q=$("qTot");q.textContent="";[[tt.sub,c.sub],[tt.vat+(ex?"":" ("+c.rate+"%)"),c.vat],[tt.total,c.total]].forEach(function(p){var tr=q.insertRow();cell(tr,p[0]);cell(tr,fmt(p[1]),1)});
 $("qVat").textContent=ex?tt.exempt:"";
 $("qNotes").textContent=$("notes").value.trim();
 $("qTitle").textContent=tt.quote;
 $("waBtn").href="https://wa.me/?text="+encodeURIComponent(waText(c,vis,ex))}
/* WhatsApp message */
function waText(c,vis,ex){var tt=T[lang],L=[];
 if(!c){var rs=rows();ex=exempt();c=totals(rs,ex);vis=visible(rs)}
 var num=$("qnum").value.trim(),biz=$("biz").value.trim(),id=$("bizId").value.trim(),cl=$("client").value.trim();
 L.push("*"+tt.quote+(num?" "+num:"")+"*");
 if(biz)L.push(biz+(id?" ("+tt.bizId+" "+id+")":""));
 if(cl)L.push(tt.forClient+": "+cl);
 L.push(tt.date+": "+dateObj().toLocaleDateString(tt.loc));L.push("");
 vis.forEach(function(r){var lt=round2(r.q*r.p);L.push("• "+(r.d.trim()||tt.item)+": "+fmt(lt)+(r.q!==1?" ("+r.q+" × "+fmt(r.p)+")":""))});
 L.push("");L.push(tt.sub+": "+fmt(c.sub));
 if(ex)L.push(tt.exempt);else L.push(tt.vat+" ("+c.rate+"%): "+fmt(c.vat));
 L.push("*"+tt.total+": "+fmt(c.total)+"*");
 var vd=+$("validity").value,tm=$("terms").value.trim(),nt=$("notes").value.trim();
 if(vd>0||tm||nt)L.push("");
 if(vd>0)L.push(tt.valid+": "+vd+" "+tt.days);
 if(tm)L.push(tt.terms+": "+tm);
 if(nt)L.push(nt);
 return L.join("\n")}
function msg(text,ok){var m=$("copyMsg");m.textContent="";
 if(ok&&window.QK){var s=window.QK.svg([["path",{d:"M5 12l5 5 9-10"}]]);m.appendChild(s)}
 m.appendChild(document.createTextNode(text))}
function fillSample(){$("items").textContent="";var s=T[lang].sample;row(s[0],"1","1500");row(s[1],"4","250");sampleOn=true}
function newQuote(){$("items").textContent="";row("","1","0");sampleOn=false;$("client").value="";
 autoNum=nextNum();$("qnum").value=autoNum;issued=false;$("qdate").value=todayISO();$("postAsk").hidden=true;$("copyMsg").textContent="";$("copyBox").hidden=true;calc();log("new_quote")}
function init(){try{var sv=localStorage.getItem("qk_lang");if(sv==="en"||sv==="he")lang=sv}catch(x){}
 loadPresets();fillSample();loadProfile();
 $("qdate").value=todayISO();autoNum=nextNum();$("qnum").value=autoNum;
 $("langBtn").onclick=function(){lang=lang==="he"?"en":"he";try{localStorage.setItem("qk_lang",lang)}catch(x){}
  if(sampleOn){var s=T[lang].sample,i=$("items").querySelectorAll(".desc input");if(i.length===2){i[0].value=s[0];i[1].value=s[1]}}
  log("lang_toggle",lang);applyLang()};
 $("addRow").onclick=function(){row("","1","0");sampleOn=false};
 $("clearBtn").onclick=function(){$("items").textContent="";row("","1","0");sampleOn=false};
 $("newBtn").onclick=newQuote;
 $("dealer").onchange=function(){log("dealer_change",$("dealer").value);calc();saveProfile()};
 ["biz","bizId","client","qnum","qdate","validity","terms","notes"].forEach(function(id){$(id).addEventListener("input",function(){calc();saveProfile()})});
 $("remember").onchange=function(){if($("remember").checked){saveProfile();log("profile_saved")}else del("qk_profile")};
 $("forgetBtn").onclick=forget;
 $("printBtn").onclick=function(){log("print_click");issue();calc();window.print()};
 window.addEventListener("beforeprint",function(){calc()});
 window.addEventListener("afterprint",function(){$("postAsk").hidden=false;log("print_done")});
 $("copyBtn").onclick=function(){issue();var txt=waText(),box=$("copyBox");log("copy_wa");$("postAsk").hidden=false;
  if(window.QK)window.QK.copy(txt,box,function(ok){msg(ok?T[lang].copied:T[lang].manual,ok)});
  else{box.hidden=false;box.value=txt;msg(T[lang].manual,false)}};
 $("waBtn").onclick=function(){issue();log("open_wa");$("postAsk").hidden=false};
 function payClick(w){return function(){var p=PAY[lang];log("pay_click",{provider:CFG.provider,lang:lang,url:p.url,amount:p.amount,currency:p.currency,where:w})}}
 $("payBtn").onclick=payClick("template");$("payBtn2").onclick=payClick("post_print");
 $("dlLink").onclick=function(){log("download_click");$("postAsk").hidden=false};
 applyLang();log("page_view")}
if(typeof document==="undefined"){module.exports={totals:totals,round2:round2,VAT_RATE:VAT_RATE};return}
init();
if(location.protocol!=="file:"){
 fetch("payment.config.json").then(function(r){return r.json()}).then(function(c){if(!c||typeof c!=="object")return;if(c.he&&c.he.url==="https://paypal.me/QuoteKitIL/1ILS")PAY.he.url=c.he.url;if(c.en&&c.en.url==="https://paypal.me/QuoteKitIL/1USD")PAY.en.url=c.en.url;if(typeof c.telemetryEndpoint==="string"&&c.telemetryEndpoint){try{var u=new URL(c.telemetryEndpoint,location.href);if(u.protocol==="https:"&&u.origin===location.origin)CFG.telemetryEndpoint=u.href}catch(e){}}}).catch(function(){})}
})();
