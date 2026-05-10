const { generateImage } = require('./_services/hf');
const { optimizeImagePrompt } = require('./_services/prompter');

module.exports = async (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Método no permitido' });

  try {
    const { prompt, sceneDescription, genre, size = 'portrait_16_9' } = req.body;
    if (!prompt && !sceneDescription) return res.status(400).json({ error: '"prompt" o "sceneDescription" son requeridos' });

    // Si viene descripción de escena, optimiza el prompt primero
    let finalPrompt = prompt;
    if (sceneDescription && genre) {
      finalPrompt = await optimizeImagePrompt({ sceneDescription, genre });
    }

    const image_url = await generateImage({ prompt: finalPrompt, size });
    res.json({ image_url, prompt_used: finalPrompt });
  } catch (err) {
    res.status(500).json({ error: 'Error generando imagen', detail: err.message });
  }
};
