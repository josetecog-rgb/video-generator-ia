const { chat } = require('./deepseek');

const STYLE_PRESETS = {
  'comic-clasico':   { base: 'classic Latin American comic book style, bold black ink outlines, flat vibrant colors, Ben-Day dots, vintage comic panels, Pepo art style', artist: 'by Pepo, by Hergé, comic strip aesthetic' },
  'pantera-rosa':    { base: 'animated cartoon style, smooth clean lines, vibrant flat colors, 1960s DePatie-Freleng animation style, whimsical minimalist backgrounds, retro cartoon', artist: 'Pink Panther cartoon style, retro animation aesthetic' },
  'marvel':          { base: 'Marvel Comics superhero style, dynamic action poses, bold inking, dramatic lighting, comic book panels', artist: 'by Jim Lee, by Jack Kirby, by Neal Adams, American comic book style' },
  'anime':           { base: 'detailed manga comic style, anime art, screen tone shading, dynamic action lines, large expressive eyes', artist: 'by Akira Toriyama, by CLAMP, shonen manga style' },
  'pixar':           { base: '3D animated movie style, Pixar quality rendering, soft rounded features, large expressive eyes, subsurface skin scattering, vibrant colors', artist: 'Pixar Animation Studios style, Disney quality, 3D render' },
  'pop-art':         { base: 'Roy Lichtenstein pop art comic style, Ben-Day halftone dots, bold black outlines, primary flat colors, retro comic strip', artist: 'by Roy Lichtenstein, American pop art movement' },
  'cartoon-network': { base: 'modern cartoon style, bold thick outlines, exaggerated proportions, bright saturated colors, flat shading, fun character design', artist: 'Cartoon Network style, Adventure Time aesthetic' },
  'acuarela':        { base: 'children book illustration watercolor style, soft brushstrokes, pastel warm colors, whimsical charming characters', artist: 'by Quentin Blake, by Eric Carle, storybook quality' },
};

const GENRE_MOOD = {
  'Terror':       'dark horror atmosphere, ominous shadows, fear expression, cold desaturated tones',
  'Suspenso':     'tense dramatic atmosphere, high contrast shadows, suspense mood',
  'Acción':       'dynamic action, motion energy, intense dramatic composition',
  'Comedia':      'funny exaggerated expressions, cheerful bright colors, comedy visual gags',
  'Romance':      'warm romantic lighting, soft golden tones, tender emotional scene',
  'Drama':        'emotional dramatic scene, moody naturalistic lighting, intense expression',
  'Motivacional': 'epic inspiring composition, golden hour light, triumphant powerful scene',
  'Misterio':     'mysterious eerie atmosphere, fog and shadows, enigmatic scene',
};

async function optimizeImagePrompt({ sceneDescription, genre, style = 'comic-clasico', protagonistDescription = '' }) {
  const preset = STYLE_PRESETS[style] || STYLE_PRESETS['comic-clasico'];
  const mood = GENRE_MOOD[genre] || 'dramatic scene';

  // Si hay descripción del protagonista, lo ponemos como sujeto obligatorio
  const protagonistInstruction = protagonistDescription
    ? `CRITICAL: The MAIN CHARACTER who must appear prominently in this image is: "${protagonistDescription}". This character MUST be the central focus. Describe this exact character in detail in your prompt.`
    : 'Create a specific detailed character appropriate for the scene.';

  const systemPrompt = `You are a world-class AI image prompt engineer. You create perfect prompts for FLUX and Stable Diffusion that generate exactly what is requested.

TASK: Create ONE image prompt in English for this scene.

SCENE TO VISUALIZE: "${sceneDescription}"
ART STYLE: ${preset.base}
GENRE MOOD: ${mood}
${protagonistInstruction}

OUTPUT FORMAT — comma-separated keywords only, NO sentences, NO explanations:
[art style keywords], [protagonist: specific appearance, clothing, expression, action], [scene background and environment], [${preset.artist}], [camera angle: full body/close-up/wide shot], [lighting], [quality: masterpiece, best quality, ultra detailed, sharp]

RULES:
- English only
- 70-100 words
- Protagonist description MUST come right after the style keywords
- Be hyper-specific (not "man" but "tall elderly man with white beard, brown coat, round glasses, terrified expression")
- Output ONLY the prompt, nothing else:`;

  const result = await chat([{ role: 'user', content: systemPrompt }], { temperature: 0.5, max_tokens: 250 });
  return result.trim().replace(/^["']|["']$/g, '').replace(/\n/g, ', ');
}

module.exports = { optimizeImagePrompt, STYLE_PRESETS };
