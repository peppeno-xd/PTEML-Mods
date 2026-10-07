let mods=[];
const grid=document.getElementById("mods"),empty=document.getElementById("empty"),search=document.getElementById("search"),sort=document.getElementById("sort");
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

        author: d.author || "",

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
          ""

      };

    });

    renderMods();

  }catch(e){

    console.error(e);

    grid.replaceChildren();

    empty.textContent =
      "Couldn't load mods. :(";

    empty.classList.remove("hidden");

  }

}
function renderMods(){
 const q=search.value.toLowerCase().trim();
 let a=mods.filter(m=>(m.name+" "+m.description+" "+m.author).toLowerCase().includes(q));
 a.sort((x,y)=>sort.value==="name"?x.name.localeCompare(y.name):new Date(y.date)-new Date(x.date));
 grid.replaceChildren();
 if(!a.length){empty.textContent="No mods found. :(";empty.classList.remove("hidden");return}
 empty.classList.add("hidden");
 for(const m of a){
  const c=document.createElement("a"); c.className="mod-card"; c.href=`mod.html?id=${encodeURIComponent(m.id)}`;
  c.innerHTML=`<div class="mod-images"><img class="mod-banner" src="${esc(m.banner||'assets/missing-banner.png')}" alt="" onerror="this.src='assets/missing-banner.png'"><img class="mod-icon" src="${esc(m.icon||'assets/missing-mod.png')}" alt="${esc(m.name)}'s Icon" onerror="this.src='assets/missing-mod.png'"></div><div class="mod-content"><h2>${esc(m.name)}</h2><p>${esc(m.smalldesc||m.description||"")}</p><span class="version">v${esc(m.version)} · ${esc(m.author)}</span></div>`;
  grid.appendChild(c);
 }
}
function esc(s){return String(s??"").replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#039;"}[c]))}
search.addEventListener("input",renderMods);
sort.addEventListener("change",()=>{renderMods()});
loadMods();
