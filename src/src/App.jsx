import React, { useState } from 'react';
import TopicsPanel from './components/TopicsPanel';
import ScriptPanel from './components/ScriptPanel';
import ImagePanel from './components/ImagePanel';
import VideoPanel from './components/VideoPanel';
import ProjectsPanel from './components/ProjectsPanel';
import './App.css';

const TABS = [
  { id: 'topics', label: '💡 Temas' },
  { id: 'script', label: '📝 Guión' },
  { id: 'image', label: '🖼️ Imágenes' },
  { id: 'video', label: '🎬 Video' },
  { id: 'projects', label: '📁 Proyectos' },
];

export default function App() {
  const [activeTab, setActiveTab] = useState('topics');
  const [sharedData, setSharedData] = useState({
    topic: '',
    platform: 'tiktok',
    script: null,
    imageUrl: null,
  });

  return (
    <div className="app">
      <header className="header">
        <h1>🎬 Generador de Videos Virales IA</h1>
        <p>Crea contenido viral para TikTok, YouTube, Instagram y más</p>
      </header>

      <nav className="tabs">
        {TABS.map(tab => (
          <button
            key={tab.id}
            className={`tab ${activeTab === tab.id ? 'active' : ''}`}
            onClick={() => setActiveTab(tab.id)}
          >
            {tab.label}
          </button>
        ))}
      </nav>

      <main className="content">
        {activeTab === 'topics' && (
          <TopicsPanel sharedData={sharedData} setSharedData={setSharedData} />
        )}
        {activeTab === 'script' && (
          <ScriptPanel sharedData={sharedData} setSharedData={setSharedData} />
        )}
        {activeTab === 'image' && (
          <ImagePanel sharedData={sharedData} setSharedData={setSharedData} />
        )}
        {activeTab === 'video' && (
          <VideoPanel sharedData={sharedData} />
        )}
        {activeTab === 'projects' && (
          <ProjectsPanel />
        )}
      </main>
    </div>
  );
}
