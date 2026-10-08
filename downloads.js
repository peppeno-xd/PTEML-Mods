const grid =
  document.getElementById("downloads");

const empty =
  document.getElementById("empty");


async function loadDownloads()
{
  try
  {
    const response =
      await fetch(
        "/api/downloads",
        {
          cache: "no-store"
        }
      );

    if (!response.ok)
      throw new Error(
        "Could not load downloads"
      );


    const files =
      await response.json();


    renderDownloads(files);

  }
  catch (error)
  {
    console.error(error);

    grid.replaceChildren();

    empty.textContent =
      "Couldn't load downloads. :(";

    empty.classList.remove("hidden");
  }
}


function renderDownloads(files)
{
  grid.replaceChildren();


  if (!files.length)
  {
    empty.textContent =
      "No downloads found. :(";

    empty.classList.remove("hidden");

    return;
  }


  empty.classList.add("hidden");


  for (const file of files)
  {
    const card =
      document.createElement("div");

    card.className =
      "mod-card";


    const size =
      file.size
        ? formatSize(file.size)
        : "";


    card.innerHTML = `

      <div class="mod-content">

        <h2>
          ${esc(file.name)}
        </h2>

        <p>
          ${esc(
            file.description ||
            "PTEM Download"
          )}
        </p>

        <span class="version">
          ${esc(file.type || "FILE")}
          ${size ? " · " + size : ""}
        </span>

        <br><br>

        <a
          class="download-button"
          href="${esc(file.url)}"
          download
        >
          DOWNLOAD
        </a>

      </div>

    `;


    grid.appendChild(card);
  }
}


function formatSize(bytes)
{
  if (bytes < 1024)
    return bytes + " B";

  if (bytes < 1024 * 1024)
    return (
      (bytes / 1024).toFixed(1) +
      " KB"
    );

  return (
    (bytes / 1024 / 1024).toFixed(1) +
    " MB"
  );
}


function esc(value)
{
  return String(value ?? "")
    .replace(
      /[&<>"']/g,
      c =>
      ({
        "&": "&amp;",
        "<": "&lt;",
        ">": "&gt;",
        '"': "&quot;",
        "'": "&#039;"
      }[c])
    );
}


loadDownloads();
