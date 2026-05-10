const { generateImage } = require('./_services/together');

module.exports = async (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  try {
    const image_url = await generateImage({
      prompt: 'classic comic book style, bold black outlines, flat colors, a terrified young woman with dark hair running through a haunted forest at night, Ben-Day dots, vintage comic panels, by Pepo art style, full body shot, dramatic shadows, masterpiece',
      size: 'portrait_16_9',
    });
    res.json({ ok: true, chars: image_url.length, preview: image_url.slice(0, 60) + '...' });
  } catch (err) {
    res.status(500).json({ ok: false, error: err.message });
  }
};
