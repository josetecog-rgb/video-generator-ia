import React, { useState, useRef } from 'react';
import { generateScript, generateImage, generateVideo, generateCaption, uploadImage } from '../api';

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

const STYLES = [
  { id: 'comic-clasico',   label: '📚 Cómic Clásico',    desc: 'Estilo Condorito' },
  { id: 'pantera-rosa',    label: '🎭 Caricatura Retro',  desc: 'Estilo Pantera Rosa' },
  { id: 'marvel',          label: '🦸 Marvel / DC',       desc: 'Superhéroes americano' },
  { id: 'anime',           label: '🌸 Manga / Anime',     desc: 'Estilo Dragon Ball' },
  { id: 'pixar',           label: '🎬 Pixar / Disney',    desc: 'Animación 3D' },
  { id: 'pop-art',         label: '🎨 Pop Art',           desc: 'Roy Lichtenstein' },
  { id: 'cartoon-network', label: '📺 Cartoon Network',   desc: 'Adventure Time' },
  { id: 'acuarela',        label: '🖌️ Acuarela',         desc: 'Cuento infantil' },
];

const STEP = { CONFIG: 0, SCRIPT: 1, IMAGES: 2, VIDEO: 3, CAPTION: 4 };

const init = () => ({
  platform: '', category: '', genre: '', style: 'comic-clasico',
  protagonistDesc: '', protagonistImageUrl: null, protagonistPreview: null,
  script: null, images: [], imagesDone: false,
  video: null, caption: null,
  step: STEP.CONFIG, loading: false, loadingMsg: '', error: '',
});

export default function Pipeline() {
  const [s, setS] = useState(init());
  const set = (p) => setS(prev => ({ ...prev, ...p }));
  const fileRef = useRef();

  /* ── Upload imagen protagonista ── */
  async function handleImageUpload(e) {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = async (ev) => {
      const base64 = ev.target.result;
      set({ protagonistPreview: base64, loadingMsg: 'Subiendo imagen...', loading: true });
      try {
        const res = await uploadImage({ image: base64 });
        set({ protagonistImageUrl: res.data.url, loading: false, loadingMsg: '' });
      } catch {
        set({ loading: false, loadingMsg: '', protagonistImageUrl: null });
      }
    };
    reader.readAsDataURL(file);
  }

  /* ── PASO 1: Generar historia ── */
  async function runScript() {
    if (!s.platform) return set({ error: 'Elige una plataforma' });
    if (!s.category.trim()) return set({ error: 'Escribe la categoría' });
    if (!s.genre) return set({ error: 'Elige un género' });
    set({ loading: true, loadingMsg: 'Escribiendo la historia...', error: '', script: null, images: [], imagesDone: false, video: null, caption: null });
    try {
      const res = await generateScript({ category: s.category, genre: s.genre, platform: s.platform, protagonistDescription: s.protagonistDesc || '' });
      set({ script: res.data.script, step: STEP.SCRIPT, loading: false, loadingMsg: '' });
    } catch (e) {
      set({ error: e.response?.data?.error || 'Error generando historia', loading: false, loadingMsg: '' });
    }
  }

  /* ── PASO 2: Generar imágenes con estilo y protagonista ── */
  async function runImages() {
    const scenes = s.script?.scenes || [];
    const total = Math.min(scenes.length, 3);
    set({ loading: true, loadingMsg: `Generando imagen 1 de ${total}...`, error: '', images: [] });
    const results = [];
    for (let i = 0; i < total; i++) {
      set({ loadingMsg: `Generando imagen ${i + 1} de ${total} — puede tardar 20s...` });
      // Delay entre imágenes — Together AI free tiene rate limit estricto
      if (i > 0) await new Promise(r => setTimeout(r, 8000));
      let success = false;
      for (let attempt = 1; attempt <= 2; attempt++) {
        try {
          const res = await generateImage({
            sceneDescription: scenes[i].description,
            action: scenes[i].action || '',
            genre: s.genre,
            style: s.style,
            protagonistVisualDescription: s.script?.protagonist_visual_description || s.protagonistDesc || '',
            sceneIndex: i,
            size: 'portrait_16_9',
          });
          results.push({ url: res.data.image_url, prompt: res.data.prompt_used, description: scenes[i].description });
          success = true;
          break;
        } catch (e) {
          if (attempt < 2) {
            set({ loadingMsg: `Reintentando imagen ${i + 1}...` });
            await new Promise(r => setTimeout(r, 5000));
          }
        }
      }
      if (!success) results.push({ url: null, description: scenes[i].description });
      setS(prev => ({ ...prev, images: [...results] }));
    }
    set({ imagesDone: true, step: STEP.IMAGES, loading: false, loadingMsg: '' });
  }

  /* ── PASO 3: Generar video ── */
  async function runVideo() {
    set({ loading: true, loadingMsg: 'Generando video con IA (3-5 min)...', error: '', step: STEP.VIDEO });
    try {
      const prompt = s.script?.hook || s.script?.title || s.category;
      const image_url = s.images.find(i => i.url)?.url;
      const res = await generateVideo({ prompt, image_url, duration: 5 });
      const videoUrl = res.data.video_url || null;
      set({ video: videoUrl, loading: false, loadingMsg: '' });
      await runCaption(videoUrl);
    } catch (e) {
      set({ error: e.response?.data?.error || e.message || 'Error generando video.', loading: false, loadingMsg: '', step: STEP.IMAGES });
    }
  }

  /* ── PASO 4: Caption ── */
  async function runCaption(videoUrl) {
    try {
      const res = await generateCaption({ title: s.script?.title, genre: s.genre, category: s.category, platform: s.platform });
      setS(prev => ({ ...prev, caption: res.data, video: videoUrl || prev.video, step: STEP.CAPTION, loading: false, loadingMsg: '' }));
    } catch {
      setS(prev => ({ ...prev, step: STEP.CAPTION, loading: false, loadingMsg: '' }));
    }
  }

  function copyText(text) { navigator.clipboard.writeText(text).catch(() => {}); }
  function reset() { setS(init()); }

  return (
    <div className="pipeline">

      {/* ── CONFIG ── */}
      <div className={`step ${s.step === STEP.CONFIG ? 'active' : 'done'}`}>
        <div className="step-header">
          <div className="step-num">{s.step > STEP.CONFIG ? '✓' : '1'}</div>
          <div>
            <div className="step-title">Configurar video</div>
            <div className="step-subtitle">
              {s.script ? `${s.platform.toUpperCase()} · ${s.category} · ${s.genre} · ${STYLES.find(st=>st.id===s.style)?.label}` : 'Plataforma, género, estilo y protagonista'}
            </div>
          </div>
          {s.script && <button className="btn btn-ghost btn-sm step-badge" onClick={reset}>Cambiar</button>}
        </div>

        {!s.script && (
          <div className="step-body">
            {/* Plataforma */}
            <div className="form-group">
              <label>Plataforma de publicación</label>
              <div className="platform-grid">
                {PLATFORMS.map(p => (
                  <button key={p.id} className={`platform-pill ${s.platform === p.id ? 'active' : ''}`}
                    onClick={() => set({ platform: p.id, error: '' })}>{p.label}</button>
                ))}
              </div>
            </div>

            {/* Categoría */}
            <div className="form-group">
              <label>Categoría / Nicho</label>
              <input value={s.category} onChange={e => set({ category: e.target.value, error: '' })}
                placeholder="Ej: fitness, finanzas, cocina, tecnología..." />
            </div>

            {/* Género */}
            <div className="form-group">
              <label>Género de la historia</label>
              <div className="platform-grid">
                {GENRES.map(g => (
                  <button key={g.id} className={`platform-pill ${s.genre === g.id ? 'active' : ''}`}
                    onClick={() => set({ genre: g.id, error: '' })}>{g.label}</button>
                ))}
              </div>
            </div>

            {/* Estilo visual */}
            <div className="form-group">
              <label>Estilo visual de las imágenes</label>
              <div className="style-grid">
                {STYLES.map(st => (
                  <button key={st.id} className={`style-card ${s.style === st.id ? 'active' : ''}`}
                    onClick={() => set({ style: st.id })}>
                    <span className="style-icon">{st.label.split(' ')[0]}</span>
                    <span className="style-name">{st.label.split(' ').slice(1).join(' ')}</span>
                    <span className="style-desc">{st.desc}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Protagonista */}
            <div className="protagonist-box">
              <div className="protagonist-title">🧑 Protagonista (opcional)</div>
              <div className="protagonist-inner">
                <div className="protagonist-upload" onClick={() => fileRef.current.click()}>
                  {s.protagonistPreview
                    ? <img src={s.protagonistPreview} alt="protagonista" style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: 10 }} />
                    : <>
                        <span style={{ fontSize: '2rem' }}>📷</span>
                        <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginTop: 4 }}>Subir foto</span>
                      </>
                  }
                  <input ref={fileRef} type="file" accept="image/*" style={{ display: 'none' }} onChange={handleImageUpload} />
                </div>
                <div style={{ flex: 1 }}>
                  <div className="form-group" style={{ marginBottom: 0 }}>
                    <label>Descripción del personaje</label>
                    <textarea value={s.protagonistDesc} onChange={e => set({ protagonistDesc: e.target.value })}
                      placeholder="Ej: hombre joven de 30 años, cabello negro, ropa deportiva roja, expresión seria..."
                      style={{ minHeight: 80 }} />
                  </div>
                  {s.protagonistImageUrl && (
                    <p style={{ fontSize: '0.75rem', color: 'var(--success)', marginTop: 6 }}>✅ Imagen subida — se usará como referencia visual</p>
                  )}
                </div>
              </div>
            </div>

            {s.error && <div className="error-msg">{s.error}</div>}
            <button className="btn btn-primary" style={{ marginTop: 16 }} onClick={runScript} disabled={s.loading}>
              {s.loading ? <><span className="spinner" />{s.loadingMsg}</> : '✨ Generar historia'}
            </button>
          </div>
        )}
      </div>

      {/* ── GUIÓN ── */}
      {s.script && (
        <div className={`step ${s.step === STEP.SCRIPT ? 'active' : 'done'}`}>
          <div className="step-header">
            <div className="step-num">{s.step > STEP.SCRIPT ? '✓' : '2'}</div>
            <div><div className="step-title">Historia generada</div><div className="step-subtitle">{s.script.title}</div></div>
            <span className="step-badge">✅ Lista</span>
          </div>
          <div className="step-body">
            <div className="script-section hook"><strong>🎣 Hook</strong><p>{s.script.hook}</p></div>
            <div className="script-section dev"><strong>📖 Historia</strong><p>{s.script.story}</p></div>
            {s.script.scenes?.length > 0 && (
              <div className="script-section" style={{ borderLeftColor: '#00b4d8', background: '#f0faff' }}>
                <strong>🎬 {s.script.scenes.length} Escenas</strong>
                {s.script.scenes.map((sc, i) => <p key={i} style={{ marginTop: 6 }}><strong>{i+1}.</strong> {sc.description}</p>)}
              </div>
            )}
            {s.script.protagonist_visual_description && (
              <div className="script-section" style={{ borderLeftColor: '#e91e8c', background: '#fff0f8' }}>
                <strong>🧑 Protagonista (descripción visual para imágenes)</strong>
                <p style={{ fontFamily: 'monospace', fontSize: '0.82rem', color: '#666' }}>{s.script.protagonist_visual_description}</p>
              </div>
            )}
            <div className="script-section cta"><strong>🚀 CTA</strong><p>{s.script.cta}</p></div>
            {s.step === STEP.SCRIPT && !s.loading && (
              <button className="btn btn-primary" style={{ marginTop: 14 }} onClick={runImages}>
                🖼️ Generar imágenes estilo {STYLES.find(st=>st.id===s.style)?.label}
              </button>
            )}
            {s.loading && <div className="loading-bar" style={{ marginTop: 14 }}><span className="spinner" />{s.loadingMsg}</div>}
          </div>
        </div>
      )}

      {/* ── IMÁGENES (se van mostrando en tiempo real) ── */}
      {(s.images.length > 0 || (s.loading && s.loadingMsg.includes('imagen'))) && (
        <div className={`step ${s.imagesDone && s.images.length > 0 ? 'done' : 'active'}`}>
          <div className="step-header">
            <div className="step-num">{s.imagesDone && s.images.length > 0 ? '✓' : '3'}</div>
            <div>
              <div className="step-title">Imágenes — {STYLES.find(st=>st.id===s.style)?.label}</div>
              <div className="step-subtitle">
                {s.loading ? s.loadingMsg : `${s.images.filter(i=>i.url).length} de ${s.images.length} generadas`}
              </div>
            </div>
            {s.imagesDone && s.images.length > 0 && <span className="step-badge">✅ {s.images.filter(i=>i.url).length} imágenes</span>}
          </div>
          <div className="step-body">
            {s.loading && <div className="loading-bar"><span className="spinner" />{s.loadingMsg}</div>}
            <div className="image-grid">
              {s.images.map((img, i) => (
                <div key={i} className="image-card">
                  {img.url
                    ? <img src={img.url} alt={`Escena ${i+1}`} />
                    : <div style={{ height: 160, display:'flex', alignItems:'center', justifyContent:'center', fontSize:'0.8rem', color:'var(--text-muted)', padding:12, textAlign:'center' }}>
                        ❌ No se pudo generar
                      </div>
                  }
                  <div className="image-card-footer">
                    <span style={{ fontSize:'0.75rem', color:'var(--text-muted)' }}>Escena {i+1}</span>
                    {img.url && <a href={img.url} download className="btn btn-ghost btn-sm" style={{ marginLeft:'auto', padding:'3px 8px' }}>⬇️</a>}
                  </div>
                  {img.prompt && (
                    <div style={{ padding:'6px 10px', fontSize:'0.7rem', color:'var(--text-muted)', borderTop:'1px solid var(--border)', background:'#fafafa' }}>
                      <strong>Prompt:</strong> {img.prompt.slice(0, 100)}...
                    </div>
                  )}
                </div>
              ))}
            </div>
            {s.imagesDone && s.step === STEP.IMAGES && !s.loading && (
              <button className="btn btn-primary" style={{ marginTop: 16 }} onClick={runVideo}>🎬 Generar video</button>
            )}
            {s.error && s.step === STEP.IMAGES && (
              <div className="error-msg" style={{ marginTop: 12 }}>
                {s.error}
                <button className="btn btn-ghost btn-sm" style={{ marginLeft: 10 }} onClick={runVideo}>Reintentar</button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ── VIDEO ── */}
      {s.step >= STEP.VIDEO && (
        <div className={`step ${s.video ? 'done' : 'active'}`}>
          <div className="step-header">
            <div className="step-num">{s.video ? '✓' : '4'}</div>
            <div><div className="step-title">Video</div><div className="step-subtitle">{s.video ? 'Generado' : s.loadingMsg}</div></div>
            {s.video && <span className="step-badge">✅ Listo</span>}
          </div>
          {s.loading && !s.video && <div className="step-body"><div className="loading-bar"><span className="spinner" />{s.loadingMsg}</div></div>}
          {s.video && (
            <div className="step-body">
              <div className="video-wrap"><video controls><source src={s.video} /></video></div>
              <div style={{ display:'flex', gap:8, marginTop:12 }}>
                <a href={s.video} download className="btn btn-ghost btn-sm">⬇️ Descargar</a>
                <a href={s.video} target="_blank" rel="noreferrer" className="btn btn-ghost btn-sm">🔗 Abrir</a>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ── CAPTION ── */}
      {s.step === STEP.CAPTION && (
        <div className="step active">
          <div className="step-header">
            <div className="step-num">5</div>
            <div><div className="step-title">Texto para publicar en {s.platform.toUpperCase()}</div><div className="step-subtitle">Copia y pega directo</div></div>
            <span className="step-badge">✅ Listo</span>
          </div>
          <div className="step-body">
            {s.caption && (
              <>
                {[
                  { label: '📌 Título', key: 'post_title' },
                  { label: '💬 Caption', key: 'caption' },
                  { label: '# Hashtags', key: 'hashtags' },
                ].map(({ label, key }) => s.caption[key] && (
                  <div key={key} className="caption-box">
                    <div className="caption-label">{label}</div>
                    <div className="caption-text" style={key==='hashtags'?{color:'var(--accent)'}:{}}>{s.caption[key]}</div>
                    <button className="btn btn-ghost btn-sm caption-copy" onClick={() => copyText(s.caption[key])}>📋 Copiar</button>
                  </div>
                ))}
                {s.caption.full_post && (
                  <div className="caption-box" style={{ background:'linear-gradient(135deg,#f3eeff,#fce7f3)', borderColor:'#d8b4fe' }}>
                    <div className="caption-label">✨ TODO JUNTO</div>
                    <div className="caption-text" style={{ whiteSpace:'pre-wrap' }}>{s.caption.full_post}</div>
                    <button className="btn btn-primary btn-sm caption-copy" onClick={() => copyText(s.caption.full_post)}>📋 Copiar todo</button>
                  </div>
                )}
              </>
            )}
            <div style={{ marginTop:20, paddingTop:16, borderTop:'2px solid var(--border)' }}>
              <p style={{ fontSize:'0.85rem', color:'var(--text-muted)', marginBottom:12 }}>¿Repetir para otra plataforma?</p>
              <div className="platform-grid">
                {PLATFORMS.filter(p => p.id !== s.platform).map(p => (
                  <button key={p.id} className="platform-pill"
                    onClick={() => setS(prev => ({ ...init(), platform: p.id, category: prev.category, genre: prev.genre, style: prev.style, protagonistDesc: prev.protagonistDesc, protagonistImageUrl: prev.protagonistImageUrl, protagonistPreview: prev.protagonistPreview }))}>
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
