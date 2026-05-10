const axios = require('axios');

const sleep = ms => new Promise(r => setTimeout(r, ms));

async function replicatePredict({ token, owner, name, input }) {
  // Crear predicción
  const create = await axios.post(
    `https://api.replicate.com/v1/models/${owner}/${name}/predictions`,
    { input },
    {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      timeout: 20000,
    }
  );

  const id = create.data?.id;
  if (!id) throw new Error(`Sin ID de predicción: ${JSON.stringify(create.data)}`);

  // Polling
  for (let i = 0; i < 60; i++) {
    await sleep(5000);
    const poll = await axios.get(
      `https://api.replicate.com/v1/predictions/${id}`,
      { headers: { 'Authorization': `Bearer ${token}` }, timeout: 10000 }
    );
    const { status, output, error } = poll.data;
    if (status === 'succeeded') {
      return Array.isArray(output) ? output[0] : output;
    }
    if (status === 'failed' || status === 'canceled') {
      throw new Error(`Replicate ${status}: ${error || 'sin detalles'}`);
    }
  }
  throw new Error('Timeout: el video tardó más de 5 minutos');
}

async function generateVideo({ prompt, image_url }) {
  const token = process.env.REPLICATE_API_TOKEN;
  if (!token) throw new Error('Configura REPLICATE_API_TOKEN en Vercel');

  // Intentar modelos en orden — primero imagen-a-video si hay imagen, luego texto-a-video
  const attempts = image_url
    ? [
        // MiniMax Hailuo imagen-a-video
        { owner: 'minimax', name: 'video-01-live',    input: { prompt, first_frame_image: image_url } },
        { owner: 'minimax', name: 'video-01',          input: { prompt, first_frame_image: image_url } },
        // Texto-a-video como fallback
        { owner: 'minimax', name: 'video-01',          input: { prompt } },
      ]
    : [
        { owner: 'minimax', name: 'video-01',          input: { prompt } },
        { owner: 'minimax', name: 'video-01-live',     input: { prompt } },
      ];

  for (const attempt of attempts) {
    try {
      const url = await replicatePredict({ token, ...attempt });
      if (url) return { url, provider: `replicate/${attempt.owner}/${attempt.name}` };
    } catch (e) {
      console.error(`Falló ${attempt.owner}/${attempt.name}:`, e.message);
    }
  }

  throw new Error('No se pudo generar el video. Verifica que tu cuenta de Replicate tenga créditos disponibles.');
}

module.exports = { generateVideo };
