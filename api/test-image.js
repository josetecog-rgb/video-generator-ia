const { generateImage } = require('./_services/falai');

module.exports = async (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  try {
    const result = await generateImage({
      prompt: 'cinematic horror scene, young woman running in dark forest, dramatic rim lighting, sharp focus, 8k, by Greg Rutkowski, full body shot, 35mm, f/2.8',
      size: 'portrait_16_9',
    });
    const url = result?.images?.[0]?.url || null;
    res.json({ ok: !!url, image_url: url, raw: result });
  } catch (err) {
    res.status(500).json({ ok: false, error: err.message });
  }
};
