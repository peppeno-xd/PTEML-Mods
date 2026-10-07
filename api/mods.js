const { list, put } = require('@vercel/blob');

const INDEX_PATH = 'ptem-mods/index.json';

async function getIndex() {
  const result = await list({ prefix: INDEX_PATH, limit: 1 });
  if (!result.blobs.length) return [];
  const r = await fetch(result.blobs[0].url, { cache: 'no-store' });
  if (!r.ok) return [];
  const data = await r.json();
  return Array.isArray(data) ? data : [];
}

async function saveIndex(items) {
  await put(INDEX_PATH, JSON.stringify(items, null, 2), {
    access: 'public',
    addRandomSuffix: false,
    contentType: 'application/json',
    allowOverwrite: true,
  });
}

module.exports = async function handler(request, response) {
  try {
    const items = await getIndex();
    const id = request.query?.id;

    if (request.method === 'GET') {
      if (!id) return response.status(200).json(items);
      const mod = items.find(x => x.id === id);
      if (!mod) return response.status(404).json({ error: 'Mod not found' });
      return response.status(200).json(mod);
    }

    if (request.method === 'POST') {
      const d = request.body;
      if (!d || !d.id || !d.name || !d.download) {
        return response.status(400).json({ error: 'Missing mod data' });
      }
      if (!/^[a-z0-9][a-z0-9-]{0,49}$/.test(d.id)) {
        return response.status(400).json({ error: 'Invalid mod id' });
      }
      const clean = {
        id: d.id,
        name: String(d.name).slice(0, 80),
        version: String(d.version || '1.0').slice(0, 30),
        smalldesc: String(d.smalldesc || '').slice(0, 180),
        description: String(d.description || '').slice(0, 10000),
        credits: Array.isArray(d.credits) ? d.credits.map(String).slice(0, 30) : [],
        author: Array.isArray(d.credits) && d.credits.length ? String(d.credits[0]).split(' - ')[0] : '',
        date: d.date || new Date().toISOString(),
        icon: String(d.icon || ''),
        banner: String(d.banner || ''),
        download: String(d.download),
      };
      const next = items.filter(x => x.id !== clean.id);
      next.push(clean);
      await saveIndex(next);
      return response.status(201).json(clean);
    }

    return response.status(405).json({ error: 'Method not allowed' });
  } catch (error) {
    console.error(error);
    return response.status(500).json({ error: error.message || 'Server error' });
  }
};
