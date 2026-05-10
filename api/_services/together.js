const axios = require('axios');

const SIZES = {
  'portrait_16_9':  { width: 576,  height: 1024 },
  'landscape_16_9': { width: 1024, height: 576  },
  'square_hd':      { width: 1024, height: 1024 },
};

async function generateImage({ prompt, size = 'portrait_16_9' }) {
  const { width, height } = SIZES[size] || SIZES['portrait_16_9'];

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
      timeout: 60000,
    }
  );

  const b64 = response.data?.data?.[0]?.b64_json;
  if (!b64) throw new Error('Together AI no devolvió imagen');
  return `data:image/jpeg;base64,${b64}`;
}

module.exports = { generateImage };
