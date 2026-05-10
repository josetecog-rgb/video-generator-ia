const express = require('express');
const router = express.Router();
const { generateImage } = require('../services/falai');

// POST /api/images/generate
router.post('/generate', async (req, res) => {
  try {
    const {
      prompt,
      width = 1024,
      height = 1024,
      model = 'fal-ai/flux/schnell'
    } = req.body;

    if (!prompt) return res.status(400).json({ error: 'El campo "prompt" es requerido' });

    const result = await generateImage({ prompt, width, height, model });

    const imageUrl = result?.images?.[0]?.url || result?.image?.url || null;
    res.json({ image_url: imageUrl, raw: result });
  } catch (err) {
    console.error('Error generando imagen:', err.message);
    res.status(500).json({ error: 'Error generando imagen', detail: err.message });
  }
});

module.exports = router;
