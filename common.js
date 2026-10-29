const KEY='shajra_data',PASS='1234';
const SAMPLE=[
{id:1,name:'Dada Ji',father:null,gender:'M'},
{id:2,name:'Ahmad',father:1,gender:'M'},
{id:3,name:'Bilal',father:1,gender:'M'},
{id:4,name:'Aisha',father:1,gender:'F'},
{id:5,name:'Usman',father:2,gender:'M'},
{id:6,name:'Fatima',father:2,gender:'F'},
{id:7,name:'Hamza',father:3,gender:'M'}];
function getData(){try{const d=JSON.parse(localStorage.getItem(KEY));if(Array.isArray(d)&&d.length)return d}catch(e){}return SAMPLE.slice()}
function saveData(d){localStorage.setItem(KEY,JSON.stringify(d))}
function header(on){
document.getElementById('hdr').innerHTML=`<div class="top"><span class="logo">Family Shajra</span><a class="btn r" href="admin.html">🔒 Admin</a></div>
<nav><a href="index.html" class="${on=='home'?'on':''}">🏠 Home</a><a href="stats.html" class="${on=='stats'?'on':''}">📊 Stats</a><a href="about.html" class="${on=='about'?'on':''}">ℹ️ About</a><a href="#" id="mb">☰ Menu</a>
<div id="menuBox"><a href="admin.html">Admin panel</a><a href="about.html">About</a><a href="#" id="exp">Data export</a></div></nav>`;
const b=document.getElementById('menuBox');
document.getElementById('mb').onclick=e=>{e.preventDefault();b.style.display=b.style.display=='block'?'none':'block'};
document.getElementById('exp').onclick=e=>{e.preventDefault();const a=document.createElement('a');a.href=URL.createObjectURL(new Blob([JSON.stringify(getData(),null,1)],{type:'application/json'}));a.download='shajra-data.json';a.click()};
}
