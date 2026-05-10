const axios = require('axios');

// ── Segmind PixVerse V6 (tier gratuito disponible) ──────────────────
async function generateWithSegmind({ prompt, image_url, duration = 5 }) {
  const payload = {
    prompt,
    aspect_ratio: '9:16',
    duration,
    quality: '720p',
    motion_mode: 'normal',
    ...(image_url && { image_url }),
  };

  const res = await axios.post(
    'https://api.segmind.com/v1/pixverse-v4-i2v',
    payload,
    {
      headers: {
        'x-api-key': process.env.SEGMIND_API_KEY,
        'Content-Type': 'application/json',
      },
      responseType: 'arraybuffer',
      timeout: 280000,
    }
  );

  // Segmind devuelve el video directamente como buffer
  const base64 = Buffer.from(res.data).toString('base64');
  return `data:video/mp4;base64,${base64}`;
}

// ── Replicate — Hailuo / Wan Video ───────────────────────────────────
async function generateWithReplicate({ prompt, image_url }) {
  const token = process.env.REPLICATE_API_TOKEN;

  const model = image_url
    ? 'minimax/hailuo-02:image-to-video'
    : 'minimax/hailuo-02';

  const input = image_url
    ? { prompt, image_url, duration: 6 }
    : { prompt, duration: 6 };

  // Crear predicción
  const create = await axios.post(
    'https://api.replicate.com/v1/predictions',
    { model, input },
    { headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' } }
  );

  const id = create.data.id;

  // Polling hasta completar (máx 270s)
  for (let i = 0; i < 54; i++) {
    await new Promise(r => setTimeout(r, 5000));
    const poll = await axios.get(
      `https://api.replicate.com/v1/predictions/${id}`,
      { headers: { 'Authorization': `Bearer ${token}` } }
    );
    const { status, output, error } = poll.data;
    if (status === 'succeeded') return Array.isArray(output) ? output[0] : output;
    if (status === 'failed') throw new Error(error || 'Replicate failed');
  }
  throw new Error('Replicate timeout');
}

// ── Función principal con fallback ───────────────────────────────────
async function generateVideo({ prompt, image_url, duration = 5 }) {
  const hasSegmind = !!process.env.SEGMIND_API_KEY;
  const hasReplicate = !!process.env.REPLICATE_API_TOKEN;

  if (hasSegmind) {
    try {
      return { url: await generateWithSegmind({ prompt, image_url, duration }), provider: 'segmind' };
    } catch (e) {
      console.error('Segmind failed:', e.message);
    }
  }

  if (hasReplicate) {
    try {
      const url = await generateWithReplicate({ prompt, image_url });
      return { url, provider: 'replicate' };
    } catch (e) {
      console.error('Replicate failed:', e.message);
    }
  }

  throw new Error('No hay API de video configurada. Regístrate en segmind.com o replicate.com.');
}

module.exports = { generateVideo };
