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
  platform: '', niche: '', topics: [], topic: '',
  script: null, images: [], imagesDone: false,
  video: null, step: STEP.PLATFORM, loading: false, error: '',
});

export default function Pipeline() {
  const [state, setState] = useState(initialState());
  const set = (patch) => setState(prev => ({ ...prev, ...patch }));

  // Auto-genera guión al seleccionar tema
  useEffect(() => {
    if (state.topic && state.step === STEP.TOPICS) runScript();
  }, [state.topic]);

  // Auto-genera imágenes cuando el guión está listo
  useEffect(() => {
    if (state.script && state.step === STEP.SCRIPT) runImages();
  }, [state.script]);

  async function runTopics() {
    if (!state.platform) return set({ error: 'Elige una plataforma' });
    if (!state.niche.trim()) return set({ error: 'Escribe el tema o nicho' });
    set({ loading: true, error: '', topics: [], topic: '', script: null, images: [], imagesDone: false, video: null });
    try {
      const res = await generateTopics({ platform: state.platform, niche: state.niche, count: 6 });
      set({ topics: res.data.topics || [], step: STEP.TOPICS, loading: false });
    } catch (e) {
      set({ error: e.response?.data?.error || 'Error generando ideas', loading: false });
    }
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
    // Solo generamos 1 imagen para evitar timeouts
    const prompt = prompts[0];
    if (!prompt) {
      set({ imagesDone: true, step: STEP.IMAGES });
      return;
    }
    set({ loading: true, error: '' });
    try {
      const res = await generateImage({ prompt, width: 1024, height: 1024 });
      const url = res.data.image_url;
      const images = url ? [{ url, prompt }] : [];
      set({ images, imagesDone: true, step: STEP.IMAGES, loading: false });
    } catch (e) {
      // Si falla, igual avanzamos al paso de imágenes para no bloquear
      set({ images: [], imagesDone: true, step: STEP.IMAGES, loading: false, error: 'Las imágenes no se pudieron generar — puedes igual generar el video.' });
    }
  }

  async function runVideo() {
    set({ loading: true, error: '', step: STEP.VIDEO });
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
      try {
        await saveProject({
          title: state.topic, platform: state.platform, niche: state.niche,
          topic: state.topic, script: state.script, images: state.images,
          video: { url: videoUrl, status: 'ready' }, status: 'ready',
        });
      } catch (_) {}
    } catch (e) {
      set({ error: e.response?.data?.error || 'Error generando video', loading: false, step: STEP.IMAGES });
    }
  }

  const s = state;

  return (
    <div className="pipeline">

      {/* PASO 1 — Plataforma y nicho */}
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
                  <button key={p.id} className={`platform-pill ${s.platform === p.id ? 'active' : ''}`}
                    onClick={() => set({ platform: p.id, error: '' })}>
                    {p.label}
                  </button>
                ))}
              </div>
            </div>
            <div className="form-group">
              <label>Nicho / Categoría</label>
              <input value={s.niche} onChange={e => set({ niche: e.target.value, error: '' })}
                placeholder="Ej: finanzas personales, fitness, cocina, tecnología..."
                onKeyDown={e => e.key === 'Enter' && runTopics()} />
            </div>
            {s.error && <div className="error-msg">{s.error}</div>}
            <button className="btn btn-primary" onClick={runTopics} disabled={s.loading}>
              {s.loading ? <><span className="spinner" /> Generando ideas...</> : '✨ Generar ideas de temas'}
            </button>
          </div>
        )}
      </div>

      {/* PASO 2 — Elegir tema */}
      {s.step >= STEP.TOPICS && (
        <div className={`step ${!s.topic ? 'active' : 'done'}`}>
          <div className="step-header">
            <div className="step-num">{s.topic ? '✓' : '2'}</div>
            <div>
              <div className="step-title">Elige un tema</div>
              <div className="step-subtitle">{s.topic || 'Haz clic en la idea que más te guste'}</div>
            </div>
            {s.topic && <span className="step-badge">✅ Seleccionado</span>}
          </div>

          {!s.topic && (
            <div className="step-body">
              <p style={{ fontSize: '0.84rem', color: 'var(--text-muted)', marginBottom: 10 }}>
                Al seleccionar un tema, el guión, imágenes y video se generan solos.
              </p>
              <div className="topic-list">
                {s.topics.map((t, i) => (
                  <div key={i} className="topic-item" onClick={() => set({ topic: t, step: STEP.TOPICS })}>
                    <span>{t}</span>
                    <span>→ Usar este</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* PASO 3 — Guión */}
      {s.topic && (
        <div className={`step ${s.script ? 'done' : 'active'}`}>
          <div className="step-header">
            <div className="step-num">{s.script ? '✓' : '3'}</div>
            <div>
              <div className="step-title">Guión</div>
              <div className="step-subtitle">
                {s.script ? 'Hook + desarrollo + CTA' : 'Generando guión automáticamente...'}
              </div>
            </div>
            {s.script && <span className="step-badge">✅ Listo</span>}
          </div>

          {!s.script && (
            <div className="step-body">
              <div className="loading-bar"><span className="spinner" /> Escribiendo el guión con DeepSeek...</div>
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

      {/* PASO 4 — Imágenes */}
      {s.script && (
        <div className={`step ${s.imagesDone ? (s.images.length ? 'done' : 'active') : 'active'}`}>
          <div className="step-header">
            <div className="step-num">{s.images.length ? '✓' : '4'}</div>
            <div>
              <div className="step-title">Imagen</div>
              <div className="step-subtitle">
                {s.imagesDone
                  ? (s.images.length ? 'Imagen generada con FLUX' : 'No se pudo generar — puedes continuar igual')
                  : 'Generando imagen con FLUX...'}
              </div>
            </div>
            {s.images.length > 0 && <span className="step-badge">✅ Lista</span>}
          </div>

          {!s.imagesDone && (
            <div className="step-body">
              <div className="loading-bar"><span className="spinner" /> Generando imagen con FLUX AI...</div>
            </div>
          )}

          {s.imagesDone && (
            <div className="step-body">
              {s.images.length > 0 && (
                <div className="image-grid">
                  {s.images.map((img, i) => (
                    <div key={i} className="image-card">
                      <img src={img.url} alt={`Imagen ${i + 1}`} />
                      <div className="image-card-footer">
                        <a href={img.url} download className="btn btn-ghost btn-sm">⬇️ Descargar</a>
                        <a href={img.url} target="_blank" rel="noreferrer" className="btn btn-ghost btn-sm">🔗 Ver</a>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {s.error && <div className="error-msg" style={{ marginBottom: 12 }}>{s.error}</div>}

              {s.step === STEP.IMAGES && !s.loading && !s.video && (
                <button className="btn btn-primary" style={{ marginTop: 14 }} onClick={runVideo}>
                  🎬 Generar video
                </button>
              )}
            </div>
          )}
        </div>
      )}

      {/* PASO 5 — Video */}
      {s.step >= STEP.VIDEO && (
        <div className={`step ${s.video ? 'done' : 'active'}`}>
          <div className="step-header">
            <div className="step-num">{s.video ? '✓' : '5'}</div>
            <div>
              <div className="step-title">Video</div>
              <div className="step-subtitle">
                {s.video ? 'Video generado y listo' : 'Generando video con Kling AI (2-4 min)...'}
              </div>
            </div>
            {s.video && <span className="step-badge">✅ Listo</span>}
          </div>

          {s.loading && !s.video && (
            <div className="step-body">
              <div className="loading-bar"><span className="spinner" /> Generando video con Kling AI... (puede tardar 2-4 min)</div>
            </div>
          )}

          {s.video && (
            <div className="step-body">
              <div className="video-wrap">
                <video controls><source src={s.video} /></video>
              </div>
              <div style={{ display: 'flex', gap: 8, marginTop: 12 }}>
                <a href={s.video} download className="btn btn-ghost btn-sm">⬇️ Descargar</a>
                <a href={s.video} target="_blank" rel="noreferrer" className="btn btn-ghost btn-sm">🔗 Abrir</a>
              </div>
            </div>
          )}

          {s.error && s.step === STEP.IMAGES && (
            <div className="step-body">
              <div className="error-msg">{s.error}</div>
            </div>
          )}
        </div>
      )}

      {/* Repetir para otras plataformas */}
      {s.step === STEP.DONE && (
        <div className="repeat-banner">
          <h3>🎉 ¡Guardado en Proyectos! ¿Repetir para otra plataforma?</h3>
          <div className="repeat-grid">
            {PLATFORMS.filter(p => p.id !== s.platform).map(p => (
              <button key={p.id} className="platform-pill"
                onClick={() => setState({ ...initialState(), platform: p.id, niche: s.niche })}>
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
