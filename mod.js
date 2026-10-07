const detail=document.getElementById("detail");
const id=new URLSearchParams(location.search).get("id");
function esc(s){return String(s??"").replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#039;"}[c]))}
async function load(){
 if(!id||id.includes("..")){detail.innerHTML='<p class="empty">This mod was not found. :(</p>';return}
 try{
  const r=await fetch(`/api/mods/${encodeURIComponent(id)}`,{cache:"no-store"});
  if(!r.ok)throw new Error();
  const d=await r.json();
  const credits=Array.isArray(d.credits)?d.credits:[];
  const author=credits.length?String(credits[0]).split(" - ")[0]:(d.author||"");
  const icon=d.icon||"assets/missing-mod.png",banner=d.banner||"assets/missing-banner.png";
  const download=d.download||"#";
  document.title=`${d.name||id} - PTEM Mods`;
  detail.innerHTML=`<div class="mod-layout"><aside class="media-column"><div class="media-panel icon-panel"><img class="detail-icon" src="${esc(icon)}" onerror="this.src='assets/missing-mod.png'"></div><div class="media-panel banner-panel"><img class="detail-banner" src="${esc(banner)}" alt="" onerror="this.src='assets/missing-banner.png'"></div></aside><section class="detail-column"><div class="title-row"><div class="title-panel"><div><h1>${esc(d.name||id)}</h1><div class="meta">v${esc(d.version||"1.0")} · ${esc(author)}</div></div></div><a class="download-button${download==="#"?" disabled":""}" id="download" href="${esc(download)}" ${download==="#"?"aria-disabled=\"true\"":"target=\"_blank\" rel=\"noopener\""}><img src="assets/download.png" alt="Download ${esc(d.name||id)}"></a></div><div class="detail-panel description-panel"><h2 class="panel-title">Description</h2><div class="description">${esc(d.description||"No description.")}</div></div><div class="detail-panel credits-panel"><h2 class="panel-title">Credits<img src="assets/credits.png" alt=""></h2><div class="credits-list">${credits.length?credits.map(x=>`<div class="credit">${esc(x)}</div>`).join(""):'<div class="missing">No credits listed.</div>'}</div></div></section></div>`;
 }catch(e){detail.innerHTML='<p class="empty">Could not load this mod :(.</p>';console.error(e)}
}
load();
