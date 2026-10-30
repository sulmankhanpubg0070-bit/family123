const AK='shajra_admin';
function gc(){for(const s of [sessionStorage,localStorage]){try{const v=s.getItem(AK);if(v)return JSON.parse(v)}catch(e){}}return null}
function clr(){try{sessionStorage.removeItem(AK);localStorage.removeItem(AK)}catch(e){}}
function sc(c,rem){clr();try{(rem?localStorage:sessionStorage).setItem(AK,JSON.stringify(c))}catch(e){}}
function logout(){clr();location.href='admin.html'}
const PAGES=[['admin.html','🏠','Dashboard'],['admin-members.html','👥','Members'],['admin-site.html','🌐','Site'],['admin-accounts.html','🔑','Passwords','m'],['admin-backup.html','💾','Backup'],['admin-log.html','📜','Log','m']];
function shell(on,c,role){
 if(lsGet('shajra_dark')=='1')document.body.classList.add('dark');
 document.getElementById('hdr').innerHTML=`<div class="ab"><h1>🛠 Admin Panel · 👤 ${esc(c.user||'Master')}<span class="chip">${role=='master'?'Master':'Admin'}</span></h1><button class="btn r" onclick="logout()">Logout</button></div>
<div class="tabs">${PAGES.filter(p=>!p[3]||role=='master').map(p=>`<a href="${p[0]}" class="${p[0]==on?'on':''}">${p[1]} ${p[2]}</a>`).join('')}<a href="index.html">🌳 Site</a></div>`}
// Login yaad rehta hai (refresh par dubara nahi maangta). Ghalat ho to admin.html par bhejta hai.
async function adminInit(on,needMaster){
 const c=gc();if(!c){location.href='admin.html';return null}
 const r=await apiJ(API,{...c,op:'ping'});
 if(r.s!=200){if(r.s==401)clr();location.href='admin.html';return null}
 const role=r.j.role;if(needMaster&&role!='master'){location.href='admin.html';return null}
 shell(on,c,role);return {C:{user:c.user,password:c.password},role}}
