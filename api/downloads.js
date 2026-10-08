import { list } from "@vercel/blob";

export default async function handler(req, res)
{
  try
  {
    if (req.method !== "GET")
    {
      return res.status(405).json({
        error: "Method not allowed"
      });
    }

    const result = await list({
      prefix: "downloadspage/"
    });

    const files = result.blobs
      .filter(blob =>
      {
        const filename = blob.pathname.split("/").pop();

        // Ignorar directorios o rutas sin nombre
        if (!filename)
          return false;

        // Mostrar únicamente APK y ZIP
        return /\.(apk|zip)$/i.test(filename);
      })
      .map(blob =>
      {
        const filename = blob.pathname.split("/").pop();

        let type = "FILE";

        if (filename.toLowerCase().endsWith(".apk"))
        {
          type = "ANDROID APK";
        }
        else if (filename.toLowerCase().endsWith(".zip"))
        {
          type = "ZIP";
        }

        return {
          name: filename,
          url: blob.downloadUrl || blob.url,
          size: blob.size || 0,
          type: type
        };
      });

    return res.status(200).json(files);
  }
  catch (error)
  {
    console.error("DOWNLOADS API ERROR:", error);

    return res.status(500).json({
      error: error.message || "Could not load downloads"
    });
  }
}
