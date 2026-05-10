const axios = require('axios');
const FormData = require('form-data');

module.exports = async (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Método no permitido' });

  try {
    const { image } = req.body; // base64 string
    if (!image) return res.status(400).json({ error: '"image" es requerido' });

    const base64Data = image.replace(/^data:image\/\w+;base64,/, '');
    const buffer = Buffer.from(base64Data, 'base64');

    const form = new FormData();
    form.append('file', buffer, { filename: 'protagonist.jpg', contentType: 'image/jpeg' });

    const upload = await axios.post('https://tmpfiles.org/api/v1/upload', form, {
      headers: form.getHeaders(),
      timeout: 20000,
    });

    // tmpfiles devuelve url como https://tmpfiles.org/XXXXX/protagonist.jpg
    // La URL directa es https://tmpfiles.org/dl/XXXXX/protagonist.jpg
    const rawUrl = upload.data?.data?.url || '';
    const directUrl = rawUrl.replace('tmpfiles.org/', 'tmpfiles.org/dl/');

    res.json({ url: directUrl });
  } catch (err) {
    res.status(500).json({ error: 'Error subiendo imagen', detail: err.message });
  }
};
