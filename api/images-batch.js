const axios = require('axios');
const { buildImagePrompt } = require('./_services/prompter');

const SIZES = {
  'portrait_16_9':  { width: 576,  height: 1024 },
  'landscape_16_9': { width: 1024, height: 576  },
  'square_hd':      { width: 1024, height: 1024 },
};

const sleep = ms => new Promise(r => setTimeout(r, ms));

async function generateSingle({ prompt, size = 'portrait_16_9', retries = 2 }) {
  const { width, height } = SIZES[size] || SIZES['portrait_16_9'];

  // Together AI
  if (process.env.TOGETHER_API_KEY) {
    for (let attempt = 1; attempt <= retries; attempt++) {
      try {
        const res = await axios.post(
          'https://api.together.xyz/v1/images/generations',
          {
            model: 'black-forest-labs/FLUX.1-schnell-Free',
            prompt,
            width,
            height,
            steps: 4,
            n: 1,
            response_format: 'b64_json',
          },
          {
            headers: {
              'Authorization': `Bearer ${process.env.TOGETHER_API_KEY}`,
              'Content-Type': 'application/json',
            },
            timeout: 55000,
          }
        );
        const b64 = res.data?.data?.[0]?.b64_json;
        if (b64) return `data:image/jpeg;base64,${b64}`;
      } catch (e) {
        if (attempt < retries) {
          await sleep(e.response?.status === 429 ? 8000 : 3000);
        } else {
          console.error(`Together AI falló después de ${retries} intentos:`, e.response?.status);
        }
      }
    }
  }

  // Fallback: Pollinations
  const encoded = encodeURIComponent(prompt);
  const url = `https://image.pollinations.ai/prompt/${encoded}?width=${width}&height=${height}&model=flux&nologo=true&seed=${Math.floor(Math.random() * 99999)}`;
  const res = await axios.get(url, {
    responseType: 'arraybuffer',
    timeout: 65000,
    headers: { 'User-Agent': 'video-generator-ia/1.0' },
  });
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
    const items = scenes.map((scene, i) => ({
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

    // Escalonar el inicio de cada request 3 segundos — evita rate limit
    // pero corren en paralelo (no secuencial)
    const results = await Promise.allSettled(
      items.map(({ prompt, description }, i) =>
        sleep(i * 3000).then(() => generateSingle({ prompt, size }))
      )
    );

    const images = results.map((r, i) => ({
      url: r.status === 'fulfilled' ? r.value : null,
      prompt_used: items[i].prompt,
      description: items[i].description,
    }));

    res.json({ images, total: images.length, success: images.filter(i => i.url).length });
  } catch (err) {
    res.status(500).json({ error: 'Error generando imágenes', detail: err.message });
  }
};
