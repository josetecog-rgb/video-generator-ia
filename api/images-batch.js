const axios = require('axios');
const { buildImagePrompt } = require('./_services/prompter');

const SIZES = {
  'portrait_16_9':  { width: 576,  height: 1024 },
  'landscape_16_9': { width: 1024, height: 576  },
  'square_hd':      { width: 1024, height: 1024 },
};

const sleep = ms => new Promise(r => setTimeout(r, ms));

// ── Pollinations — primario, 100% confiable ──────────────────────────
async function generatePollinations({ prompt, width, height }) {
  const url = `https://image.pollinations.ai/prompt/${encodeURIComponent(prompt)}?width=${width}&height=${height}&model=flux&nologo=true&enhance=true&seed=${Math.floor(Math.random() * 999999)}`;
  const res = await axios.get(url, {
    responseType: 'arraybuffer',
    timeout: 70000,
    headers: { 'User-Agent': 'video-generator-ia/1.0' },
  });
  return `data:${res.headers['content-type'] || 'image/jpeg'};base64,${Buffer.from(res.data).toString('base64')}`;
}

// ── Together AI — upgrade de calidad cuando está disponible ──────────
async function generateTogether({ prompt, width, height }) {
  const res = await axios.post(
    'https://api.together.xyz/v1/images/generations',
    { model: 'black-forest-labs/FLUX.1-schnell-Free', prompt, width, height, steps: 4, n: 1, response_format: 'b64_json' },
    {
      headers: { 'Authorization': `Bearer ${process.env.TOGETHER_API_KEY}`, 'Content-Type': 'application/json' },
      timeout: 50000,
    }
  );
  const b64 = res.data?.data?.[0]?.b64_json;
  if (!b64) throw new Error('Sin imagen');
  return `data:image/jpeg;base64,${b64}`;
}

async function generateOne({ prompt, size = 'portrait_16_9', index = 0 }) {
  const { width, height } = SIZES[size] || SIZES['portrait_16_9'];

  // Escalonar el inicio para no saturar Pollinations
  await sleep(index * 2000);

  // Intentar Together AI primero si está configurado (mejor calidad)
  // Solo para la primera imagen para no saturar el rate limit
  if (process.env.TOGETHER_API_KEY && index === 0) {
    try {
      return await generateTogether({ prompt, width, height });
    } catch (e) {
      console.log('Together AI falló, usando Pollinations:', e.response?.status || e.message);
    }
  }

  // Pollinations para todas las demás (y fallback)
  return await generatePollinations({ prompt, width, height });
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

    // Construir prompts optimizados para todas las escenas
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

    // Generar todas en paralelo (escalonadas 2s)
    const results = await Promise.allSettled(
      items.map(({ prompt }, i) => generateOne({ prompt, size, index: i }))
    );

    const images = results.map((r, i) => ({
      url:         r.status === 'fulfilled' ? r.value : null,
      prompt_used: items[i].prompt,
      description: items[i].description,
      error:       r.status === 'rejected'  ? r.reason?.message : null,
    }));

    const successCount = images.filter(i => i.url).length;
    res.json({ images, total: images.length, success: successCount });
  } catch (err) {
    res.status(500).json({ error: 'Error generando imágenes', detail: err.message });
  }
};
