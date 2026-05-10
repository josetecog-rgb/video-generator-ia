import React, { useState } from 'react';
import { generateScript } from '../api';

export default function ScriptPanel({ sharedData, setSharedData }) {
  const [topic, setTopic] = useState(sharedData.topic || '');
  const [duration, setDuration] = useState(60);
  const [loading, setLoading] = useState(false);
  const [script, setScript] = useState(sharedData.script || null);
  const [error, setError] = useState('');

  const handleGenerate = async () => {
    if (!topic.trim()) return setError('Ingresa un tema');
    setError('');
    setLoading(true);
    try {
      const res = await generateScript({ topic, platform: sharedData.platform, duration });
      setScript(res.data.script);
      setSharedData(prev => ({ ...prev, script: res.data.script, topic }));
    } catch (e) {
      setError(e.response?.data?.error || 'Error al generar guión');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="panel">
      <div className="card">
        <h2>📝 Generar Guión</h2>

        <div className="form-group">
          <label>Tema del video</label>
          <input
            value={topic}
            onChange={e => setTopic(e.target.value)}
            placeholder="Ej: 5 hábitos para ahorrar dinero..."
          />
        </div>

        <div className="form-group">
          <label>Duración (segundos)</label>
          <select value={duration} onChange={e => setDuration(Number(e.target.value))}>
            <option value={30}>30 seg</option>
            <option value={60}>60 seg</option>
            <option value={90}>90 seg</option>
            <option value={180}>3 min</option>
          </select>
        </div>

        <button className="btn btn-primary" onClick={handleGenerate} disabled={loading}>
          {loading ? '⏳ Generando...' : '✨ Generar guión'}
        </button>
        {error && <p className="error">{error}</p>}
      </div>

      {script && (
        <div className="card">
          <h2>Guión generado</h2>
          {script.hook && (
            <div className="result-box" style={{ marginBottom: 12 }}>
              <strong style={{ color: '#f59e0b' }}>🎣 Hook (primeros 3 seg)</strong>
              <p style={{ marginTop: 8 }}>{script.hook}</p>
            </div>
          )}
          {script.development && (
            <div className="result-box" style={{ marginBottom: 12 }}>
              <strong>📖 Desarrollo</strong>
              <p style={{ marginTop: 8 }}>{script.development}</p>
            </div>
          )}
          {script.cta && (
            <div className="result-box" style={{ marginBottom: 12 }}>
              <strong style={{ color: '#22c55e' }}>🚀 CTA</strong>
              <p style={{ marginTop: 8 }}>{script.cta}</p>
            </div>
          )}
          {script.image_prompts?.length > 0 && (
            <div className="result-box">
              <strong style={{ color: '#7c3aed' }}>🖼️ Prompts para imágenes</strong>
              {script.image_prompts.map((p, i) => (
                <p key={i} style={{ marginTop: 8, fontSize: '0.85rem', color: '#aaa' }}>
                  {i + 1}. {p}
                </p>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
