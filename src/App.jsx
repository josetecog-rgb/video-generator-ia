import React, { useState } from 'react';
import Pipeline from './components/Pipeline';
import ProjectsPanel from './components/ProjectsPanel';
import './App.css';

export default function App() {
  const [view, setView] = useState('pipeline');

  return (
    <div className="app">
      <header className="header">
        <div className="header-inner">
          <h1>🎬 Generador de Videos Virales IA</h1>
          <nav className="top-nav">
            <button className={`nav-btn ${view === 'pipeline' ? 'active' : ''}`} onClick={() => setView('pipeline')}>
              ✨ Crear video
            </button>
            <button className={`nav-btn ${view === 'projects' ? 'active' : ''}`} onClick={() => setView('projects')}>
              📁 Mis proyectos
            </button>
          </nav>
        </div>
      </header>
      <main className="content">
        {view === 'pipeline' ? <Pipeline /> : <ProjectsPanel />}
      </main>
    </div>
  );
}
