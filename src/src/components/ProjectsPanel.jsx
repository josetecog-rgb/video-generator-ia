import React, { useState, useEffect } from 'react';
import { getProjects, deleteProject } from '../api';

export default function ProjectsPanel() {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    load();
  }, []);

  const load = async () => {
    try {
      const res = await getProjects();
      setProjects(res.data);
    } catch (e) {
      setError('Error cargando proyectos (¿MongoDB conectado?)');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('¿Eliminar este proyecto?')) return;
    await deleteProject(id);
    setProjects(prev => prev.filter(p => p._id !== id));
  };

  if (loading) return <div className="loading">Cargando proyectos...</div>;
  if (error) return <div className="error">{error}</div>;

  return (
    <div className="panel">
      <div className="card">
        <h2>📁 Proyectos guardados</h2>
        {projects.length === 0 ? (
          <p style={{ color: '#888' }}>No hay proyectos aún. Los proyectos se guardan automáticamente al generar contenido.</p>
        ) : (
          projects.map(p => (
            <div key={p._id} className="result-box" style={{ marginBottom: 12 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <strong>{p.title || p.topic || 'Sin título'}</strong>
                  <span style={{ marginLeft: 8, fontSize: '0.8rem', color: '#888' }}>
                    {p.platform} — {new Date(p.createdAt).toLocaleDateString('es')}
                  </span>
                </div>
                <button
                  className="btn btn-secondary"
                  style={{ padding: '4px 10px', fontSize: '0.8rem' }}
                  onClick={() => handleDelete(p._id)}
                >
                  🗑️
                </button>
              </div>
              {p.script?.full_script && (
                <p style={{ marginTop: 8, fontSize: '0.85rem', color: '#aaa' }}>
                  {p.script.full_script.slice(0, 120)}...
                </p>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
}
