import React, { useState, useEffect } from 'react';
import { generateTopics, generateScript, generateImage, generateVideo, saveProject } from '../api';

const PLATFORMS = [
  { id: 'tiktok', label: '🎵 TikTok' },
  { id: 'youtube', label: '▶️ YouTube' },
  { id: 'instagram', label: '📸 Instagram' },
  { id: 'facebook', label: '👥 Facebook' },
  { id: 'telegram', label: '✈️ Telegram' },
  { id: 'whatsapp', label: '💬 WhatsApp' },
];

const STEP = { PLATFORM: 0, TOPICS: 1, SCRIPT: 2, IMAGES: 3, VIDEO: 4, DONE: 5 };

const initialState = () => ({
  platform: '',
  niche: '',
  topics: [],
  topic: '',
  script: null,
  images: [],
  video: null,
  step: STEP.PLATFORM,
  loading: false,
  error: '',
});

export default function Pipeline() {
  const [state, setState] = useState(initialState());

  const set = (patch) => setState(prev => ({ ...prev, ...patch }));

  // Auto-genera guión cuando se selecciona un tema
  useEffect(() => {
    if (state.topic && state.step === STEP.TOPICS) {
      runScript();
    }
  }, [state.topic]);

  // Auto-genera imágenes cuando el guión está listo
  useEffect(() => {
    if (state.script && state.step === STEP.SCRIPT) {
      runImages();
    }
  }, [state.script]);

  async function runTopics() {
    if (!state.platform) return set({ error: 'Elige una plataforma' });
    if (!state.niche.trim()) return set({ error: 'Escribe el tema o nicho' });
    set({ loading: true, error: '', topics: [], topic: '', script: null, images: [], video: null });
    try {
      const res = await generateTopics({ platform: state.platform, niche: state.niche, count: 6 });
      set({ topics: res.data.topics || [], step: STEP.TOPICS, loading: false });
    } catch (e) {
      set({ error: e.response?.data?.error || 'Error generando ideas', loading: false });
    }
  }

  async function selectTopic(topic) {
    set({ topic, step: STEP.TOPICS });
    // El useEffect dispara runScript automáticamente
  }

  async function runScript() {
    set({ loading: true, error: '' });
    try {
      const res = await generateScript({ topic: state.topic, platform: state.platform, duration: 60 });
      set({ script: res.data.script, step: STEP.SCRIPT, loading: false });
    } catch (e) {
      set({ error: e.response?.data?.error || 'Error generando guión', loading: false });
    }
  }

  async function runImages() {
    const prompts = state.script?.image_prompts || [];
    if (!prompts.length) {
      set({ step: STEP.IMAGES, images: [] });
      return;
    }
    set({ loading: true, error: '' });
    try {
      const results = await Promise.all(
        prompts.slice(0, 3).map(prompt =>
          generateImage({ prompt, width: 1024, height: 1024 })
            .then(r => ({ url: r.data.image_url, prompt }))
            .catch(() => null)
        )
      );
      const images = results.filter(Boolean);
      set({ images, step: STEP.IMAGES, loading: false });
    } catch (e) {
      set({ error: e.response?.data?.error || 'Error generando imágenes', loading: false });
    }
  }

  async function runVideo() {
    set({ loading: true, error: '' });
    try {
      const prompt = state.script?.hook || state.topic;
      const image_url = state.images[0]?.url;
      const res = await generateVideo({
        prompt,
        image_url,
        duration: 5,
        model: image_url
          ? 'fal-ai/kling-video/v1/standard/image-to-video'
          : 'fal-ai/kling-video/v1/standard/text-to-video',
      });
      const videoUrl = res.data.result?.video?.url || res.data.result?.video_url || null;
      set({ video: videoUrl, step: STEP.DONE, loading: false });

      // Guardar en proyectos
      try {
        await saveProject({
          title: state.topic,
          platform: state.platform,
          niche: state.niche,
          topic: state.topic,
          script: state.script,
          images: state.images,
          video: { url: videoUrl, status: 'ready' },
          status: 'ready',
        });
      } catch (_) {}
    } catch (e) {
      set({ error: e.response?.data?.error || 'Error generando video', loading: false });
    }
  }

  function restart(newPlatform) {
    setState({ ...initialState(), platform: newPlatform || '', niche: state.niche });
  }

  const s = state;

  return (
    <div className="pipeline">

      {/* PASO 0 — Plataforma y nicho */}
      <div className={`step ${s.step === STEP.PLATFORM ? 'active' : s.step > STEP.PLATFORM ? 'done' : ''}`}>
        <div className="step-header">
          <div className="step-num">{s.step > STEP.PLATFORM ? '✓' : '1'}</div>
          <div>
            <div className="step-title">Plataforma y tema</div>
            <div className="step-subtitle">
              {s.platform && s.niche ? `${s.platform.toUpperCase()} · ${s.niche}` : 'Elige dónde publicar y sobre qué'}
            </div>
          </div>
          {s.step > STEP.PLATFORM && (
            <button className="btn btn-ghost btn-sm step-badge" onClick={() => setState(initialState())}>Cambiar</button>
          )}
        </div>

        {s.step === STEP.PLATFORM && (
          <div className="step-body">
            <div className="form-group">
              <label>Plataforma destino</label>
              <div className="platform-grid">
                {PLATFORMS.map(p => (
                  <button
                    key={p.id}
                    className={`platform-pill ${s.platform === p.id ? 'active' : ''}`}
                    onClick={() => set({ platform: p.id, error: '' })}
                  >
                    {p.label}
                  </button>
                ))}
              </div>
            </div>
            <div className="form-group">
              <label>Nicho / Categoría</label>
              <input
                value={s.niche}
                onChange={e => set({ niche: e.target.value, error: '' })}
                placeholder="Ej: finanzas personales, fitness, cocina, tecnología..."
                onKeyDown={e => e.key === 'Enter' && runTopics()}
              />
            </div>
            {s.error && <div className="error-msg">{s.error}</div>}
            <button className="btn btn-primary" onClick={runTopics} disabled={s.loading}>
              {s.loading ? <><span className="spinner" /> Generando ideas...</> : '✨ Generar ideas de temas'}
            </button>
          </div>
        )}
      </div>

      {/* PASO 1 — Elegir tema */}
      {s.step >= STEP.TOPICS && (
        <div className={`step ${s.step === STEP.TOPICS && !s.topic ? 'active' : s.topic ? 'done' : ''}`}>
          <div className="step-header">
            <div className="step-num">{s.topic ? '✓' : '2'}</div>
            <div>
              <div className="step-title">Elige un tema</div>
              <div className="step-subtitle">{s.topic || 'Selecciona la idea que más te guste'}</div>
            </div>
            {s.topic && <span className="step-badge">✅ Seleccionado</span>}
          </div>

          {!s.topic && (
            <div className="step-body">
              <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: 4 }}>
                Haz clic en un tema — el guión, imágenes y video se generarán automáticamente.
              </p>
              <div className="topic-list">
                {s.topics.map((t, i) => (
                  <div key={i} className="topic-item" onClick={() => selectTopic(t)}>
                    <span>{t}</span>
                    <span style={{ color: 'var(--accent)', fontSize: '0.8rem' }}>→ Usar este</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* PASO 2 — Guión */}
      {s.topic && (
        <div className={`step ${s.step === STEP.SCRIPT && s.loading ? 'active' : s.script ? 'done' : 'active'}`}>
          <div className="step-header">
            <div className="step-num">{s.script ? '✓' : '3'}</div>
            <div>
              <div className="step-title">Guión</div>
              <div className="step-subtitle">{s.script ? 'Hook + desarrollo + CTA generados' : 'Generando guión automáticamente...'}</div>
            </div>
            {s.script && <span className="step-badge">✅ Listo</span>}
          </div>

          {s.step === STEP.SCRIPT && s.loading && !s.script && (
            <div className="step-body">
              <div className="loading-bar"><span className="spinner" /> Escribiendo el guión con IA...</div>
            </div>
          )}

          {s.script && (
            <div className="step-body">
              <div className="script-section hook">
                <strong>🎣 Hook — primeros 3 segundos</strong>
                <p>{s.script.hook}</p>
              </div>
              <div className="script-section dev">
                <strong>📖 Desarrollo</strong>
                <p>{s.script.development}</p>
              </div>
              <div className="script-section cta">
                <strong>🚀 Llamada a la acción</strong>
                <p>{s.script.cta}</p>
              </div>
            </div>
          )}
        </div>
      )}

      {/* PASO 3 — Imágenes */}
      {s.script && (
        <div className={`step ${s.step === STEP.IMAGES && s.loading ? 'active' : s.images.length ? 'done' : 'active'}`}>
          <div className="step-header">
            <div className="step-num">{s.images.length ? '✓' : '4'}</div>
            <div>
              <div className="step-title">Imágenes</div>
              <div className="step-subtitle">
                {s.images.length ? `${s.images.length} imagen(es) generada(s)` : 'Generando imágenes automáticamente...'}
              </div>
            </div>
            {s.images.length > 0 && <span className="step-badge">✅ {s.images.length} imágenes</span>}
          </div>

          {s.step === STEP.IMAGES && s.loading && !s.images.length && (
            <div className="step-body">
              <div className="loading-bar"><span className="spinner" /> Generando imágenes con FLUX...</div>
            </div>
          )}

          {s.images.length > 0 && (
            <div className="step-body">
              <div className="image-grid">
                {s.images.map((img, i) => (
                  <div key={i} className="image-card">
                    <img src={img.url} alt={`Imagen ${i + 1}`} />
                    <div className="image-card-footer">
                      <a href={img.url} download className="btn btn-ghost btn-sm">⬇️</a>
                      <a href={img.url} target="_blank" rel="noreferrer" className="btn btn-ghost btn-sm">🔗</a>
                    </div>
                  </div>
                ))}
              </div>

              {s.step === STEP.IMAGES && !s.loading && !s.video && (
                <button className="btn btn-primary" style={{ marginTop: 16 }} onClick={runVideo} disabled={s.loading}>
                  🎬 Generar video
                </button>
              )}
            </div>
          )}
        </div>
      )}

      {/* PASO 4 — Video */}
      {s.images.length > 0 && (s.step === STEP.VIDEO || s.step === STEP.DONE) && (
        <div className={`step ${s.video ? 'done' : 'active'}`}>
          <div className="step-header">
            <div className="step-num">{s.video ? '✓' : '5'}</div>
            <div>
              <div className="step-title">Video</div>
              <div className="step-subtitle">{s.video ? 'Video generado con IA' : 'Generando video (puede tardar 2-4 min)...'}</div>
            </div>
            {s.video && <span className="step-badge">✅ Listo</span>}
          </div>

          {s.loading && !s.video && (
            <div className="step-body">
              <div className="loading-bar"><span className="spinner" /> Generando video con Kling AI...</div>
            </div>
          )}

          {s.video && (
            <div className="step-body">
              <div className="video-wrap">
                <video controls>
                  <source src={s.video} />
                </video>
              </div>
              <div style={{ display: 'flex', gap: 8, marginTop: 12 }}>
                <a href={s.video} download className="btn btn-ghost btn-sm">⬇️ Descargar</a>
                <a href={s.video} target="_blank" rel="noreferrer" className="btn btn-ghost btn-sm">🔗 Abrir</a>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Error global */}
      {s.error && s.step > STEP.PLATFORM && (
        <div className="error-msg">{s.error}</div>
      )}

      {/* Repetir para otras plataformas */}
      {s.step === STEP.DONE && (
        <div className="repeat-banner">
          <h3>🎉 ¡Video guardado en Proyectos! ¿Crear el mismo contenido para otra plataforma?</h3>
          <div className="repeat-grid">
            {PLATFORMS.filter(p => p.id !== s.platform).map(p => (
              <button key={p.id} className="platform-pill" onClick={() => restart(p.id)}>
                {p.label}
              </button>
            ))}
            <button className="btn btn-ghost btn-sm" onClick={() => setState(initialState())}>
              🔄 Empezar desde cero
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
