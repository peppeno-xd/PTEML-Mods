import { auth } from "./firebase.js";

import {
  onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/12.0.0/firebase-auth.js";


const detail =
  document.getElementById("detail");


const id =
  new URLSearchParams(location.search).get("id");


let currentUser = null;


function esc(s) {

  return String(s ?? "").replace(
    /[&<>"']/g,

    c => ({
      "&": "&amp;",
      "<": "&lt;",
      ">": "&gt;",
      '"': "&quot;",
      "'": "&#039;"
    }[c])
  );

}


async function load() {

  if (!id || id.includes("..")) {

    detail.innerHTML =
      '<p class="empty">This mod was not found. :(</p>';

    return;

  }


  try {

    const r =
      await fetch(
        "/api/mods",
        { cache: "no-store" }
      );


    if (!r.ok)
      throw new Error("Could not load mods");


    const mods =
      await r.json();


    const d =
      mods.find(
        m =>
          String(m.id) ===
          String(id)
      );


    if (!d) {

      detail.innerHTML =
        '<p class="empty">This mod was not found. :(</p>';

      return;

    }


    const credits =
      Array.isArray(d.credits)
        ? d.credits
        : [];


    const author =
      d.author || "";


    const icon =
      d.icon ||
      `/mods/${encodeURIComponent(id)}/icon.png`;


    const banner =
      d.banner ||
      `/mods/${encodeURIComponent(id)}/banner.png`;


    const download =
      d.download ||
      `/mods/${encodeURIComponent(id)}/${encodeURIComponent(id)}.zip`;


    const isOwner =
      currentUser &&
      d.authorUid &&
      String(currentUser.uid) ===
      String(d.authorUid);


    document.title =
      `${d.name || id} - PTEM Mods`;


    detail.innerHTML = `

      <div class="mod-layout">


        <aside class="media-column">


          <div class="media-panel icon-panel">

            <img
              class="detail-icon"
              src="${esc(icon)}"
              alt="${esc(d.name || id)}"
              onerror="this.src='assets/missing-mod.png'"
            >

          </div>


          <div class="media-panel banner-panel">

            <img
              class="detail-banner"
              src="${esc(banner)}"
              alt=""
              onerror="this.src='assets/missing-banner.png'"
            >

          </div>


        </aside>


        <section class="detail-column">


          <div class="title-row">


            <div class="title-panel">


              <div>

                <h1>
                  ${esc(d.name || id)}
                </h1>


                <div class="meta">

                  v${esc(d.version || "1.0")}

                  ·

                  ${
                    d.authorUid
                      ? `
                        <a
                          href="profile.html?id=${encodeURIComponent(d.authorUid)}"
                        >
                          ${esc(author || "Unknown User")}
                        </a>
                      `
                      : esc(author)
                  }

                </div>


              </div>


            </div>


            <a
              class="download-button"
              href="${esc(download)}"
              download
            >

              <img
                src="assets/download.png"
                alt="Download ${esc(d.name || id)}"
              >

            </a>


          </div>


          ${
            isOwner
              ? `

                <div class="owner-panel">

                  <button
                    id="delete-mod"
                    class="delete-button"
                    type="button"
                  >
                    Delete Mod
                  </button>

                </div>

              `
              : ""
          }


          <div class="detail-panel description-panel">


            <h2 class="panel-title">
              Description
            </h2>


            <div class="description">

              ${esc(
                d.description ||
                d.desc ||
                "No description."
              )}

            </div>


          </div>


          <div class="detail-panel credits-panel">


            <h2 class="panel-title">

              Credits

              <img
                src="assets/credits.png"
                alt=""
              >

            </h2>


            <div class="credits-list">

              ${
                credits.length

                  ? credits
                      .map(
                        x =>
                          `<div class="credit">${esc(x)}</div>`
                      )
                      .join("")

                  : '<div class="missing">No credits listed.</div>'
              }

            </div>


          </div>


        </section>


      </div>

    `;


    /*
      Botón de borrar
    */

    if (isOwner) {

  const deleteButton =
    document.getElementById("delete-mod");

  deleteButton.addEventListener(
    "click",
    async () => {

      const confirmed =
        confirm(
          `Delete "${d.name || id}"?\n\nThis will delete the mod, ZIP, icon and banner.`
        );

      if (!confirmed)
        return;

      deleteButton.disabled = true;
      deleteButton.textContent = "Deleting...";

      try {

        const token =
          await currentUser.getIdToken();

        const response =
          await fetch(
            `/api/mods?id=${encodeURIComponent(id)}`,
            {
              method: "DELETE",
              headers: {
                "Authorization": `Bearer ${token}`
              }
            }
          );

        const result =
          await response.json();

        if (!response.ok)
          throw new Error(
            result.error || "Could not delete mod"
          );

        detail.innerHTML = `

          <p class="empty">

            Mod deleted successfully!<br><br>

            <a href="index.html">
              ← Back to Mods
            </a>

          </p>

        `;

      } catch (error) {

        console.error(error);

        alert(
          "ERROR: " +
          error.message
        );

        deleteButton.disabled = false;
        deleteButton.textContent =
          "Delete Mod";

      }

    }
  );

}

  } catch (e) {

    console.error(e);


    detail.innerHTML =
      '<p class="empty">Could not load this mod :(.</p>';

  }

}


/*
  Esperamos a Firebase antes de cargar
  el mod para saber si hay que mostrar
  Delete Mod.
*/

onAuthStateChanged(
  auth,
  user => {

    currentUser = user;

    load();

  }
);
