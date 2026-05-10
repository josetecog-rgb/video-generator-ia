const { generateImage } = require('./_services/hf');

module.exports = async (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Método no permitido' });

  try {
    const { prompt, size = 'portrait_16_9' } = req.body;
    if (!prompt) return res.status(400).json({ error: '"prompt" es requerido' });

    const image_url = await generateImage({ prompt, size });
    res.json({ image_url });
  } catch (err) {
    res.status(500).json({ error: 'Error generando imagen', detail: err.message });
  }
};
