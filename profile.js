import { auth } from "./firebase.js";
import {
  onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/12.0.0/firebase-auth.js";


const profile = document.getElementById("profile");
const modsContainer = document.getElementById("profile-mods");
const noMods = document.getElementById("no-mods");


// UID especificado en la URL
const urlId =
  new URLSearchParams(location.search).get("id");


function esc(value) {

  return String(value ?? "").replace(
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


function renderMods(mods) {

  modsContainer.innerHTML = "";

  if (!mods.length) {

    noMods.classList.remove("hidden");

    return;

  }

  noMods.classList.add("hidden");


  mods
    .sort(
      (a, b) =>
        new Date(b.date || 0) -
        new Date(a.date || 0)
    )
    .forEach(mod => {

      const card =
        document.createElement("a");

      card.className = "mod-card";

      card.href =
        `mod.html?id=${encodeURIComponent(mod.id)}`;


      const icon =
        mod.icon ||
        `mods/${encodeURIComponent(mod.id)}/icon.png`;


      card.innerHTML = `

        <img
          class="mod-icon"
          src="${esc(icon)}"
          alt="${esc(mod.name || mod.id)}"
          onerror="this.src='assets/missing-mod.png'"
        >

        <div class="mod-card-info">

          <h3>
            ${esc(mod.name || mod.id)}
          </h3>

          <p>
            v${esc(mod.version || "1.0")}
          </p>

          <p>
            ${esc(
              mod.smalldesc ||
              mod.description ||
              "No description."
            )}
          </p>

        </div>

      `;


      modsContainer.appendChild(card);

    });

}


async function loadProfile(currentUser) {

  try {

    const response =
      await fetch(
        "/api/mods",
        { cache: "no-store" }
      );


    if (!response.ok)
      throw new Error("Could not load mods");


    const mods =
      await response.json();


    /*
      Si no hay ?id=...
      usamos al usuario actualmente logueado.
    */

    const targetId =
      urlId ||
      currentUser?.uid;


    if (!targetId) {

      profile.innerHTML = `
        <div class="detail-panel">

          <h1>
            Profile
          </h1>

          <p class="empty">
            You must log in to view your profile.
          </p>

        </div>
      `;

      return;

    }


    /*
      Buscamos los mods pertenecientes
      a este UID.
    */

    const userMods =
      mods.filter(
        mod =>
          String(mod.authorUid) ===
          String(targetId)
      );


    /*
      Como los mods ya guardan el nombre
      del autor, usamos ese nombre.
    */

    let authorName = "";


    if (userMods.length > 0) {

      authorName =
        userMods[0].author || "";

    }


    /*
      Si estamos viendo nuestro propio perfil,
      Firebase nos da el nombre real actual.
    */

    const isOwnProfile =
      currentUser &&
      String(currentUser.uid) ===
      String(targetId);


    if (isOwnProfile) {

      authorName =
        currentUser.displayName ||
        currentUser.email ||
        authorName ||
        "User";

    }


    if (!authorName)
      authorName = "PTEM User";


    profile.innerHTML = `

      <div class="detail-panel profile-panel">

        <h1>
          ${esc(authorName)}
        </h1>

        ${
          isOwnProfile
            ? `
              <p>
                ${esc(currentUser.email || "")}
              </p>
            `
            : ""
        }

        <p class="meta">
          ${userMods.length}
          ${userMods.length === 1 ? "mod" : "mods"}
        </p>

      </div>

    `;


    renderMods(userMods);


  } catch (error) {

    console.error(error);


    profile.innerHTML = `

      <p class="empty">
        Could not load this profile :(
      </p>

    `;

  }

}


onAuthStateChanged(
  auth,
  user => {

    loadProfile(user);

  }
);
