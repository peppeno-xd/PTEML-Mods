const { handleUpload } = require('@vercel/blob/client');

module.exports = async function handler(request, response) {
  if (request.method !== 'POST') {
    return response.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const body = request.body;
    const result = await handleUpload({
      body,
      request,
      onBeforeGenerateToken: async (pathname) => {
        if (!pathname || !pathname.startsWith('mods/')) {
          throw new Error('Invalid upload path');
        }
        if (!/\.(zip|png)$/i.test(pathname)) {
          throw new Error('Only ZIP and PNG files are allowed');
        }
        if (/\.zip$/i.test(pathname)) {
          return {
            allowedContentTypes: ['application/zip', 'application/x-zip-compressed'],
            maximumSizeInBytes: 50 * 1024 * 1024,
            addRandomSuffix: true,
          };
        }
        return {
          allowedContentTypes: ['image/png'],
          maximumSizeInBytes: 5 * 1024 * 1024,
          addRandomSuffix: true,
        };
      },
      onUploadCompleted: async ({ blob }) => {
        console.log('PTEM Mods upload completed:', blob.url);
      },
    });
    return response.status(200).json(result);
  } catch (error) {
    console.error(error);
    return response.status(400).json({ error: error.message || 'Upload failed' });
  }
};
