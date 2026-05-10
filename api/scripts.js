const { chat } = require('./_services/deepseek');

module.exports = async (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Método no permitido' });

  try {
    const { topic, platform = 'tiktok', duration = 60 } = req.body;
    if (!topic) return res.status(400).json({ error: 'El campo "topic" es requerido' });

    const prompt = `Crea un guión para un video corto de ${duration} segundos para ${platform}.
Tema: "${topic}"
Idioma: español

El guión debe incluir hook (primeros 3 segundos), desarrollo y CTA final.

Responde SOLO con un JSON con esta estructura:
{
  "hook": "...",
  "development": "...",
  "cta": "...",
  "full_script": "...",
  "estimated_duration": ${duration},
  "image_prompts": ["prompt en inglés para imagen 1", "prompt para imagen 2"]
}`;

    const raw = await chat([{ role: 'user', content: prompt }], { temperature: 0.8 });
    const jsonMatch = raw.match(/\{[\s\S]*\}/);
    const script = jsonMatch ? JSON.parse(jsonMatch[0]) : { full_script: raw };

    res.json({ script, topic, platform });
  } catch (err) {
    res.status(500).json({ error: 'Error generando guión', detail: err.message });
  }
};
