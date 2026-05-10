async function generateImage({ prompt, size = 'portrait_16_9' }) {
  const dimensions = {
    'portrait_16_9':  { width: 576,  height: 1024 },
    'landscape_16_9': { width: 1024, height: 576  },
    'square_hd':      { width: 1024, height: 1024 },
  };
  const { width, height } = dimensions[size] || dimensions['portrait_16_9'];

  const res = await fetch(
    'https://api-inference.huggingface.co/models/black-forest-labs/FLUX.1-schnell',
    {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.HF_TOKEN}`,
        'Content-Type': 'application/json',
        'x-wait-for-model': 'true',
      },
      body: JSON.stringify({
        inputs: prompt,
        parameters: { width, height, num_inference_steps: 4 },
      }),
      signal: AbortSignal.timeout(85000),
    }
  );

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`HF error ${res.status}: ${text.slice(0, 200)}`);
  }

  const buffer = await res.arrayBuffer();
  const base64 = Buffer.from(buffer).toString('base64');
  const contentType = res.headers.get('content-type') || 'image/jpeg';
  return `data:${contentType};base64,${base64}`;
}

module.exports = { generateImage };
