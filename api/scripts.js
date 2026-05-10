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

    const prompt = `Eres un guionista creativo de videos cortos virales y experto en prompts para generación de imágenes IA.

Crea una HISTORIA corta y emocionante para un video de 60 segundos en ${platform}.
Categoría: ${category}
Género: ${genre}

Responde ÚNICAMENTE con este JSON (sin texto extra, sin markdown):
{
  "title": "Título llamativo de la historia (máx 10 palabras)",
  "hook": "Las primeras 2 oraciones que enganchan al espectador en 3 segundos",
  "story": "La historia completa narrada en 150-200 palabras en español, emocionante y con giro final sorprendente",
  "scenes": [
    {
      "description": "Qué ocurre visualmente en esta escena (en español, 1 oración)",
      "image_prompt": "cinematic ${genre.toLowerCase()} scene, [specific main subject with details like color, expression, clothing], dramatic chiaroscuro lighting, sharp focus, intricate details, 8k quality, by Greg Rutkowski, full body shot, 35mm, f/2.8"
    },
    {
      "description": "Qué ocurre visualmente en esta escena (en español, 1 oración)",
      "image_prompt": "cinematic ${genre.toLowerCase()} scene, [different specific subject/moment], moody atmospheric lighting, ultra detailed, photorealistic, by Artgerm, close-up portrait, 85mm lens, f/1.4"
    },
    {
      "description": "Escena final con el giro o desenlace (en español, 1 oración)",
      "image_prompt": "cinematic ${genre.toLowerCase()} climax scene, [the final reveal or emotional moment with specific visual details], golden hour lighting, cinematic color grading, hyperdetailed, by Wlop, wide establishing shot, 24mm"
    }
  ],
  "cta": "Llamada a la acción final en español (máx 1 oración corta)"
}

IMPORTANTE para los image_prompt — sigue esta estructura separada por comas:
1. Estilo visual dominante (cinematic, digital art, oil painting, photorealistic, etc.)
2. Sujeto principal con detalles específicos (color, ropa, expresión, edad, acción exacta)
3. Elementos de refuerzo (artista de referencia, técnica fotográfica, tipo de render)
4. Composición y técnica (tipo de plano, distancia focal, apertura)
5. Iluminación y atmósfera (dramatic lighting, golden hour, neon lights, etc.)
6. Calificadores de calidad (8k, ultra detailed, sharp focus, award winning)`;

    const raw = await chat([{ role: 'user', content: prompt }], { temperature: 0.85, max_tokens: 2000 });
    const jsonMatch = raw.match(/\{[\s\S]*\}/);
    if (!jsonMatch) return res.status(500).json({ error: 'Error parseando respuesta de IA', raw: raw.slice(0, 300) });
    const script = JSON.parse(jsonMatch[0]);
    res.json({ script });
  } catch (err) {
    res.status(500).json({ error: 'Error generando historia', detail: err.message });
  }
};
