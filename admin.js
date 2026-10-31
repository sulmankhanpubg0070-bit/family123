const AK='shajra_admin',SOFT=3*3600e3; // login 3 ghante
function gc(){for(const s of [sessionStorage,localStorage]){try{const v=s.getItem(AK);if(v)return JSON.parse(v)}catch(e){}}return null}
function clr(){try{sessionStorage.removeItem(AK);localStorage.removeItem(AK)}catch(e){}}
function sc(c,rem){clr();try{(rem?localStorage:sessionStorage).setItem(AK,JSON.stringify({...c,exp:Date.now()+SOFT}))}catch(e){}}
// Logout ke baad seedha site ka Home page
function logout(){clr();location.href='index.html'}
function why(r){if(!r)return '';
 if(r.s==0)return 'Server tak rabta nahi hua (internet ya deploy check karein)';
 if(r.s==429)return (r.j&&r.j.error)||'Bohat ghalat koshishen, 2 minute baad try karein';
 if(r.s==401&&r.j&&r.j.expired)return 'Login ka waqt (3 ghante) khatam ho gaya, dobara login karein';
 if(r.s==401&&!r.j)return 'Vercel ne request roki (Deployment Protection). Vercel > Settings > Deployment Protection check karein';
 if(r.s==401)return 'Username/password ghalat hai, ya is deployment mein ADMIN_PASSWORD set nahi (Preview environment check karein)';
 if(r.s==404)return '/api/members nahi mila (api folder deploy nahi hua)';
 return 'Server error '+r.s+': '+((r.j&&(r.j.details||r.j.error))||'')}
const PAGES=[['admin.html','🏠','Dashboard'],['admin-members.html','👥','Members'],['admin-site.html','🌐','Site'],['admin-accounts.html','🔑','Passwords','m'],['admin-backup.html','💾','Backup'],['admin-log.html','📜','Log','m']];
function shell(on,name,role){
 if(lsGet('shajra_dark')=='1')document.body.classList.add('dark');
 const rl={master:'Master',admin:'Admin',editor:'Editor'}[role]||'Admin';
 document.getElementById('hdr').innerHTML=`<div class="ab"><h1>🛠 Admin Panel · 👤 ${esc(name||'Master')}<span class="chip">${rl}</span></h1><button class="btn r" onclick="logout()">Logout</button></div>
<div class="tabs">${PAGES.filter(p=>!p[3]||role=='master').map(p=>`<a href="${p[0]}" class="${p[0]==on?'on':''}">${p[1]} ${p[2]}</a>`).join('')}<a href="index.html">🌳 Site</a></div>`}
// Login 3 ghante ka hai. Agar aap admin ke andar kaam kar rahe hain (ek admin page se doosre par ja rahe hain)
// to beech mein logout nahi hota; admin se bahar nikal kar wapas aane par (3 ghante baad) dubara login maanga jata hai.
// Dashboard par login na ho to redirect nahi (loop se bachne ke liye).
async function adminInit(on,needMaster){
 const home=on=='admin.html',bad=()=>{if(!home)location.href='admin.html';return null};
 const c=gc();if(!c||!c.token)return bad();
 const inside=/\/admin[^/]*$/.test(String(document.referrer||'').split('?')[0].split('#')[0]);
 if(c.exp&&Date.now()>c.exp&&!inside){clr();window.adminErr={s:401,j:{expired:1}};return bad()}
 const r=await apiJ(API,{token:c.token,op:'ping'});
 if(r.s!=200){window.adminErr=r;if(r.s==401&&r.j)clr();return bad()}
 const role=r.j.role;if(needMaster&&role!='master')return bad();
 shell(on,r.j.user,role);return {C:{token:c.token},role,user:r.j.user}}
