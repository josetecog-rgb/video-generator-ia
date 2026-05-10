const axios = require('axios');

const client = axios.create({
  baseURL: 'https://fal.run',
  headers: {
    'Authorization': `Key ${process.env.FALAI_API_KEY}`,
    'Content-Type': 'application/json',
  },
  timeout: 120000,
});

async function generateImage({ prompt, width = 1024, height = 1024, model = 'fal-ai/flux/schnell' }) {
  const response = await client.post(`/${model}`, {
    prompt,
    image_size: { width, height },
    num_images: 1,
  });
  return response.data;
}

async function generateVideo({ prompt, image_url, duration = 5, model = 'fal-ai/kling-video/v1/standard/text-to-video' }) {
  const payload = { prompt, duration };
  if (image_url) payload.image_url = image_url;
  const response = await client.post(`/${model}`, payload);
  return response.data;
}

module.exports = { generateImage, generateVideo };
