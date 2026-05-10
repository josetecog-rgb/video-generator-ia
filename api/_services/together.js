const axios = require('axios');

const SIZES = {
  'portrait_16_9':  { width: 576,  height: 1024 },
  'landscape_16_9': { width: 1024, height: 576  },
  'square_hd':      { width: 1024, height: 1024 },
};

const sleep = (ms) => new Promise(r => setTimeout(r, ms));

async function generateWithTogether({ prompt, size = 'portrait_16_9' }) {
  const { width, height } = SIZES[size] || SIZES['portrait_16_9'];

  // Reintenta hasta 3 veces con delay para manejar rate limits
  for (let attempt = 1; attempt <= 3; attempt++) {
    try {
      const response = await axios.post(
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
      const b64 = response.data?.data?.[0]?.b64_json;
      if (!b64) throw new Error('Sin imagen en respuesta');
      return `data:image/jpeg;base64,${b64}`;
    } catch (e) {
      const isRateLimit = e.response?.status === 429 || e.response?.status === 503;
      if (attempt < 3 && isRateLimit) {
        await sleep(attempt * 4000); // 4s, 8s entre reintentos
        continue;
      }
      throw e;
    }
  }
}

async function generateWithPollinations({ prompt, size = 'portrait_16_9' }) {
  const { width, height } = SIZES[size] || SIZES['portrait_16_9'];
  const encoded = encodeURIComponent(prompt);
  const url = `https://image.pollinations.ai/prompt/${encoded}?width=${width}&height=${height}&model=flux&nologo=true&seed=${Math.floor(Math.random() * 99999)}`;
  const response = await axios.get(url, {
    responseType: 'arraybuffer',
    timeout: 70000,
    headers: { 'User-Agent': 'video-generator-ia/1.0' },
  });
  const base64 = Buffer.from(response.data).toString('base64');
  const ct = response.headers['content-type'] || 'image/jpeg';
  return `data:${ct};base64,${base64}`;
}

async function generateImage({ prompt, size = 'portrait_16_9' }) {
  if (process.env.TOGETHER_API_KEY) {
    try {
      return await generateWithTogether({ prompt, size });
    } catch (e) {
      console.error('Together AI falló:', e.response?.status, e.message);
    }
  }
  return await generateWithPollinations({ prompt, size });
}

module.exports = { generateImage };
