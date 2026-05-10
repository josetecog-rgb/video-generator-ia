const express = require('express');
const router = express.Router();
const { chat } = require('../services/deepseek');

// POST /api/scripts/generate
router.post('/generate', async (req, res) => {
  try {
    const { topic, platform = 'tiktok', duration = 60, language = 'es' } = req.body;

    if (!topic) return res.status(400).json({ error: 'El campo "topic" es requerido' });

    const prompt = `Crea un guión para un video corto de ${duration} segundos para ${platform}.
Tema: "${topic}"
Idioma: ${language === 'es' ? 'español' : language}

El guión debe incluir:
- Hook (primeros 3 segundos) — debe enganchar inmediatamente
- Desarrollo — contenido principal
- CTA final — llamada a la acción

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
    console.error('Error generando guión:', err.message);
    res.status(500).json({ error: 'Error generando guión', detail: err.message });
  }
});

module.exports = router;
