import React, { useState, useEffect } from 'react';
import { getProjects, deleteProject } from '../api';

export default function ProjectsPanel() {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => { load(); }, []);

  async function load() {
    try {
      const res = await getProjects();
      setProjects(res.data);
    } catch {
      setError('Sin conexión a base de datos — configura MONGODB_URI en Vercel para guardar proyectos.');
    } finally {
      setLoading(false);
    }
  }

  async function handleDelete(id) {
    if (!window.confirm('¿Eliminar este proyecto?')) return;
    await deleteProject(id);
    setProjects(prev => prev.filter(p => p._id !== id));
  }

  return (
    <div>
      <div style={{ marginBottom: 20 }}>
        <h2 style={{ fontSize: '1.1rem', marginBottom: 6 }}>📁 Mis Proyectos</h2>
        <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', lineHeight: 1.6 }}>
          Aquí se guardan automáticamente todos los videos que generas — con su tema, guión, imágenes y video.
          Sirve para reutilizar contenido, comparar resultados o retomar un proyecto anterior.
        </p>
      </div>

      {loading && <div className="loading-bar"><span className="spinner" /> Cargando...</div>}
      {error && <div className="error-msg">{error}</div>}

      {!loading && !error && projects.length === 0 && (
        <div style={{ textAlign: 'center', padding: '40px 20px', color: 'var(--text-muted)' }}>
          <div style={{ fontSize: '2.5rem', marginBottom: 12 }}>🎬</div>
          <p>Aún no tienes proyectos guardados.</p>
          <p style={{ fontSize: '0.83rem', marginTop: 6 }}>Genera tu primer video y aparecerá aquí automáticamente.</p>
        </div>
      )}

      {projects.map(p => (
        <div key={p._id} className="project-card">
          <div className="project-card-header">
            <div>
              <h3>{p.topic || p.title || 'Sin título'}</h3>
              <div className="project-meta">
                {p.platform?.toUpperCase()} · {p.niche} · {new Date(p.createdAt).toLocaleDateString('es')}
                {' · '}
                <span style={{ color: p.status === 'ready' ? 'var(--success)' : 'var(--text-muted)' }}>
                  {p.status === 'ready' ? '✅ Completo' : p.status}
                </span>
              </div>
            </div>
            <button className="btn btn-ghost btn-sm" onClick={() => handleDelete(p._id)}>🗑️</button>
          </div>

          {p.script?.hook && (
            <div className="project-script-preview">
              <strong style={{ fontSize: '0.75rem', color: 'var(--warning)' }}>HOOK:</strong> {p.script.hook}
            </div>
          )}

          <div style={{ display: 'flex', gap: 8, marginTop: 12, flexWrap: 'wrap' }}>
            {p.images?.map((img, i) => img.url && (
              <img key={i} src={img.url} alt="" style={{ width: 64, height: 64, borderRadius: 6, objectFit: 'cover', border: '1px solid var(--border)' }} />
            ))}
            {p.video?.url && (
              <a href={p.video.url} target="_blank" rel="noreferrer" className="btn btn-ghost btn-sm">
                ▶️ Ver video
              </a>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}
