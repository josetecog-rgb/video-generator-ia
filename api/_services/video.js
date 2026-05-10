const axios = require('axios');

const sleep = ms => new Promise(r => setTimeout(r, ms));

async function generateWithReplicate({ prompt, image_url }) {
  const token = process.env.REPLICATE_API_TOKEN;
  if (!token) throw new Error('REPLICATE_API_TOKEN no configurado');

  // Usar el endpoint de modelo específico (API nueva de Replicate)
  const model = image_url ? 'wan-ai/wan2.1-i2v-480p' : 'wan-ai/wan2.1-t2v-480p';
  const input = image_url
    ? { prompt, image: image_url, max_area: '480*832', fast_mode: 'Balanced', sample_steps: 20 }
    : { prompt, max_area: '480*832', fast_mode: 'Balanced', sample_steps: 20 };

  const [owner, name] = model.split('/');
  const create = await axios.post(
    `https://api.replicate.com/v1/models/${owner}/${name}/predictions`,
    { input },
    {
      headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json', 'Prefer': 'wait' },
      timeout: 15000,
    }
  );

  const id = create.data.id;
  if (!id) throw new Error('No se obtuvo ID de predicción');

  // Polling hasta 270 segundos
  for (let i = 0; i < 54; i++) {
    await sleep(5000);
    const poll = await axios.get(
      `https://api.replicate.com/v1/predictions/${id}`,
      { headers: { 'Authorization': `Bearer ${token}` } }
    );
    const { status, output, error } = poll.data;
    if (status === 'succeeded') {
      const url = Array.isArray(output) ? output[0] : output;
      if (!url) throw new Error('Sin URL de video en respuesta');
      return url;
    }
    if (status === 'failed' || status === 'canceled') throw new Error(error || `Replicate: ${status}`);
  }
  throw new Error('Tiempo agotado esperando el video');
}

async function generateVideo({ prompt, image_url }) {
  if (process.env.REPLICATE_API_TOKEN) {
    try {
      return { url: await generateWithReplicate({ prompt, image_url }), provider: 'replicate' };
    } catch (e) {
      console.error('Replicate error:', e.message);
      throw e;
    }
  }
  throw new Error('Configura REPLICATE_API_TOKEN (gratis en replicate.com)');
}

module.exports = { generateVideo };
