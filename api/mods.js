import { put, list, del } from "@vercel/blob";

import {
  cert,
  getApps,
  initializeApp
} from "firebase-admin/app";

import {
  getAuth
} from "firebase-admin/auth";


function getFirebaseAdmin() {

  if (!getApps().length) {

    const serviceAccount =
      JSON.parse(
        process.env.FIREBASE_SERVICE_ACCOUNT
      );


    initializeApp({
      credential:
        cert(serviceAccount)
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


  const auth =
    getFirebaseAdmin();


  return await auth.verifyIdToken(token);

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
        Primero verificamos Firebase.
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
        Buscamos el mod.
      */

      const modPath =
        `mods/${id}/mod.json`;


      const result =
        await list({
          prefix:
            modPath
        });


      const jsonBlob =
        result.blobs.find(
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
        Leemos el mod.json.
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
        LA PROTECCIÓN REAL.
        
        El UID del token de Firebase
        debe ser exactamente igual al
        authorUid guardado en mod.json.
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
        Ahora sí podemos borrar.
      */

      const files =
        result.blobs;


      for (const blob of files) {

        try {

          await del(blob.url);

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

    console.error(error);


    return res
      .status(500)
      .json({
        error:
          error.message ||
          "Server error"
      });

  }

}
