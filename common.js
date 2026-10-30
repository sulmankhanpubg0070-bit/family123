const API='/api/members',KEY='shajra_data';
const SAMPLE=[
{id:1,name:'Dada Ji',father:null,gender:'M',dob:'1940-03-10',dead:true,spouse:'Dadi Ji'},
{id:2,name:'Ahmad',father:1,gender:'M',dob:'1965-06-01',phone:'0300-1234567',spouse:'Zainab'},
{id:3,name:'Bilal',father:1,gender:'M',dob:'1970-01-15'},
{id:4,name:'Aisha',father:1,gender:'F',dob:'1975-09-20'},
{id:5,name:'Usman',father:2,gender:'M',dob:'1990-04-04'},
{id:6,name:'Fatima',father:2,gender:'F',dob:'1994-12-12'},
{id:7,name:'Hamza',father:3,gender:'M',dob:'1998-08-08'}];
const esc=s=>String(s??'').replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
function lsGet(k){try{return localStorage.getItem(k)}catch(e){return null}}
function lsSet(k,v){try{localStorage.setItem(k,v)}catch(e){}}
async function load(){
 try{const r=await fetch(API);if(!r.ok)throw 0;const d=await r.json();if(Array.isArray(d)&&d.length){lsSet(KEY,JSON.stringify(d));return d}}catch(e){}
 try{const d=JSON.parse(lsGet(KEY));if(Array.isArray(d)&&d.length)return d}catch(e){}
 return SAMPLE.slice()}
async function api(method,body){try{const r=await fetch(API,{method,headers:{'Content-Type':'application/json'},body:JSON.stringify(body)});return r.status}catch(e){return 0}}
async function save(d,pw){const m=d.map(({_id,...r})=>r);const s=await api('POST',{members:m,password:pw});
 if(s==201||s==200){lsSet(KEY,JSON.stringify(m));return true}
 alert(s==401?'Ghalat password':'Server par save nahi hua (MongoDB check karein)');return false}
function age(m){if(!m.dob)return '';const y=Math.floor((Date.now()-new Date(m.dob))/31557600000);return y>=0?y+' saal':''}
function dl(name,text,type){const a=document.createElement('a');a.href=URL.createObjectURL(new Blob([text],{type}));a.download=name;a.click()}
function header(on){
 if(lsGet('shajra_dark')=='1')document.body.classList.add('dark');
 document.getElementById('hdr').innerHTML=`<div class="top"><span class="logo">Family Shajra</span><a class="btn r" href="admin.html">🔒 Admin</a></div>
<nav><a href="index.html" class="${on=='home'?'on':''}">🏠 Home</a><a href="stats.html" class="${on=='stats'?'on':''}">📊 Stats</a><a href="about.html" class="${on=='about'?'on':''}">ℹ️ About</a><a href="#" id="mb">☰ Menu</a>
<div id="menuBox"><a href="#" id="dk">🌙 Dark mode</a><a href="#" id="sh">📤 WhatsApp par share</a><a href="#" id="bk">💾 Backup download</a><a href="admin.html">🔒 Admin panel</a></div></nav>`;
 const b=document.getElementById('menuBox'),$=i=>document.getElementById(i);
 $('mb').onclick=e=>{e.preventDefault();b.style.display=b.style.display=='block'?'none':'block'};
 $('dk').onclick=e=>{e.preventDefault();const o=document.body.classList.toggle('dark');lsSet('shajra_dark',o?'1':'0')};
 $('sh').onclick=e=>{e.preventDefault();const t='Hamari family ka shajra '+location.href;
  if(navigator.share)navigator.share({title:'Family Shajra',text:t}).catch(()=>{});else window.open('https://wa.me/?text='+encodeURIComponent(t))};
 $('bk').onclick=async e=>{e.preventDefault();dl('shajra-backup-'+new Date().toISOString().slice(0,10)+'.json',JSON.stringify(await load(),null,1),'application/json')};
 try{if('serviceWorker' in navigator&&location.protocol.startsWith('http'))navigator.serviceWorker.register('sw.js')}catch(e){}
}
