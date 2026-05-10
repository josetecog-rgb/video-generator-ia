const { chat } = require('./deepseek');

const STYLE_PRESETS = {
  'comic-clasico': {
    label: 'Cómic Clásico (Condorito)',
    base: 'classic Latin American comic book style, bold black ink outlines, flat vibrant colors, Ben-Day dots, vintage comic panels, expressive cartoon faces, Pepo art style, high contrast black and white with spot colors',
    artist: 'by Pepo, by Hergé, classic comic strip aesthetic',
  },
  'pantera-rosa': {
    label: 'Caricatura (Pantera Rosa)',
    base: 'animated cartoon style, smooth clean lines, vibrant flat colors, 1960s DePatie-Freleng animation style, whimsical minimalist backgrounds, pastel pink tones, elegant long limbs, stylized cartoon characters',
    artist: 'Pink Panther cartoon style, retro animation aesthetic, limited color palette',
  },
  'marvel': {
    label: 'Marvel / DC Comics',
    base: 'Marvel Comics superhero style, dynamic action poses, bold inking, dramatic lighting, detailed musculature, comic book panels, intense expressions',
    artist: 'by Jim Lee, by Jack Kirby, by Neal Adams, American comic book style',
  },
  'anime': {
    label: 'Manga / Anime',
    base: 'detailed manga comic style, anime art, screen tone shading, dynamic action lines, large expressive eyes, detailed hair, dramatic poses, black and white with selective color',
    artist: 'by Akira Toriyama, by CLAMP, shonen manga style, Shueisha publication quality',
  },
  'pixar': {
    label: 'Pixar / Disney 3D',
    base: '3D animated movie style, Pixar quality rendering, soft rounded features, large expressive eyes, subsurface skin scattering, vibrant saturated colors, cinematic lighting',
    artist: 'Pixar Animation Studios style, Disney quality, 3D render, Renderman quality',
  },
  'pop-art': {
    label: 'Pop Art (Warhol)',
    base: 'Roy Lichtenstein pop art comic style, Ben-Day halftone dots, bold black outlines, primary flat colors, speech bubbles, retro comic strip, high contrast, graphic design aesthetic',
    artist: 'by Roy Lichtenstein, by Andy Warhol, American pop art movement',
  },
  'cartoon-network': {
    label: 'Cartoon Network',
    base: 'modern cartoon style, bold thick outlines, exaggerated proportions, bright saturated colors, flat shading with simple shadows, fun character design, geometric shapes',
    artist: 'Cartoon Network style, Adventure Time aesthetic, modern animated series quality',
  },
  'acuarela': {
    label: 'Acuarela Infantil',
    base: 'children book illustration watercolor style, soft brushstrokes, pastel warm colors, gentle textures, whimsical charming characters, loose expressive painting',
    artist: 'by Quentin Blake, by Eric Carle, children illustration style, storybook quality',
  },
};

async function optimizeImagePrompt({ sceneDescription, genre, style = 'comic-clasico', protagonistDescription = '' }) {
  const preset = STYLE_PRESETS[style] || STYLE_PRESETS['comic-clasico'];

  const genreAtmosphere = {
    'Terror':       'dark ominous atmosphere, horror mood, shadows, fear expression',
    'Suspenso':     'tense dramatic atmosphere, suspense, mysterious shadows',
    'Acción':       'dynamic explosive action, motion lines, intense energy',
    'Comedia':      'funny exaggerated expressions, comedy visual gags, cheerful',
    'Romance':      'warm romantic atmosphere, soft glowing light, tender expressions',
    'Drama':        'emotional dramatic scene, deep feelings, intense expressions',
    'Motivacional': 'inspiring epic scene, triumphant mood, powerful composition',
    'Misterio':     'mysterious eerie atmosphere, fog, question marks, shadows',
  };

  const atmosphere = genreAtmosphere[genre] || 'dramatic scene';
  const protagonistNote = protagonistDescription
    ? `The main character is: ${protagonistDescription}. Keep this character consistent.`
    : '';

  const prompt = `You are a world-class AI image prompt engineer specializing in comic and animation styles.

Create ONE optimized image prompt in English for this scene:
Scene: "${sceneDescription}"
Art Style: ${preset.label}
Genre atmosphere: ${atmosphere}
${protagonistNote}

Follow this EXACT structure separated by commas:
1. ART STYLE: "${preset.base}"
2. MAIN SUBJECT: [specific character description with action, expression, clothing, pose - very detailed]
3. BACKGROUND SCENE: [detailed environment matching the scene]
4. ARTIST REFERENCE: "${preset.artist}"
5. COMPOSITION: [panel layout, camera angle - e.g. "full body shot", "close-up face", "wide shot"]
6. QUALITY: "masterpiece, best quality, highly detailed, sharp lines, professional illustration"

RULES:
- All in ENGLISH
- Comma-separated keywords only, no long sentences
- Be very specific about character appearance and action
- 70-100 words total
- NO explanations, ONLY the prompt

Respond with ONLY the prompt:`;

  const result = await chat([{ role: 'user', content: prompt }], { temperature: 0.6, max_tokens: 300 });
  return result.trim().replace(/^["']|["']$/g, '');
}

module.exports = { optimizeImagePrompt, STYLE_PRESETS };
