const { chat } = require('./_services/deepseek');

const PLATFORMS = ['youtube', 'instagram', 'tiktok', 'facebook', 'telegram'];

module.exports = async (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Método no permitido' });

  try {
    const { platform = 'tiktok', niche = 'general', count = 5 } = req.body;

    if (!PLATFORMS.includes(platform)) {
      return res.status(400).json({ error: `Plataforma inválida. Usa: ${PLATFORMS.join(', ')}` });
    }

    const prompt = `Genera ${count} ideas de temas para videos virales en ${platform} sobre el nicho "${niche}".
Cada tema debe ser corto y llamativo (máx 10 palabras) con alto potencial viral.
Responde SOLO con un JSON array de strings. Ejemplo: ["Tema 1", "Tema 2"]`;

    const raw = await chat([{ role: 'user', content: prompt }]);
    const jsonMatch = raw.match(/\[[\s\S]*\]/);
    const topics = jsonMatch ? JSON.parse(jsonMatch[0]) : [];

    res.json({ topics, platform, niche });
  } catch (err) {
    res.status(500).json({ error: 'Error generando temas', detail: err.message });
  }
};
