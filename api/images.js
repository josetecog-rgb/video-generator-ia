const { generateImage } = require('./_services/together');
const { buildImagePrompt } = require('./_services/prompter');

module.exports = async (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Método no permitido' });

  try {
    const { sceneDescription, genre, style, protagonistDescription, size = 'portrait_16_9' } = req.body;
    if (!sceneDescription) return res.status(400).json({ error: '"sceneDescription" es requerido' });

    // Construye el prompt directamente — sin llamada extra a DeepSeek
    const finalPrompt = buildImagePrompt({ sceneDescription, genre, style, protagonistDescription });
    const image_url = await generateImage({ prompt: finalPrompt, size });

    res.json({ image_url, prompt_used: finalPrompt });
  } catch (err) {
    res.status(500).json({ error: 'Error generando imagen', detail: err.message });
  }
};
