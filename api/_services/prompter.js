// Estructura correcta para FLUX según investigación:
// [SUJETO + ACCIÓN] → [AMBIENTE] → [ESTILO ARTÍSTICO] → [COMPOSICIÓN] → [ILUMINACIÓN] → [PALETA] → [MOOD] → [CALIDAD]
// El SUJETO siempre primero — FLUX le da más peso a los primeros tokens

const STYLE_SUFFIX = {
  'comic-clasico':   'vintage comic book style, bold black ink outlines, flat colors, Ben-Day dots, Pepo Perez art style, Hergé style, comic panel illustration',
  'pantera-rosa':    'retro 1960s animated cartoon style, smooth clean lines, vibrant flat pastel colors, DePatie-Freleng animation style, cartoon illustration',
  'marvel':          'Marvel Comics style, bold dynamic inking, dramatic superhero comic book illustration, Jim Lee style, Neal Adams style, comic book panel',
  'anime':           'manga anime illustration, screen tone shading, bold outlines, Akira Toriyama style, shonen manga comic panel, anime art',
  'pixar':           'Pixar 3D animated movie style, soft rounded features, expressive eyes, subsurface scattering, Disney Pixar quality, 3D render cartoon',
  'pop-art':         'Roy Lichtenstein pop art style, Ben-Day halftone dots, bold black outlines, primary flat colors, pop art comic illustration',
  'cartoon-network': 'Cartoon Network animated style, bold outlines, exaggerated proportions, bright saturated colors, Adventure Time aesthetic, cartoon illustration',
  'acuarela':        'children book watercolor illustration, soft brushstrokes, pastel warm colors, Quentin Blake style, storybook illustration',
};

const GENRE_LIGHTING = {
  'Terror':       'dramatic rim lighting, deep shadows, cold blue moonlight, horror atmosphere, ominous dark background',
  'Suspenso':     'dramatic chiaroscuro lighting, high contrast shadows, tense noir atmosphere, suspenseful mood',
  'Acción':       'dynamic action lighting, bright vivid colors, energetic explosive composition, action movie lighting',
  'Comedia':      'bright cheerful lighting, warm sunny colors, playful joyful atmosphere, light-hearted fun mood',
  'Romance':      'soft warm golden hour lighting, gentle pink and amber tones, romantic dreamy atmosphere, tender mood',
  'Drama':        'moody naturalistic lighting, emotional cinematic atmosphere, deep shadows and warm highlights',
  'Motivacional': 'epic golden hour lighting, inspirational warm sunlight, triumphant uplifting atmosphere, heroic mood',
  'Misterio':     'mysterious cool blue lighting, soft fog and mist, enigmatic shadowy atmosphere, curious mood',
};

const COMPOSITION = {
  0: 'full body shot, establishing composition, character centered',
  1: 'medium shot, three-quarter view, expressive face visible',
  2: 'dramatic close-up or wide reveal shot, climax composition',
};

function buildImagePrompt({ sceneDescription, genre, style = 'comic-clasico', protagonistVisualDescription = '', action = '', sceneIndex = 0 }) {
  const styleStr     = STYLE_SUFFIX[style]     || STYLE_SUFFIX['comic-clasico'];
  const lightingStr  = GENRE_LIGHTING[genre]   || GENRE_LIGHTING['Drama'];
  const composStr    = COMPOSITION[sceneIndex] || COMPOSITION[0];

  // SUJETO primero — el protagonista con su descripción visual exacta + acción en la escena
  const subject = protagonistVisualDescription
    ? `${protagonistVisualDescription}, ${action || sceneDescription}`
    : action || sceneDescription;

  // Estructura FLUX correcta: Sujeto → Ambiente → Estilo → Composición → Iluminación → Calidad
  const parts = [
    subject,
    sceneDescription,
    styleStr,
    composStr,
    lightingStr,
    'masterpiece, best quality, highly detailed, sharp focus, professional illustration',
  ];

  return parts.filter(Boolean).join(', ');
}

module.exports = { buildImagePrompt, STYLE_SUFFIX };
