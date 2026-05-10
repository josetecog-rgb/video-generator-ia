const STYLE_SUFFIX = {
  'comic-clasico':   'vintage comic book style, bold black ink outlines, flat colors, Ben-Day dots, Pepo art style, Hergé style, comic panel illustration',
  'pantera-rosa':    'retro 1960s animated cartoon, smooth clean lines, flat pastel colors, DePatie-Freleng style, cartoon illustration',
  'marvel':          'Marvel Comics style, bold dynamic inking, superhero comic book illustration, Jim Lee style, comic panel',
  'anime':           'manga anime style, screen tone shading, bold outlines, Akira Toriyama style, shonen manga panel',
  'pixar':           'Pixar 3D animated movie style, soft rounded features, expressive eyes, Disney Pixar quality render',
  'pop-art':         'Roy Lichtenstein pop art, Ben-Day halftone dots, bold black outlines, primary flat colors, comic illustration',
  'cartoon-network': 'Cartoon Network animated style, bold outlines, exaggerated proportions, bright colors, Adventure Time aesthetic',
  'acuarela':        'watercolor children book illustration, soft brushstrokes, pastel colors, Quentin Blake style',
};

const GENRE_LIGHTING = {
  'Terror':       'dark horror shadows, cold blue moonlight, terrifying ominous atmosphere',
  'Suspenso':     'dramatic noir shadows, high contrast lighting, tense mysterious mood',
  'Acción':       'bright vivid action lighting, dynamic energy, explosive motion blur',
  'Comedia':      'bright cheerful warm lighting, sunny colors, playful fun mood',
  'Romance':      'soft warm golden hour, pink amber glow, tender romantic atmosphere',
  'Drama':        'moody emotional lighting, cinematic atmosphere, dramatic highlights',
  'Motivacional': 'epic golden sunrise lighting, inspirational warm light, triumphant mood',
  'Misterio':     'mysterious cool fog, blue mist atmosphere, enigmatic shadows',
};

const COMPOSITION = [
  'full body establishing shot',
  'medium three-quarter shot',
  'dramatic close-up reveal shot',
];

function buildImagePrompt({ sceneDescription, genre, style = 'comic-clasico', protagonistVisualDescription = '', action = '', sceneIndex = 0 }) {
  const styleStr    = STYLE_SUFFIX[style]          || STYLE_SUFFIX['comic-clasico'];
  const lightingStr = GENRE_LIGHTING[genre]        || GENRE_LIGHTING['Drama'];
  const composStr   = COMPOSITION[sceneIndex % 3];

  // El protagonista va AL INICIO — FLUX le da más peso a los tokens iniciales
  // Formato: "character description, doing action, in scene environment"
  let subjectLine;
  if (protagonistVisualDescription) {
    const act = action || sceneDescription;
    subjectLine = `${protagonistVisualDescription}, ${act}`;
  } else {
    subjectLine = action || sceneDescription;
  }

  const parts = [
    subjectLine,          // 1. SUJETO (protagonista + acción)
    sceneDescription,     // 2. AMBIENTE de la escena
    styleStr,             // 3. ESTILO artístico
    composStr,            // 4. COMPOSICIÓN
    lightingStr,          // 5. ILUMINACIÓN / MOOD del género
    'masterpiece, best quality, highly detailed, sharp lines, professional illustration',
  ];

  return parts.filter(Boolean).join(', ');
}

module.exports = { buildImagePrompt, STYLE_SUFFIX };
