const { generateImage } = require('./_services/hf');

module.exports = async (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  try {
    const image_url = await generateImage({
      prompt: 'cinematic horror scene, young woman running in dark forest, dramatic rim lighting, sharp focus, 8k, by Greg Rutkowski, full body shot, 35mm, f/2.8',
      size: 'portrait_16_9',
    });
    res.json({ ok: true, image_url: image_url.slice(0, 80) + '...' });
  } catch (err) {
    res.status(500).json({ ok: false, error: err.message });
  }
};
