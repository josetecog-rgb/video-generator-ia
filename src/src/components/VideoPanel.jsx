import React, { useState } from 'react';
import { generateVideo } from '../api';

const VIDEO_MODELS = [
  { id: 'fal-ai/kling-video/v1/standard/text-to-video', label: 'Kling v1 Standard (texto→video)' },
  { id: 'fal-ai/kling-video/v1/standard/image-to-video', label: 'Kling v1 Standard (imagen→video)' },
  { id: 'fal-ai/wan-i2v', label: 'Wan I2V (imagen→video)' },
];

export default function VideoPanel({ sharedData }) {
  const [prompt, setPrompt] = useState(sharedData.script?.hook || '');
  const [imageUrl, setImageUrl] = useState(sharedData.imageUrl || '');
  const [model, setModel] = useState(VIDEO_MODELS[0].id);
  const [duration, setDuration] = useState(5);
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleGenerate = async () => {
    if (!prompt.trim()) return setError('Ingresa un prompt');
    setError('');
    setLoading(true);
    try {
      const res = await generateVideo({ prompt, image_url: imageUrl || undefined, duration, model });
      setResult(res.data.result);
    } catch (e) {
      setError(e.response?.data?.error || 'Error al generar video');
    } finally {
      setLoading(false);
    }
  };

  const videoUrl = result?.video?.url || result?.video_url || null;

  return (
    <div className="panel">
      <div className="card">
        <h2>🎬 Generar Video con IA</h2>

        <div className="form-group">
          <label>Prompt del video</label>
          <textarea
            value={prompt}
            onChange={e => setPrompt(e.target.value)}
            placeholder="Describe la escena del video..."
          />
        </div>

        <div className="form-group">
          <label>URL de imagen base (opcional — para imagen→video)</label>
          <input
            value={imageUrl}
            onChange={e => setImageUrl(e.target.value)}
            placeholder="https://..."
          />
        </div>

        <div className="form-group">
          <label>Modelo</label>
          <select value={model} onChange={e => setModel(e.target.value)}>
            {VIDEO_MODELS.map(m => (
              <option key={m.id} value={m.id}>{m.label}</option>
            ))}
          </select>
        </div>

        <div className="form-group">
          <label>Duración (segundos)</label>
          <select value={duration} onChange={e => setDuration(Number(e.target.value))}>
            <option value={5}>5 segundos</option>
            <option value={10}>10 segundos</option>
          </select>
        </div>

        <button className="btn btn-primary" onClick={handleGenerate} disabled={loading}>
          {loading ? '⏳ Generando video (puede tardar 2-5 min)...' : '🎬 Generar video'}
        </button>
        {error && <p className="error">{error}</p>}
      </div>

      {videoUrl && (
        <div className="card">
          <h2>Video generado</h2>
          <video controls style={{ width: '100%', borderRadius: 8 }}>
            <source src={videoUrl} />
          </video>
          <a href={videoUrl} download className="btn btn-secondary" style={{ marginTop: 12 }}>
            ⬇️ Descargar video
          </a>
        </div>
      )}

      {result && !videoUrl && (
        <div className="card">
          <h2>Respuesta del servidor</h2>
          <pre style={{ fontSize: '0.75rem', color: '#aaa', overflow: 'auto' }}>
            {JSON.stringify(result, null, 2)}
          </pre>
        </div>
      )}
    </div>
  );
}
