const axios = require('axios');

const SIZES = {
  'portrait_16_9':  { width: 576,  height: 1024 },
  'landscape_16_9': { width: 1024, height: 576  },
  'square_hd':      { width: 1024, height: 1024 },
};

async function generateImage({ prompt, size = 'portrait_16_9' }) {
  const { width, height } = SIZES[size] || SIZES['portrait_16_9'];
  const encoded = encodeURIComponent(prompt);
  const url = `https://image.pollinations.ai/prompt/${encoded}?width=${width}&height=${height}&model=flux&nologo=true&enhance=true`;

  const response = await axios.get(url, {
    responseType: 'arraybuffer',
    timeout: 80000,
    headers: { 'User-Agent': 'video-generator-ia/1.0' },
  });

  const base64 = Buffer.from(response.data).toString('base64');
  const contentType = response.headers['content-type'] || 'image/jpeg';
  return `data:${contentType};base64,${base64}`;
}

module.exports = { generateImage };
