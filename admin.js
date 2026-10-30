const SK='shajra_admin';
const sess=()=>{try{return JSON.parse(lsGet(SK))}catch(e){return null}};
function logout(){try{localStorage.removeItem(SK)}catch(e){}location.href='admin.html'}
const PAGES=[['admin.html','🏠','Dashboard'],['admin-members.html','👪','Members'],['admin-site.html','🌐','Site ka naam'],['admin-users.html','🔑','Password'],['admin-backup.html','💾','Backup',1],['admin-log.html','📜','Log',1]];
// Session check + admin heading (login karne wale ka naam). {C,me,master} ya null.
async function guard(page,stay){
 const s=sess();if(!s){if(!stay)location.href='admin.html';return null}
 const r=await apiJ(API,{token:s.token,op:'ping'});
 if(r.s!=200){try{localStorage.removeItem(SK)}catch(e){}if(!stay)location.href='admin.html';else location.reload();return null}
 const me=r.j,master=me.role==='master',cur=PAGES.find(p=>p[0]==page);
 if(cur&&cur[3]&&!master){location.href='admin.html';return null}
 document.getElementById('adm').innerHTML=`<div class="abar"><div><small>${master?'Master admin':'Admin'}</small><h2>👤 ${esc(me.user||'Master')}</h2></div><button class="btn r" onclick="logout()">Logout</button></div>
<div class="anav">${PAGES.filter(p=>!p[3]||master).map(p=>`<a href="${p[0]}" class="${p[0]==page?'on':''}">${p[1]} ${p[2]}</a>`).join('')}</div><h3 class="ptitle">${cur?cur[1]+' '+cur[2]:''}</h3>`;
 return {C:{token:s.token},me,master};
}
