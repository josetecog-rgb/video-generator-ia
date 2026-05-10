const { chat } = require('./_services/deepseek');

const PLATFORM_RULES = {
  tiktok: 'TikTok: título corto y viral (máx 8 palabras), caption con gancho emocional, 5-8 hashtags trending',
  youtube: 'YouTube Shorts: título SEO con palabras clave (máx 12 palabras), descripción de 2 líneas, 5 hashtags',
  instagram: 'Instagram Reels: título con emoji al inicio, caption de 3 líneas con CTA, 10-15 hashtags mixtos',
  facebook: 'Facebook: título que genera curiosidad, texto de 2-3 líneas conversacional, 3-5 hashtags',
  telegram: 'Telegram: título directo, descripción breve de 2 líneas, sin hashtags',
  whatsapp: 'WhatsApp Status: texto muy corto (máx 2 líneas), sin hashtags, tono casual',
};

module.exports = async (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Método no permitido' });

  try {
    const { title, genre, category, platform = 'tiktok' } = req.body;
    if (!title) return res.status(400).json({ error: '"title" es requerido' });

    const rules = PLATFORM_RULES[platform] || PLATFORM_RULES.tiktok;

    const prompt = `Eres un experto en marketing de redes sociales.

Crea el texto de publicación para este video:
- Título de la historia: "${title}"
- Género: ${genre}
- Categoría: ${category}
- Plataforma: ${platform.toUpperCase()}

Reglas para ${platform.toUpperCase()}: ${rules}

Responde ÚNICAMENTE con este JSON:
{
  "post_title": "Título de la publicación",
  "caption": "Texto del caption/descripción",
  "hashtags": "#hashtag1 #hashtag2 #hashtag3",
  "full_post": "Todo el texto junto listo para copiar y pegar incluyendo título, caption y hashtags"
}`;

    const raw = await chat([{ role: 'user', content: prompt }], { temperature: 0.7 });
    const jsonMatch = raw.match(/\{[\s\S]*\}/);
    if (!jsonMatch) return res.status(500).json({ error: 'Error parseando respuesta' });
    res.json(JSON.parse(jsonMatch[0]));
  } catch (err) {
    res.status(500).json({ error: 'Error generando caption', detail: err.message });
  }
};
