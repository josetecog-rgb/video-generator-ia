const axios = require('axios');
const { buildImagePrompt } = require('./_services/prompter');

const SIZES = {
  'portrait_16_9':  { width: 576,  height: 1024 },
  'landscape_16_9': { width: 1024, height: 576  },
  'square_hd':      { width: 1024, height: 1024 },
};

async function generateSingle({ prompt, size = 'portrait_16_9' }) {
  const { width, height } = SIZES[size] || SIZES['portrait_16_9'];

  // Intenta Together AI
  if (process.env.TOGETHER_API_KEY) {
    try {
      const res = await axios.post(
        'https://api.together.xyz/v1/images/generations',
        { model: 'black-forest-labs/FLUX.1-schnell-Free', prompt, width, height, steps: 4, n: 1, response_format: 'b64_json' },
        { headers: { 'Authorization': `Bearer ${process.env.TOGETHER_API_KEY}`, 'Content-Type': 'application/json' }, timeout: 50000 }
      );
      const b64 = res.data?.data?.[0]?.b64_json;
      if (b64) return `data:image/jpeg;base64,${b64}`;
    } catch (e) {
      console.error('Together falló para esta imagen:', e.response?.status, e.message);
    }
  }

  // Fallback Pollinations
  const encoded = encodeURIComponent(prompt);
  const url = `https://image.pollinations.ai/prompt/${encoded}?width=${width}&height=${height}&model=flux&nologo=true&seed=${Math.floor(Math.random() * 99999)}`;
  const res = await axios.get(url, { responseType: 'arraybuffer', timeout: 65000, headers: { 'User-Agent': 'video-generator-ia/1.0' } });
  return `data:${res.headers['content-type'] || 'image/jpeg'};base64,${Buffer.from(res.data).toString('base64')}`;
}

module.exports = async (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Método no permitido' });

  try {
    const { scenes, genre, style, protagonistVisualDescription = '', size = 'portrait_16_9' } = req.body;
    if (!scenes?.length) return res.status(400).json({ error: '"scenes" es requerido' });

    // Construir todos los prompts
    const prompts = scenes.map((scene, i) => ({
      prompt: buildImagePrompt({
        sceneDescription: scene.description,
        action: scene.action || '',
        genre,
        style,
        protagonistVisualDescription,
        sceneIndex: i,
      }),
      description: scene.description,
    }));

    // Generar TODAS en paralelo con Promise.allSettled
    const results = await Promise.allSettled(
      prompts.map(({ prompt }) => generateSingle({ prompt, size }))
    );

    const images = results.map((r, i) => ({
      url: r.status === 'fulfilled' ? r.value : null,
      prompt_used: prompts[i].prompt,
      description: prompts[i].description,
      error: r.status === 'rejected' ? r.reason?.message : null,
    }));

    res.json({ images, total: images.length, success: images.filter(i => i.url).length });
  } catch (err) {
    res.status(500).json({ error: 'Error generando imágenes', detail: err.message });
  }
};
