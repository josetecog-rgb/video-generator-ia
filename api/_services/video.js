const axios = require('axios');

// ── Replicate — Wan 2.1 Image-to-Video (gratis en tier free) ─────────
async function generateWithReplicate({ prompt, image_url }) {
  const token = process.env.REPLICATE_API_TOKEN;
  if (!token) throw new Error('REPLICATE_API_TOKEN no configurado');

  const body = image_url
    ? {
        version: 'wan-ai/wan2.1-i2v-480p',
        input: { prompt, image: image_url, max_area: '480*832', fast_mode: 'Balanced', sample_steps: 20 },
      }
    : {
        version: 'wan-ai/wan2.1-t2v-480p',
        input: { prompt, max_area: '480*832', fast_mode: 'Balanced', sample_steps: 20 },
      };

  const create = await axios.post('https://api.replicate.com/v1/predictions', body, {
    headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
    timeout: 15000,
  });

  const id = create.data.id;
  for (let i = 0; i < 60; i++) {
    await new Promise(r => setTimeout(r, 5000));
    const poll = await axios.get(`https://api.replicate.com/v1/predictions/${id}`, {
      headers: { 'Authorization': `Bearer ${token}` },
    });
    const { status, output, error } = poll.data;
    if (status === 'succeeded') return Array.isArray(output) ? output[0] : output;
    if (status === 'failed' || status === 'canceled') throw new Error(error || 'Replicate falló');
  }
  throw new Error('Tiempo de espera agotado');
}

// ── Segmind PixVerse V4 ───────────────────────────────────────────────
async function generateWithSegmind({ prompt, image_url, duration = 5 }) {
  const key = process.env.SEGMIND_API_KEY;
  if (!key) throw new Error('SEGMIND_API_KEY no configurado');

  const endpoint = image_url ? 'pixverse-v4-i2v' : 'pixverse-v4';
  const payload = { prompt, aspect_ratio: '9:16', duration, quality: '720p', motion_mode: 'normal' };
  if (image_url) payload.image_url = image_url;

  const res = await axios.post(`https://api.segmind.com/v1/${endpoint}`, payload, {
    headers: { 'x-api-key': key, 'Content-Type': 'application/json' },
    responseType: 'arraybuffer',
    timeout: 280000,
  });

  const base64 = Buffer.from(res.data).toString('base64');
  return `data:video/mp4;base64,${base64}`;
}

async function generateVideo({ prompt, image_url, duration = 5 }) {
  // Intenta Replicate primero, luego Segmind
  if (process.env.REPLICATE_API_TOKEN) {
    try { return { url: await generateWithReplicate({ prompt, image_url }), provider: 'replicate' }; }
    catch (e) { console.error('Replicate:', e.message); }
  }
  if (process.env.SEGMIND_API_KEY) {
    try { return { url: await generateWithSegmind({ prompt, image_url, duration }), provider: 'segmind' }; }
    catch (e) { console.error('Segmind:', e.message); }
  }
  throw new Error('Configura REPLICATE_API_TOKEN (gratis en replicate.com) o SEGMIND_API_KEY (gratis en segmind.com)');
}

module.exports = { generateVideo };
