const https = require('https');

function falRequest(path, body) {
  return new Promise((resolve, reject) => {
    const data = JSON.stringify(body);
    const options = {
      hostname: 'fal.run',
      path: `/${path}`,
      method: 'POST',
      headers: {
        'Authorization': `Key ${process.env.FALAI_API_KEY}`,
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(data),
      },
    };
    const req = https.request(options, (res) => {
      let raw = '';
      res.on('data', chunk => raw += chunk);
      res.on('end', () => {
        try {
          const json = JSON.parse(raw);
          if (res.statusCode >= 400) reject(new Error(json.detail || json.error || `HTTP ${res.statusCode}`));
          else resolve(json);
        } catch (e) {
          reject(new Error(`Parse error: ${raw.slice(0, 200)}`));
        }
      });
    });
    req.on('error', reject);
    req.setTimeout(90000, () => { req.destroy(); reject(new Error('Timeout fal.ai')); });
    req.write(data);
    req.end();
  });
}

async function generateImage({ prompt, size = 'square_hd' }) {
  return falRequest('fal-ai/flux/schnell', {
    prompt,
    image_size: size,
    num_inference_steps: 4,
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
  return falRequest(model, body);
}

module.exports = { generateImage, generateVideo };
