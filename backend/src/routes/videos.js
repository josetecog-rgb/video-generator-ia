const express = require('express');
const router = express.Router();
const { generateVideo, getJobResult } = require('../services/falai');

// POST /api/videos/generate
router.post('/generate', async (req, res) => {
  try {
    const {
      prompt,
      image_url,
      duration = 5,
      model = 'fal-ai/kling-video/v1/standard/text-to-video'
    } = req.body;

    if (!prompt) return res.status(400).json({ error: 'El campo "prompt" es requerido' });

    const result = await generateVideo({ prompt, image_url, duration, model });
    res.json({ result });
  } catch (err) {
    console.error('Error generando video:', err.message);
    res.status(500).json({ error: 'Error generando video', detail: err.message });
  }
});

// GET /api/videos/status/:requestId
router.get('/status/:requestId', async (req, res) => {
  try {
    const result = await getJobResult(req.params.requestId);
    res.json(result);
  } catch (err) {
    res.status(500).json({ error: 'Error consultando estado', detail: err.message });
  }
});

module.exports = router;
