function esc(s){return String(s??"").replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#039;"}[c]))}
const detail=document.getElementById("detail");
async function loadMods(){

  try{

    const r = await fetch(
      "/api/mods",
      {cache:"no-store"}
    );

    if(!r.ok)
      throw new Error("Could not load mods");

    mods = await r.json();

    mods = mods.map(d => {

      const id =
        String(d.id || d.name || "")
          .replace(/^\/+|\/+$/g,"");

      return {

        id,

        name: d.name || id,

        description:
          d.description ||
          d.desc ||
          "",

        version:
          d.version ||
          "",

        author:
          Array.isArray(d.credits) &&
          d.credits.length
            ? String(d.credits[0])
                .split(" - ")[0]
            : (d.author || ""),

        icon:
          d.icon ||
          `/mods/${encodeURIComponent(id)}/icon.png`,

        banner:
          d.banner ||
          `/mods/${encodeURIComponent(id)}/banner.png`,

        date:
          d.date ||
          d.updated_at ||
          "1970-01-01",

        smalldesc:
          d.smalldesc ||
          d.desc ||
          "",

        download:
          d.download ||
          ""
      };

      load();

    });

  }catch(e){

    console.error(e);

    grid.replaceChildren();

    detail.innerHTML='<p class="empty">Could not load this mod :(.</p>'

  }

}
async function load(){
  document.title=`${name} - PTEM Mods`;
  detail.innerHTML=`<div class="mod-layout"><aside class="media-column"><div class="media-panel icon-panel"><img class="detail-icon" src="${esc(m.icon)}" onerror="this.src='assets/missing-mod.png'"></div><div class="media-panel banner-panel"><img class="detail-banner" src="${esc(m.banner)}" alt="" onerror="this.src='assets/missing-banner.png'"></div></aside><section class="detail-column"><div class="title-row"><div class="title-panel"><div><h1>${esc(m.name)}</h1><div class="meta">v${esc(m.version)} · ${esc(m.author)}</div></div></div><a class="download-button" id="download" href="${esc(m.download)}" download><img src="assets/download.png" alt="Download ${m.name}"></a></div><div class="detail-panel description-panel"><h2 class="panel-title">Description</h2><div class="description">${esc(m.description||"No description.")}</div></div><div class="detail-panel credits-panel"><h2 class="panel-title">Credits<img src="assets/credits.png" alt=""></h2><div class="credits-list">${m.credits.length?m.credits.map(x=>`<div class="credit">${esc(x)}</div>`).join(""):'<div class="missing">No credits listed.</div>'}</div></div></section></div>`;
  const dl=document.getElementById("download");
  dl.addEventListener("error",()=>{});
 }catch(e){detail.innerHTML='<p class="empty">Could not load this mod :(.</p>';console.error(e)}
}
loadMods();
