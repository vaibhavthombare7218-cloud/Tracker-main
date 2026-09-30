
"use strict";
const K={transactions:"RJKA_v1_transactions",accounts:"RJKA_v1_accounts",budgets:"RJKA_v1_budgets",settings:"RJKA_v1_settings"};
const $=s=>document.querySelector(s), read=(k,d=[])=>{try{return JSON.parse(localStorage.getItem(K[k]))??d}catch{return d}}, save=(k,v)=>localStorage.setItem(K[k],JSON.stringify(v));
const esc=s=>String(s??"").replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
const money=n=>(read("settings",{currency:"₹"}).currency||"₹")+Number(n||0).toLocaleString("en-IN",{minimumFractionDigits:2,maximumFractionDigits:2});
const today=()=>{let d=new Date();return new Date(d-d.getTimezoneOffset()*60000).toISOString().slice(0,10)};
const accounts=()=>read("accounts",[{id:"RJKA-ACC-001",name:"UPI",openingBalance:0},{id:"RJKA-ACC-002",name:"Cash",openingBalance:0},{id:"RJKA-ACC-003",name:"Bank",openingBalance:0}]);
const categories=[["daily_grocery","दररोजचा किराणा खर्च"],["monthly_grocery","महिन्याचा किराणा खर्च"],["travel","प्रवास"],["shopping","खरेदी"],["electricity","लाईट बिल"],["medicine","औषधे"],["mobile","मोबाईल"],["home_emi","घरचा EMI"],["home_maintenance","घरचा मेंटेनन्स"],["other_loan","इतर लोन"],["fish","मच्छी"],["outside_food","बाहेर जेवण"],["insurance_plan","विमा योजना"],["other","Other"]];
const catLabel=id=>categories.find(x=>x[0]===id)?.[1]||id||"—";
const accountLabel=id=>accounts().find(a=>a.id===id)?.name||"खाते हटवले";
const id=prefix=>prefix+"-"+Date.now().toString(36).toUpperCase()+"-"+Math.random().toString(36).slice(2,6).toUpperCase();

const app=$("#app");
function render(){const tx=read("transactions").filter(t=>t.type==="income").sort((a,b)=>(b.date||"").localeCompare(a.date||""));const ac=accounts();
app.innerHTML=`<section class="card"><h2 id="formTitle">नवीन जमा नोंद</h2><form id="entry" class="form">
<input type="hidden" id="editId"><div class="field"><label>जमा तारीख</label><input id="date" type="date" value="${today()}" required></div>
<div class="field"><label>रक्कम (₹)</label><input id="amount" type="number" min="0.01" step="0.01" required placeholder="उदा. 5000"></div>
<div class="field"><label>जमा प्रकार</label><input id="category" maxlength="70" placeholder="उदा. पगार, व्याज" required></div>
<div class="field"><label>खाते</label><select id="account" required>${ac.map(a=>`<option value="${esc(a.id)}">${esc(a.name)}</option>`).join("")}</select></div>
<div class="field"><label>नोंद / तपशील</label><input id="note" maxlength="150" placeholder="ऐच्छिक"></div>
<div class="actions"><button class="btn" type="submit">सेव्ह करा</button><button class="btn secondary" type="button" id="cancel" hidden>रद्द करा</button></div></form></section>
<div class="stats"><div class="stat"><small>एकूण जमा नोंदी</small><strong>${tx.length}</strong></div><div class="stat"><small>एकूण जमा रक्कम</small><strong class="positive">${money(tx.reduce((s,t)=>s+Number(t.amount||0),0))}</strong></div></div>
<section class="card"><h2>जमा व्यवहार</h2><div class="table-wrap"><table><thead><tr><th>तारीख</th><th>प्रकार</th><th>खाते</th><th>नोंद</th><th>रक्कम</th><th>कृती</th></tr></thead><tbody>${tx.length?tx.map(t=>`<tr><td>${esc(t.date)}</td><td>${esc(t.category)}</td><td>${esc(accountLabel(t.accountId))}</td><td>${esc(t.note||"—")}</td><td class="positive">${money(t.amount)}</td><td><button class="btn secondary" data-edit="${esc(t.id)}">Edit</button> <button class="btn danger" data-del="${esc(t.id)}">Delete</button></td></tr>`).join(""):`<tr><td colspan="6" class="empty">अद्याप जमा नोंद नाही.</td></tr>`}</tbody></table></div></section>`;
$("#entry").onsubmit=e=>{e.preventDefault();let all=read("transactions"),eid=$("#editId").value,record={id:eid||id("INC"),type:"income",date:$("#date").value,amount:Number($("#amount").value),category:$("#category").value.trim(),accountId:$("#account").value,note:$("#note").value.trim(),createdAt:new Date().toISOString()};if(eid){all=all.map(t=>t.id===eid?{...t,...record,createdAt:t.createdAt}:t)}else all.push(record);save("transactions",all);render()};
$("#cancel").onclick=()=>render();
app.querySelectorAll("[data-edit]").forEach(b=>b.onclick=()=>{let t=read("transactions").find(x=>x.id===b.dataset.edit);if(!t)return;$("#editId").value=t.id;$("#date").value=t.date||today();$("#amount").value=t.amount;$("#category").value=t.category||"";$("#account").value=t.accountId;$("#note").value=t.note||"";$("#formTitle").textContent="जमा नोंद संपादित करा";$("#cancel").hidden=false;window.scrollTo({top:0,behavior:"smooth"})});
app.querySelectorAll("[data-del]").forEach(b=>b.onclick=()=>{if(confirm("ही जमा नोंद हटवायची आहे का?")){save("transactions",read("transactions").filter(t=>t.id!==b.dataset.del));render()}});
}render();
