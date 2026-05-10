async function falPost(model, body) {
  const res = await fetch(`https://fal.run/${model}`, {
    method: 'POST',
    headers: {
      'Authorization': `Key ${process.env.FALAI_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(body),
    signal: AbortSignal.timeout(85000),
  });

  const json = await res.json();
  if (!res.ok) throw new Error(json?.detail || json?.error || `fal.ai error ${res.status}`);
  return json;
}

async function generateImage({ prompt, size = 'portrait_16_9' }) {
  return falPost('fal-ai/flux/dev', {
    prompt,
    image_size: size,
    num_inference_steps: 28,
    guidance_scale: 3.5,
    num_images: 1,
    enable_safety_checker: false,
  });
}

async function generateVideo({ prompt, image_url, duration = 5 }) {
  const model = image_url
    ? 'fal-ai/kling-video/v1/standard/image-to-video'
    : 'fal-ai/kling-video/v1/standard/text-to-video';
  const body = { prompt, duration: String(duration) };
  if (image_url) body.image_url = image_url;
  return falPost(model, body);
}

module.exports = { generateImage, generateVideo };
