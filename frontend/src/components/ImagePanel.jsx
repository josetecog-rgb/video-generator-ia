import React, { useState } from 'react';
import { generateImage } from '../api';

const MODELS = [
  { id: 'fal-ai/flux/schnell', label: 'FLUX Schnell (rápido)' },
  { id: 'fal-ai/flux/dev', label: 'FLUX Dev (calidad)' },
  { id: 'fal-ai/stable-diffusion-v3-medium', label: 'SD3 Medium' },
];

const SIZES = [
  { label: 'Cuadrado 1:1', w: 1024, h: 1024 },
  { label: 'Vertical 9:16 (TikTok)', w: 576, h: 1024 },
  { label: 'Horizontal 16:9 (YouTube)', w: 1024, h: 576 },
  { label: 'Instagram 4:5', w: 819, h: 1024 },
];

export default function ImagePanel({ sharedData, setSharedData }) {
  const defaultPrompt = sharedData.script?.image_prompts?.[0] || '';
  const [prompt, setPrompt] = useState(defaultPrompt);
  const [model, setModel] = useState(MODELS[0].id);
  const [size, setSize] = useState(SIZES[0]);
  const [imageUrl, setImageUrl] = useState(sharedData.imageUrl || null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleGenerate = async () => {
    if (!prompt.trim()) return setError('Ingresa un prompt en inglés');
    setError('');
    setLoading(true);
    try {
      const res = await generateImage({ prompt, model, width: size.w, height: size.h });
      const url = res.data.image_url;
      setImageUrl(url);
      setSharedData(prev => ({ ...prev, imageUrl: url }));
    } catch (e) {
      setError(e.response?.data?.error || 'Error al generar imagen');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="panel">
      <div className="card">
        <h2>🖼️ Generar Imagen con IA</h2>

        <div className="form-group">
          <label>Prompt (en inglés)</label>
          <textarea
            value={prompt}
            onChange={e => setPrompt(e.target.value)}
            placeholder="Describe la imagen que quieres generar..."
          />
        </div>

        <div className="form-group">
          <label>Modelo</label>
          <select value={model} onChange={e => setModel(e.target.value)}>
            {MODELS.map(m => (
              <option key={m.id} value={m.id}>{m.label}</option>
            ))}
          </select>
        </div>

        <div className="form-group">
          <label>Tamaño</label>
          <select onChange={e => setSize(SIZES[e.target.value])} defaultValue={0}>
            {SIZES.map((s, i) => (
              <option key={i} value={i}>{s.label} ({s.w}x{s.h})</option>
            ))}
          </select>
        </div>

        <button className="btn btn-primary" onClick={handleGenerate} disabled={loading}>
          {loading ? '⏳ Generando imagen...' : '✨ Generar imagen'}
        </button>
        {error && <p className="error">{error}</p>}
      </div>

      {imageUrl && (
        <div className="card">
          <h2>Imagen generada</h2>
          <div className="image-preview">
            <img src={imageUrl} alt="Generada por IA" />
          </div>
          <div style={{ display: 'flex', gap: 8, marginTop: 12 }}>
            <a href={imageUrl} target="_blank" rel="noreferrer" className="btn btn-secondary">
              🔗 Abrir en nueva pestaña
            </a>
            <a href={imageUrl} download className="btn btn-secondary">
              ⬇️ Descargar
            </a>
          </div>
        </div>
      )}
    </div>
  );
}
