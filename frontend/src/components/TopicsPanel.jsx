import React, { useState } from 'react';
import { generateTopics } from '../api';

const PLATFORMS = ['tiktok', 'youtube', 'instagram', 'facebook', 'telegram'];

export default function TopicsPanel({ sharedData, setSharedData }) {
  const [niche, setNiche] = useState('');
  const [platform, setPlatform] = useState(sharedData.platform);
  const [topics, setTopics] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleGenerate = async () => {
    if (!niche.trim()) return setError('Ingresa un nicho');
    setError('');
    setLoading(true);
    try {
      const res = await generateTopics({ platform, niche, count: 6 });
      setTopics(res.data.topics || []);
    } catch (e) {
      setError(e.response?.data?.error || 'Error al generar temas');
    } finally {
      setLoading(false);
    }
  };

  const selectTopic = (topic) => {
    setSharedData(prev => ({ ...prev, topic, platform }));
  };

  return (
    <div className="panel">
      <div className="card">
        <h2>💡 Generar Ideas de Temas</h2>

        <div className="form-group">
          <label>Plataforma</label>
          <div className="platform-grid">
            {PLATFORMS.map(p => (
              <button
                key={p}
                className={`platform-btn ${platform === p ? 'active' : ''}`}
                onClick={() => setPlatform(p)}
              >
                {p.charAt(0).toUpperCase() + p.slice(1)}
              </button>
            ))}
          </div>
        </div>

        <div className="form-group">
          <label>Nicho / Categoría</label>
          <input
            value={niche}
            onChange={e => setNiche(e.target.value)}
            placeholder="Ej: fitness, finanzas personales, cocina..."
            onKeyDown={e => e.key === 'Enter' && handleGenerate()}
          />
        </div>

        <button className="btn btn-primary" onClick={handleGenerate} disabled={loading}>
          {loading ? '⏳ Generando...' : '✨ Generar temas'}
        </button>
        {error && <p className="error">{error}</p>}
      </div>

      {topics.length > 0 && (
        <div className="card">
          <h2>Temas generados — haz clic para seleccionar</h2>
          <div className="topic-list">
            {topics.map((topic, i) => (
              <div
                key={i}
                className={`topic-item ${sharedData.topic === topic ? 'selected' : ''}`}
                onClick={() => selectTopic(topic)}
              >
                <span>{topic}</span>
                {sharedData.topic === topic && <span>✅</span>}
              </div>
            ))}
          </div>
          {sharedData.topic && (
            <p style={{ marginTop: 12, fontSize: '0.85rem', color: '#22c55e' }}>
              ✅ Tema seleccionado: <strong>{sharedData.topic}</strong>
            </p>
          )}
        </div>
      )}
    </div>
  );
}
