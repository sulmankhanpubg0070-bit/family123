const AK='shajra_admin';
function gc(){for(const s of [sessionStorage,localStorage]){try{const v=s.getItem(AK);if(v)return JSON.parse(v)}catch(e){}}return null}
function clr(){try{sessionStorage.removeItem(AK);localStorage.removeItem(AK)}catch(e){}}
function sc(c,rem){clr();try{(rem?localStorage:sessionStorage).setItem(AK,JSON.stringify(c))}catch(e){}}
function logout(){clr();location.href='admin.html'}
// Error ki wajah saaf lafzon mein
function why(r){if(!r)return '';
 if(r.s==0)return 'Server tak rabta nahi hua (internet ya deploy check karein)';
 if(r.s==429)return (r.j&&r.j.error)||'Bohat ghalat koshishen, 15 minute baad try karein';
 if(r.s==401&&!r.j)return 'Vercel ne request roki (Deployment Protection). Vercel > Settings > Deployment Protection check karein';
 if(r.s==401)return 'Username/password ghalat hai, ya is deployment mein ADMIN_PASSWORD set nahi (Preview environment check karein)';
 if(r.s==404)return '/api/members nahi mila (api folder deploy nahi hua)';
 return 'Server error '+r.s+': '+((r.j&&(r.j.details||r.j.error))||'')}
const PAGES=[['admin.html','🏠','Dashboard'],['admin-members.html','👥','Members'],['admin-site.html','🌐','Site'],['admin-accounts.html','🔑','Passwords','m'],['admin-backup.html','💾','Backup'],['admin-log.html','📜','Log','m']];
function shell(on,c,role){
 if(lsGet('shajra_dark')=='1')document.body.classList.add('dark');
 document.getElementById('hdr').innerHTML=`<div class="ab"><h1>🛠 Admin Panel · 👤 ${esc(c.user||'Master')}<span class="chip">${role=='master'?'Master':'Admin'}</span></h1><button class="btn r" onclick="logout()">Logout</button></div>
<div class="tabs">${PAGES.filter(p=>!p[3]||role=='master').map(p=>`<a href="${p[0]}" class="${p[0]==on?'on':''}">${p[1]} ${p[2]}</a>`).join('')}<a href="index.html">🌳 Site</a></div>`}
// Dashboard par login na ho to redirect nahi karta (loop se bachne ke liye). Baqi pages admin.html bhejte hain.
async function adminInit(on,needMaster){
 const home=on=='admin.html',bad=()=>{if(!home)location.href='admin.html';return null};
 const c=gc();if(!c)return bad();
 const r=await apiJ(API,{...c,op:'ping'});
 if(r.s!=200){window.adminErr=r;if(r.s==401&&r.j)clr();return bad()}
 const role=r.j.role;if(needMaster&&role!='master')return bad();
 shell(on,c,role);return {C:{user:c.user,password:c.password},role}}
