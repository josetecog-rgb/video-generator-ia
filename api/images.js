const { generateImage } = require('./_services/falai');

module.exports = async (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Método no permitido' });

  try {
    const { prompt, width = 1024, height = 1024, model = 'fal-ai/flux/schnell' } = req.body;
    if (!prompt) return res.status(400).json({ error: 'El campo "prompt" es requerido' });

    const result = await generateImage({ prompt, width, height, model });
    const image_url = result?.images?.[0]?.url || result?.image?.url || null;

    res.json({ image_url, raw: result });
  } catch (err) {
    res.status(500).json({ error: 'Error generando imagen', detail: err.message });
  }
};
