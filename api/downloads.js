import { list } from "@vercel/blob";


export default async function handler(req, res)
{
  try
  {
    if (req.method !== "GET")
    {
      return res
        .status(405)
        .json({
          error: "Method not allowed"
        });
    }


    const result =
      await list({
        prefix: "downloadspage/"
      });


    const files =
      result.blobs.map(blob =>
      {
        const pathname =
          blob.pathname;

        const files =
  result.blobs
    .filter(blob =>
    {
      const filename =
        blob.pathname.split("/").pop();

      // Ignorar rutas sin nombre de archivo
      if (!filename)
        return false;

      // Solo mostrar archivos descargables
      return /\.(apk|zip)$/i.test(filename);
    })
    .map(blob =>
    {


    return res
      .status(200)
      .json(files);

  }
  catch (error)
  {
    console.error(error);

    return res
      .status(500)
      .json({
        error:
          error.message ||
          "Could not load downloads"
      });
  }
            }
