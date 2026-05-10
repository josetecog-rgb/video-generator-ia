import React, { useState } from 'react';
import { generateScript, generateImage, generateVideo, generateCaption } from '../api';

const PLATFORMS = [
  { id: 'tiktok',    label: '🎵 TikTok' },
  { id: 'youtube',   label: '▶️ YouTube' },
  { id: 'instagram', label: '📸 Instagram' },
  { id: 'facebook',  label: '👥 Facebook' },
  { id: 'telegram',  label: '✈️ Telegram' },
  { id: 'whatsapp',  label: '💬 WhatsApp' },
];

const GENRES = [
  { id: 'Terror',       label: '👻 Terror' },
  { id: 'Suspenso',     label: '🔍 Suspenso' },
  { id: 'Acción',       label: '💥 Acción' },
  { id: 'Comedia',      label: '😂 Comedia' },
  { id: 'Romance',      label: '💕 Romance' },
  { id: 'Drama',        label: '😢 Drama' },
  { id: 'Motivacional', label: '💪 Motivacional' },
  { id: 'Misterio',     label: '🌀 Misterio' },
];

const STEP = { CONFIG: 0, SCRIPT: 1, IMAGES: 2, VIDEO: 3, CAPTION: 4 };

const init = () => ({
  platform: '', category: '', genre: '',
  script: null, images: [], imagesDone: false,
  video: null, caption: null,
  step: STEP.CONFIG,
  loading: false, loadingMsg: '', error: '',
});

export default function Pipeline() {
  const [s, setS] = useState(init());
  const set = (p) => setS(prev => ({ ...prev, ...p }));

  /* ── PASO 1: Generar historia ── */
  async function runScript() {
    if (!s.platform) return set({ error: 'Elige una plataforma' });
    if (!s.category.trim()) return set({ error: 'Escribe la categoría' });
    if (!s.genre) return set({ error: 'Elige un género' });
    set({ loading: true, loadingMsg: 'Escribiendo la historia...', error: '', script: null, images: [], imagesDone: false, video: null, caption: null });
    try {
      const res = await generateScript({ category: s.category, genre: s.genre, platform: s.platform });
      set({ script: res.data.script, step: STEP.SCRIPT, loading: false, loadingMsg: '' });
    } catch (e) {
      set({ error: e.response?.data?.error || 'Error generando historia', loading: false, loadingMsg: '' });
    }
  }

  /* ── PASO 2: Generar imágenes de las escenas ── */
  async function runImages() {
    const scenes = s.script?.scenes || [];
    set({ loading: true, loadingMsg: 'Generando imágenes de las escenas...', error: '' });
    const results = [];
    for (const scene of scenes.slice(0, 3)) {
      try {
        const res = await generateImage({ prompt: scene.image_prompt, size: 'portrait_16_9' });
        results.push({ url: res.data.image_url, description: scene.description });
      } catch {
        results.push({ url: null, description: scene.description });
      }
    }
    set({ images: results, imagesDone: true, step: STEP.IMAGES, loading: false, loadingMsg: '' });
  }

  /* ── PASO 3: Generar video ── */
  async function runVideo() {
    set({ loading: true, loadingMsg: 'Generando video con IA (puede tardar 3-5 min)...', error: '', step: STEP.VIDEO });
    try {
      const prompt = s.script?.hook || s.script?.title || s.category;
      const image_url = s.images.find(i => i.url)?.url;
      const res = await generateVideo({ prompt, image_url, duration: 5 });
      const videoUrl = res.data.result?.video?.url || res.data.result?.video_url || null;
      set({ video: videoUrl, loading: false, loadingMsg: '' });
      // Auto-genera caption después del video
      await runCaption(videoUrl);
    } catch (e) {
      set({ error: e.response?.data?.error || 'Error generando video. Intenta de nuevo.', loading: false, loadingMsg: '', step: STEP.IMAGES });
    }
  }

  /* ── PASO 4: Generar caption ── */
  async function runCaption(videoUrl) {
    try {
      const res = await generateCaption({
        title: s.script?.title,
        genre: s.genre,
        category: s.category,
        platform: s.platform,
      });
      setS(prev => ({ ...prev, caption: res.data, video: videoUrl || prev.video, step: STEP.CAPTION, loading: false, loadingMsg: '' }));
    } catch {
      setS(prev => ({ ...prev, step: STEP.CAPTION, loading: false, loadingMsg: '' }));
    }
  }

  async function runCaptionOnly() {
    set({ loading: true, loadingMsg: 'Generando texto de publicación...', error: '' });
    await runCaption(s.video);
  }

  function copyText(text) {
    navigator.clipboard.writeText(text).catch(() => {});
  }

  function reset() { setS(init()); }

  /* ─────────────── RENDER ─────────────── */
  return (
    <div className="pipeline">

      {/* ── PASO 1: Configuración ── */}
      <div className={`step ${s.step === STEP.CONFIG ? 'active' : 'done'}`}>
        <div className="step-header">
          <div className="step-num">{s.step > STEP.CONFIG ? '✓' : '1'}</div>
          <div>
            <div className="step-title">Configurar video</div>
            <div className="step-subtitle">
              {s.script
                ? `${s.platform.toUpperCase()} · ${s.category} · ${s.genre}`
                : 'Plataforma, categoría y género de la historia'}
            </div>
          </div>
          {s.script && <button className="btn btn-ghost btn-sm step-badge" onClick={reset}>Cambiar</button>}
        </div>

        {!s.script && (
          <div className="step-body">
            <div className="form-group">
              <label>Plataforma de publicación</label>
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
              <label>Categoría / Nicho</label>
              <input value={s.category} onChange={e => set({ category: e.target.value, error: '' })}
                placeholder="Ej: fitness, finanzas, cocina, tecnología, deportes..." />
            </div>

            <div className="form-group">
              <label>Género de la historia</label>
              <div className="platform-grid">
                {GENRES.map(g => (
                  <button key={g.id} className={`platform-pill ${s.genre === g.id ? 'active' : ''}`}
                    onClick={() => set({ genre: g.id, error: '' })}>
                    {g.label}
                  </button>
                ))}
              </div>
            </div>

            {s.error && <div className="error-msg">{s.error}</div>}

            <button className="btn btn-primary" onClick={runScript} disabled={s.loading}>
              {s.loading
                ? <><span className="spinner" />{s.loadingMsg}</>
                : '✨ Generar historia'}
            </button>
          </div>
        )}
      </div>

      {/* ── PASO 2: Historia / Guión ── */}
      {s.script && (
        <div className={`step ${s.step === STEP.SCRIPT ? 'active' : 'done'}`}>
          <div className="step-header">
            <div className="step-num">{s.step > STEP.SCRIPT ? '✓' : '2'}</div>
            <div>
              <div className="step-title">Historia generada</div>
              <div className="step-subtitle">{s.script.title}</div>
            </div>
            <span className="step-badge">✅ Lista</span>
          </div>

          <div className="step-body">
            <div className="script-section hook">
              <strong>🎣 Hook — primeros 3 segundos</strong>
              <p>{s.script.hook}</p>
            </div>
            <div className="script-section dev">
              <strong>📖 Historia completa</strong>
              <p>{s.script.story}</p>
            </div>
            {s.script.scenes?.length > 0 && (
              <div className="script-section" style={{ borderLeftColor: '#00b4d8', background: '#f0faff' }}>
                <strong>🎬 Escenas ({s.script.scenes.length})</strong>
                {s.script.scenes.map((sc, i) => (
                  <p key={i} style={{ marginTop: 6 }}><strong>{i + 1}.</strong> {sc.description}</p>
                ))}
              </div>
            )}
            <div className="script-section cta">
              <strong>🚀 CTA</strong>
              <p>{s.script.cta}</p>
            </div>

            {s.step === STEP.SCRIPT && !s.loading && (
              <button className="btn btn-primary" style={{ marginTop: 14 }} onClick={runImages}>
                🖼️ Generar imágenes de las escenas
              </button>
            )}
            {s.loading && s.step === STEP.SCRIPT && (
              <div className="loading-bar" style={{ marginTop: 14 }}>
                <span className="spinner" />{s.loadingMsg}
              </div>
            )}
          </div>
        </div>
      )}

      {/* ── PASO 3: Imágenes ── */}
      {s.imagesDone && (
        <div className={`step ${s.step === STEP.IMAGES ? 'active' : 'done'}`}>
          <div className="step-header">
            <div className="step-num">{s.step > STEP.IMAGES ? '✓' : '3'}</div>
            <div>
              <div className="step-title">Imágenes de escenas</div>
              <div className="step-subtitle">
                {s.images.filter(i => i.url).length} de {s.images.length} generadas
              </div>
            </div>
            {s.step > STEP.IMAGES && <span className="step-badge">✅ Listas</span>}
          </div>

          <div className="step-body">
            {s.images.length > 0 && (
              <div className="image-grid">
                {s.images.map((img, i) => (
                  <div key={i} className="image-card">
                    {img.url
                      ? <img src={img.url} alt={`Escena ${i + 1}`} />
                      : <div style={{ height: 140, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)', fontSize: '0.8rem', padding: 12, textAlign: 'center' }}>
                          No se pudo generar
                        </div>
                    }
                    <div className="image-card-footer" style={{ fontSize: '0.78rem', color: 'var(--text-muted)', padding: '6px 10px' }}>
                      Escena {i + 1}
                      {img.url && <a href={img.url} download className="btn btn-ghost btn-sm" style={{ marginLeft: 'auto', padding: '3px 8px' }}>⬇️</a>}
                    </div>
                  </div>
                ))}
              </div>
            )}

            {s.step === STEP.IMAGES && !s.loading && (
              <button className="btn btn-primary" style={{ marginTop: 16 }} onClick={runVideo}>
                🎬 Generar video
              </button>
            )}
            {s.loading && s.step === STEP.VIDEO && (
              <div className="loading-bar" style={{ marginTop: 14 }}>
                <span className="spinner" />{s.loadingMsg}
              </div>
            )}
            {s.error && s.step === STEP.IMAGES && (
              <div className="error-msg" style={{ marginTop: 12 }}>{s.error}
                <button className="btn btn-ghost btn-sm" style={{ marginLeft: 10 }} onClick={runVideo}>Reintentar</button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Loading mientras genera imágenes */}
      {s.loading && s.step === STEP.SCRIPT && s.loadingMsg.includes('imágenes') && (
        <div className="step active">
          <div className="step-header">
            <div className="step-num">3</div>
            <div><div className="step-title">Imágenes</div></div>
          </div>
          <div className="step-body">
            <div className="loading-bar"><span className="spinner" />{s.loadingMsg}</div>
          </div>
        </div>
      )}

      {/* ── PASO 4: Video ── */}
      {s.video && (
        <div className={`step ${s.step === STEP.CAPTION ? 'done' : 'active'}`}>
          <div className="step-header">
            <div className="step-num">{s.step === STEP.CAPTION ? '✓' : '4'}</div>
            <div><div className="step-title">Video</div><div className="step-subtitle">Generado con IA</div></div>
            <span className="step-badge">✅ Listo</span>
          </div>
          <div className="step-body">
            <div className="video-wrap">
              <video controls><source src={s.video} /></video>
            </div>
            <div style={{ display: 'flex', gap: 8, marginTop: 12 }}>
              <a href={s.video} download className="btn btn-ghost btn-sm">⬇️ Descargar</a>
              <a href={s.video} target="_blank" rel="noreferrer" className="btn btn-ghost btn-sm">🔗 Abrir</a>
            </div>
          </div>
        </div>
      )}

      {/* Loading video */}
      {s.loading && s.step === STEP.VIDEO && !s.video && (
        <div className="step active">
          <div className="step-header">
            <div className="step-num">4</div>
            <div><div className="step-title">Video</div><div className="step-subtitle">Generando...</div></div>
          </div>
          <div className="step-body">
            <div className="loading-bar"><span className="spinner" />{s.loadingMsg}</div>
          </div>
        </div>
      )}

      {/* ── PASO 5: Caption para publicar ── */}
      {s.step === STEP.CAPTION && (
        <div className="step active">
          <div className="step-header">
            <div className="step-num">5</div>
            <div>
              <div className="step-title">Texto para publicar en {s.platform.toUpperCase()}</div>
              <div className="step-subtitle">Copia y pega directamente en la plataforma</div>
            </div>
            <span className="step-badge">✅ Listo</span>
          </div>

          <div className="step-body">
            {s.loading && <div className="loading-bar"><span className="spinner" />Generando texto...</div>}

            {s.caption && (
              <>
                <div className="caption-box">
                  <div className="caption-label">📌 Título de la publicación</div>
                  <div className="caption-text">{s.caption.post_title}</div>
                  <button className="btn btn-ghost btn-sm caption-copy" onClick={() => copyText(s.caption.post_title)}>
                    📋 Copiar
                  </button>
                </div>

                <div className="caption-box">
                  <div className="caption-label">💬 Caption / Descripción</div>
                  <div className="caption-text">{s.caption.caption}</div>
                  <button className="btn btn-ghost btn-sm caption-copy" onClick={() => copyText(s.caption.caption)}>
                    📋 Copiar
                  </button>
                </div>

                <div className="caption-box">
                  <div className="caption-label"># Hashtags</div>
                  <div className="caption-text" style={{ color: 'var(--accent)' }}>{s.caption.hashtags}</div>
                  <button className="btn btn-ghost btn-sm caption-copy" onClick={() => copyText(s.caption.hashtags)}>
                    📋 Copiar
                  </button>
                </div>

                <div className="caption-box" style={{ background: 'linear-gradient(135deg, #f3eeff, #fce7f3)', borderColor: '#d8b4fe' }}>
                  <div className="caption-label">✨ TODO JUNTO — listo para pegar</div>
                  <div className="caption-text" style={{ whiteSpace: 'pre-wrap' }}>{s.caption.full_post}</div>
                  <button className="btn btn-primary btn-sm caption-copy" onClick={() => copyText(s.caption.full_post)}>
                    📋 Copiar todo
                  </button>
                </div>
              </>
            )}

            {!s.caption && !s.loading && (
              <button className="btn btn-ghost" onClick={runCaptionOnly}>🔄 Generar texto de publicación</button>
            )}

            <div style={{ marginTop: 20, paddingTop: 16, borderTop: '2px solid var(--border)' }}>
              <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: 12 }}>
                ¿Crear otro video para otra plataforma con la misma historia?
              </p>
              <div className="platform-grid">
                {PLATFORMS.filter(p => p.id !== s.platform).map(p => (
                  <button key={p.id} className="platform-pill"
                    onClick={() => setS(prev => ({ ...init(), platform: p.id, category: prev.category, genre: prev.genre }))}>
                    {p.label}
                  </button>
                ))}
                <button className="btn btn-ghost btn-sm" onClick={reset}>🔄 Nueva historia</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
