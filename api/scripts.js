const { chat } = require('./_services/deepseek');

module.exports = async (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Método no permitido' });

  try {
    const { category, genre, platform = 'tiktok' } = req.body;
    if (!category || !genre) return res.status(400).json({ error: 'category y genre son requeridos' });

    const prompt = `Eres un guionista creativo de videos cortos virales.

Crea una HISTORIA corta y emocionante para un video de 60 segundos en ${platform}.
Categoría: ${category}
Género: ${genre}

La historia debe ser original, con inicio, nudo y desenlace sorprendente.

Responde ÚNICAMENTE con este JSON (sin texto extra, sin markdown):
{
  "title": "Título llamativo de la historia",
  "hook": "Las primeras 2 oraciones que enganchan al espectador en 3 segundos",
  "story": "La historia completa narrada en 150-200 palabras, emocionante y con giro final",
  "scenes": [
    { "description": "Descripción visual de la escena 1 (qué se ve en pantalla)", "image_prompt": "cinematic scene, [describe in English what to show visually], high quality, dramatic lighting" },
    { "description": "Descripción visual de la escena 2", "image_prompt": "cinematic scene, [describe in English], high quality" },
    { "description": "Descripción visual de la escena 3 (desenlace)", "image_prompt": "cinematic scene, [describe in English], high quality, emotional" }
  ],
  "cta": "Llamada a la acción final (máx 1 oración)"
}`;

    const raw = await chat([{ role: 'user', content: prompt }], { temperature: 0.9, max_tokens: 1500 });
    const jsonMatch = raw.match(/\{[\s\S]*\}/);
    if (!jsonMatch) return res.status(500).json({ error: 'Error parseando respuesta de IA', raw });
    const script = JSON.parse(jsonMatch[0]);
    res.json({ script });
  } catch (err) {
    res.status(500).json({ error: 'Error generando historia', detail: err.message });
  }
};
