const { chat } = require('./_services/deepseek');

module.exports = async (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Método no permitido' });

  try {
    const { category, genre, platform = 'tiktok', protagonistDescription = '' } = req.body;
    if (!category || !genre) return res.status(400).json({ error: 'category y genre son requeridos' });

    const protagonistNote = protagonistDescription
      ? `El protagonista ya está definido por el usuario y DEBES usarlo exactamente: "${protagonistDescription}". Genera protagonist_visual_description basado en esta descripción.`
      : `Inventa un protagonista memorable y específico para la historia.`;

    const prompt = `Eres un guionista experto en historias cortas virales para redes sociales.

Crea una historia de ${genre} sobre "${category}" para ${platform}. Duración: 60 segundos.

${protagonistNote}

Responde ÚNICAMENTE con este JSON exacto (sin markdown, sin texto extra):
{
  "title": "Título de la historia (máx 8 palabras)",
  "protagonist_visual_description": "Descripción visual MUY detallada del protagonista en inglés para usar en prompts de imagen: edad, género, color y estilo de cabello, color de ojos, ropa específica con colores, rasgos faciales únicos. Ejemplo: 'elderly woman in her 70s, silver curly hair, blue eyes, red wool cardigan, silver necklace, warm wrinkled face, determined expression'",
  "hook": "Las primeras 2 oraciones que enganchan al espectador en 3 segundos (en español)",
  "story": "Historia completa de 150-200 palabras en español, emocionante con giro sorprendente",
  "scenes": [
    {
      "description": "Qué hace el protagonista en esta escena (en español, muy visual y específico, 1 oración)",
      "action": "What the protagonist is doing in English for the image prompt (specific action verb)"
    },
    {
      "description": "Qué hace el protagonista en la escena 2 (en español)",
      "action": "What the protagonist is doing in English"
    },
    {
      "description": "Escena del desenlace con giro (en español)",
      "action": "The final reveal action in English"
    }
  ],
  "cta": "Llamada a la acción (máx 1 oración en español)"
}`;

    const raw = await chat([{ role: 'user', content: prompt }], { temperature: 0.85, max_tokens: 1500 });
    const jsonMatch = raw.match(/\{[\s\S]*\}/);
    if (!jsonMatch) return res.status(500).json({ error: 'Error parseando respuesta', raw: raw.slice(0, 300) });
    const script = JSON.parse(jsonMatch[0]);
    res.json({ script });
  } catch (err) {
    res.status(500).json({ error: 'Error generando historia', detail: err.message });
  }
};
