const { generateVideo } = require('./_services/video');

module.exports = async (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Método no permitido' });

  try {
    const { prompt, image_url, duration = 5 } = req.body;
    if (!prompt) return res.status(400).json({ error: '"prompt" es requerido' });

    const result = await generateVideo({ prompt, image_url, duration });
    res.json({ video_url: result.url, provider: result.provider });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
