// Construye el prompt DIRECTAMENTE sin llamar a DeepSeek
// El género va PRIMERO porque FLUX le da más peso a los tokens iniciales

const STYLE_PRESETS = {
  'comic-clasico':   'classic Latin American comic book style, bold black ink outlines, flat colors, Ben-Day dots, vintage comic panels, Pepo art style, expressive cartoon faces',
  'pantera-rosa':    'retro animated cartoon style, smooth clean lines, vibrant flat colors, 1960s animation style, whimsical minimalist backgrounds, elegant stylized characters, pastel tones',
  'marvel':          'Marvel Comics superhero style, dynamic poses, bold inking, dramatic lighting, detailed comic book panels, American comic style',
  'anime':           'manga anime art style, screen tone shading, dynamic action lines, large expressive eyes, detailed hair, shonen manga by Akira Toriyama',
  'pixar':           '3D animated Pixar movie style, soft rounded features, large expressive eyes, subsurface skin scattering, vibrant saturated colors, Disney Pixar quality render',
  'pop-art':         'Roy Lichtenstein pop art style, Ben-Day halftone dots, bold black outlines, primary flat colors, retro comic strip graphic design',
  'cartoon-network': 'modern Cartoon Network animated style, bold thick outlines, exaggerated proportions, bright saturated colors, flat shading, Adventure Time aesthetic',
  'acuarela':        'children book watercolor illustration style, soft brushstrokes, pastel warm colors, gentle textures, whimsical charming characters, Quentin Blake style',
};

const GENRE_MOOD = {
  'Terror':       'dark horror atmosphere, ominous threatening shadows, terrified expressions, cold desaturated tones, spine-chilling scene',
  'Suspenso':     'tense suspenseful atmosphere, dramatic high contrast shadows, nervous anxious expressions, noir thriller mood',
  'Acción':       'explosive dynamic action scene, motion energy, intense powerful expressions, adrenaline rush, vivid bright colors',
  'Comedia':      'funny cheerful scene, exaggerated comic expressions, bright warm colors, playful joyful mood, humor visual gags',
  'Romance':      'warm romantic tender scene, soft golden lighting, loving sweet expressions, gentle pastel colors, heartwarming mood',
  'Drama':        'emotional dramatic scene, deep feelings, intense sorrowful or determined expression, naturalistic moody lighting',
  'Motivacional': 'inspiring epic triumphant scene, golden hour warm light, powerful confident expression, uplifting heroic mood',
  'Misterio':     'mysterious enigmatic atmosphere, soft fog, curious puzzled expressions, cool blue tones, intriguing strange scene',
};

const ARTIST_REF = {
  'comic-clasico':   'by Pepo, by Hergé, comic strip aesthetic, high contrast',
  'pantera-rosa':    'retro cartoon animation, DePatie-Freleng style, limited color palette',
  'marvel':          'by Jim Lee, by Jack Kirby, by Neal Adams',
  'anime':           'by Akira Toriyama, by CLAMP, Shueisha publication quality',
  'pixar':           'Pixar Animation Studios, Renderman quality, 3D render',
  'pop-art':         'by Roy Lichtenstein, by Andy Warhol, pop art movement',
  'cartoon-network': 'Cartoon Network style, modern animated series',
  'acuarela':        'by Quentin Blake, by Eric Carle, storybook illustration',
};

function buildImagePrompt({ sceneDescription, genre, style = 'comic-clasico', protagonistDescription = '' }) {
  const mood    = GENRE_MOOD[genre]        || 'dramatic scene';
  const artStyle = STYLE_PRESETS[style]    || STYLE_PRESETS['comic-clasico'];
  const artist   = ARTIST_REF[style]       || '';

  // El protagonista se inyecta LITERALMENTE como sujeto principal
  const protagonist = protagonistDescription
    ? protagonistDescription.trim()
    : 'main character';

  // Estructura: GÉNERO primero → ESTILO → PROTAGONISTA (quién es + qué hace en la escena) → ESCENA → ARTISTA → CALIDAD
  const parts = [
    mood,
    artStyle,
    `${protagonist}, ${sceneDescription}`,
    artist,
    'full body shot, dramatic composition',
    'masterpiece, best quality, highly detailed, sharp focus, ultra detailed',
  ];

  return parts.filter(Boolean).join(', ');
}

module.exports = { buildImagePrompt, STYLE_PRESETS };
