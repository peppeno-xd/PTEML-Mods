import { put, list, del } from "@vercel/blob";


async function getFirebaseAdmin() {

  const { cert, getApps, initializeApp } =
    await import("firebase-admin/app");

  const { getAuth } =
    await import("firebase-admin/auth");


  if (!getApps().length) {

    const serviceAccount =
      JSON.parse(
        process.env.FIREBASE_SERVICE_ACCOUNT
      );


    initializeApp({
      credential: cert(serviceAccount)
    });

  }


  return getAuth();

}


async function verifyUser(req) {

  const authorization =
    req.headers.authorization || "";


  if (!authorization.startsWith("Bearer ")) {

    throw new Error(
      "Missing authorization token"
    );

  }


  const token =
    authorization.substring(7);


  const adminAuth =
    await getFirebaseAdmin();


  return await adminAuth.verifyIdToken(
    token
  );

}


export default async function handler(req, res) {

  try {


    /*
      GET
      Lista todos los mods
    */

    if (req.method === "GET") {

      const result =
        await list({
          prefix: "mods/"
        });


      const mods = [];


      for (const blob of result.blobs) {

        if (
          !blob.pathname.endsWith(
            "/mod.json"
          )
        )
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


      mods.sort(
        (a, b) =>
          new Date(b.date || 0) -
          new Date(a.date || 0)
      );


      return res
        .status(200)
        .json(mods);

    }


    /*
      POST
      Guarda información del mod
    */

    if (req.method === "POST") {

      const mod = req.body;


      if (!mod || !mod.id) {

        return res
          .status(400)
          .json({
            error:
              "Missing mod id"
          });

      }


      const id =
        String(mod.id);


      if (
        !/^[a-z0-9-]+$/i.test(id) ||
        id.length > 50
      ) {

        return res
          .status(400)
          .json({
            error:
              "Invalid mod id"
          });

      }


      const pathname =
        `mods/${id}/mod.json`;


      const blob =
        await put(
          pathname,
          JSON.stringify(
            mod,
            null,
            2
          ),
          {
            access: "public",

            contentType:
              "application/json",

            addRandomSuffix:
              false
          }
        );


      return res
        .status(200)
        .json({
          ok: true,
          url: blob.url
        });

    }


    /*
      DELETE
      Borra el mod completo
    */

    if (req.method === "DELETE") {


      /*
        Verificar Firebase
      */

      const user =
        await verifyUser(req);


      const id =
        String(
          req.query?.id || ""
        );


      if (!id) {

        return res
          .status(400)
          .json({
            error:
              "Missing mod id"
          });

      }


      if (
        !/^[a-z0-9-]+$/i.test(id)
      ) {

        return res
          .status(400)
          .json({
            error:
              "Invalid mod id"
          });

      }


      /*
        Buscar mod.json
      */

      const modPath =
        `mods/${id}/mod.json`;


      const jsonResult =
        await list({
          prefix:
            modPath
        });


      const jsonBlob =
        jsonResult.blobs.find(
          blob =>
            blob.pathname ===
            modPath
        );


      if (!jsonBlob) {

        return res
          .status(404)
          .json({
            error:
              "Mod not found"
          });

      }


      /*
        Leer mod.json
      */

      const response =
        await fetch(
          jsonBlob.url
        );


      if (!response.ok) {

        return res
          .status(500)
          .json({
            error:
              "Could not read mod information"
          });

      }


      const mod =
        await response.json();


      /*
        Comprobar propietario
      */

      if (
        !mod.authorUid ||
        String(mod.authorUid) !==
        String(user.uid)
      ) {

        return res
          .status(403)
          .json({
            error:
              "You are not the owner of this mod"
          });

      }


      /*
        Buscar TODOS los archivos
        pertenecientes al mod.
      */

      const allFiles =
        await list({
          prefix:
            `mods/${id}/`
        });


      /*
        Borrar ZIP, icon, banner,
        mod.json, etc.
      */

      for (
        const blob of allFiles.blobs
      ) {

        try {

          await del(
            blob.url
          );

        } catch (e) {

          console.error(
            "Could not delete:",
            blob.pathname,
            e
          );

        }

      }


      return res
        .status(200)
        .json({
          ok: true,

          message:
            "Mod deleted successfully"
        });

    }


    return res
      .status(405)
      .json({
        error:
          "Method not allowed"
      });


  } catch (error) {

    console.error(
      "API ERROR:",
      error
    );


    return res
      .status(500)
      .json({
        error:
          error.message ||
          "Server error"
      });

  }

}
