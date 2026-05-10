const express = require('express');
const router = express.Router();
const { chat } = require('../services/deepseek');

const PLATFORMS = ['youtube', 'instagram', 'tiktok', 'facebook', 'telegram'];

// POST /api/topics/generate
router.post('/generate', async (req, res) => {
  try {
    const { platform = 'tiktok', niche = 'general', count = 5 } = req.body;

    if (!PLATFORMS.includes(platform)) {
      return res.status(400).json({ error: `Plataforma inválida. Usa: ${PLATFORMS.join(', ')}` });
    }

    const prompt = `Genera ${count} ideas de temas para videos virales en ${platform} sobre el nicho "${niche}".
Cada tema debe ser:
- Corto y llamativo (máx 10 palabras)
- Con alto potencial viral
- Orientado a engagement

Responde SOLO con un JSON array de strings. Ejemplo: ["Tema 1", "Tema 2"]`;

    const raw = await chat([{ role: 'user', content: prompt }]);
    const jsonMatch = raw.match(/\[[\s\S]*\]/);
    const topics = jsonMatch ? JSON.parse(jsonMatch[0]) : [];

    res.json({ topics, platform, niche });
  } catch (err) {
    console.error('Error generando temas:', err.message);
    res.status(500).json({ error: 'Error generando temas', detail: err.message });
  }
});

module.exports = router;
