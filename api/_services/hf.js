const axios = require('axios');

async function generateImage({ prompt, size = 'portrait_16_9' }) {
  const dimensions = {
    'portrait_16_9':  { width: 576,  height: 1024 },
    'landscape_16_9': { width: 1024, height: 576  },
    'square_hd':      { width: 1024, height: 1024 },
  };
  const { width, height } = dimensions[size] || dimensions['portrait_16_9'];

  const response = await axios.post(
    'https://api-inference.huggingface.co/models/stabilityai/stable-diffusion-xl-base-1.0',
    {
      inputs: prompt,
      parameters: { width, height, num_inference_steps: 30, guidance_scale: 7.5 },
    },
    {
      headers: {
        'Authorization': `Bearer ${process.env.HF_TOKEN}`,
        'Content-Type': 'application/json',
        'x-wait-for-model': 'true',
      },
      responseType: 'arraybuffer',
      timeout: 80000,
    }
  );

  const base64 = Buffer.from(response.data).toString('base64');
  const contentType = response.headers['content-type'] || 'image/jpeg';
  return `data:${contentType};base64,${base64}`;
}

module.exports = { generateImage };
