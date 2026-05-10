// Estructura basada en fiddl.art: Sujeto → Estilo → Iluminación → Atmósfera → Specs técnicos

const STYLE_PRESETS = {
  'comic-clasico': {
    style:   'vintage Latin American comic book illustration, bold black ink outlines, Ben-Day dots, flat vibrant colors, Pepo art style, Hergé ligne claire technique, comic panel border',
    quality: 'masterpiece, best quality, ultra-detailed, sharp crisp lines, professional comic book art',
  },
  'pantera-rosa': {
    style:   'retro 1960s animated cartoon illustration, smooth clean ink lines, flat pastel colors, DePatie-Freleng animation style, minimal background, elegant stylized character design',
    quality: 'masterpiece, best quality, clean vector-like illustration, sharp outlines, professional animation art',
  },
  'marvel': {
    style:   'Marvel Comics superhero illustration, bold dynamic inking, Jim Lee style, Neal Adams style, detailed musculature, comic book panel art, action pose',
    quality: 'masterpiece, best quality, ultra-detailed, sharp professional comic book illustration, award winning comic art',
  },
  'anime': {
    style:   'manga anime illustration, screen tone shading, bold clean outlines, Akira Toriyama style, shonen manga aesthetic, expressive large eyes, detailed hair strands',
    quality: 'masterpiece, best quality, ultra-detailed, sharp manga lines, professional anime concept art',
  },
  'pixar': {
    style:   'Pixar 3D animated movie style, soft rounded features, large expressive eyes, subsurface skin scattering, Disney Pixar quality render, smooth gradients',
    quality: 'masterpiece, best quality, ultra-detailed, Renderman quality, professional 3D animation render, 8k resolution',
  },
  'pop-art': {
    style:   'Roy Lichtenstein pop art comic illustration, Ben-Day halftone dots pattern, bold black outlines, primary flat colors, speech bubble aesthetic, retro commercial graphic design',
    quality: 'masterpiece, best quality, ultra-detailed, sharp graphic design, professional pop art illustration',
  },
  'cartoon-network': {
    style:   'Cartoon Network animated series style, bold thick outlines, exaggerated cartoon proportions, bright saturated flat colors, Adventure Time aesthetic, modern cartoon character design',
    quality: 'masterpiece, best quality, ultra-detailed, sharp cartoon illustration, professional animation art',
  },
  'acuarela': {
    style:   'children book watercolor illustration, soft wet brushstrokes, warm pastel color palette, Quentin Blake loose style, Eric Carle textured paper aesthetic, whimsical storybook art',
    quality: 'masterpiece, best quality, ultra-detailed, beautiful watercolor texture, professional children book illustration',
  },
};

const GENRE_LIGHTING = {
  'Terror':       'cold blue moonlight casting deep shadows, dramatic horror rim lighting, ominous dark background, chilling atmosphere',
  'Suspenso':     'dramatic chiaroscuro side lighting, high contrast noir shadows, tense mysterious atmosphere, suspenseful mood',
  'Acción':       'dynamic bright action lighting, vivid saturated colors, explosive energy, cinematic action atmosphere',
  'Comedia':      'bright warm cheerful lighting, sunny soft fill light, playful joyful atmosphere, lighthearted fun mood',
  'Romance':      'soft warm golden hour backlighting, gentle pink amber glow, romantic dreamy bokeh atmosphere, tender intimate mood',
  'Drama':        'moody naturalistic window light, emotional cinematic atmosphere, deep shadows and warm highlights, dramatic',
  'Motivacional': 'epic golden sunrise backlighting, inspirational warm rays, triumphant uplifting atmosphere, heroic cinematic mood',
  'Misterio':     'cool mysterious fog lighting, soft blue mist atmosphere, enigmatic purple shadows, curious uncanny mood',
};

const SHOT_TYPES = [
  'full body establishing shot, centered composition',
  'medium three-quarter shot, slight low angle',
  'dramatic close-up portrait shot, shallow depth of field',
];

function buildImagePrompt({ sceneDescription, genre, style = 'comic-clasico', protagonistVisualDescription = '', action = '', sceneIndex = 0 }) {
  const preset      = STYLE_PRESETS[style]        || STYLE_PRESETS['comic-clasico'];
  const lighting    = GENRE_LIGHTING[genre]       || GENRE_LIGHTING['Drama'];
  const shotType    = SHOT_TYPES[sceneIndex % 3];

  // SUJETO PRIMERO — el protagonista con acción específica (mayor peso en FLUX)
  const subject = protagonistVisualDescription
    ? `${protagonistVisualDescription}, ${action || sceneDescription}`
    : action || sceneDescription;

  // Fórmula: Sujeto → Ambiente → Estilo → Composición → Iluminación → Atmósfera → Quality
  const parts = [
    subject,           // 1. Quién + qué hace
    sceneDescription,  // 2. Dónde / ambiente
    preset.style,      // 3. Estilo artístico
    shotType,          // 4. Composición / encuadre
    lighting,          // 5. Iluminación + atmósfera del género
    preset.quality,    // 6. Specs de calidad
  ];

  return parts.filter(Boolean).join(', ');
}

module.exports = { buildImagePrompt, STYLE_PRESETS };
