import { put, list } from "@vercel/blob";

export default async function handler(req, res) {

  try {

    /* =================================================
       GET
       Devuelve todos los mods
    ================================================= */

    if (req.method === "GET") {

      const result = await list({
        prefix: "mods/"
      });

      const mods = [];

      for (const blob of result.blobs) {

        if (!blob.pathname.endsWith("/mod.json"))
          continue;

        try {

          const response =
            await fetch(blob.url);

          if (!response.ok)
            continue;

          const mod =
            await response.json();

          mods.push(mod);

        } catch (e) {

          console.error(
            "Could not read:",
            blob.pathname,
            e
          );

        }

      }

      mods.sort((a, b) =>
        new Date(b.date || 0) -
        new Date(a.date || 0)
      );

      return res.status(200).json(mods);
    }


    /* =================================================
       POST
       Guarda un mod.json
    ================================================= */

    if (req.method === "POST") {

      const mod = req.body;

      if (!mod || !mod.id)
        return res.status(400).json({
          error: "Missing mod id"
        });


      const id = String(mod.id);

      if (
        !/^[a-z0-9-]+$/i.test(id) ||
        id.length > 50
      ) {

        return res.status(400).json({
          error: "Invalid mod id"
        });

      }


      const pathname =
        `mods/${id}/mod.json`;


      const blob = await put(

        pathname,

        JSON.stringify(mod, null, 2),

        {
          access: "public",

          contentType:
            "application/json",

          addRandomSuffix: false
        }

      );


      return res.status(200).json({
        ok: true,
        url: blob.url
      });

    }


    return res.status(405).json({
      error: "Method not allowed"
    });


  } catch (error) {

    console.error(error);

    return res.status(500).json({
      error:
        error.message ||
        "Server error"
    });

  }

}
