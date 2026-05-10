const { chat } = require('./deepseek');

// Genera un prompt de imagen ultra optimizado siguiendo el método de 6 pasos
async function optimizeImagePrompt({ sceneDescription, genre, style = 'cinematic photorealistic' }) {
  const genreStyles = {
    'Terror':       'dark horror cinematography, ominous shadows, desaturated cold tones',
    'Suspenso':     'neo-noir cinematography, dramatic shadows, high contrast, teal and orange palette',
    'Acción':       'action movie cinematography, dynamic composition, motion blur, vivid colors',
    'Comedia':      'bright warm comedy cinematography, soft shadows, vibrant cheerful colors',
    'Romance':      'romantic soft cinematography, warm golden tones, bokeh background, pastel colors',
    'Drama':        'dramatic film cinematography, moody lighting, naturalistic colors, emotional depth',
    'Motivacional': 'epic inspirational cinematography, golden hour light, powerful composition',
    'Misterio':     'mysterious atmospheric cinematography, fog, cool blue tones, shadows',
  };

  const baseStyle = genreStyles[genre] || 'cinematic photorealistic';

  const prompt = `Eres un experto mundial en crear prompts para generación de imágenes IA (Stable Diffusion, FLUX, Midjourney).

Escena a visualizar: "${sceneDescription}"
Género: ${genre}
Estilo base: ${baseStyle}

Crea UN prompt en inglés ultra optimizado siguiendo EXACTAMENTE esta estructura separada por comas:

1. ESTILO DOMINANTE: Define el estilo visual completo (ej: "cinematic digital painting", "photorealistic 8k render", "dramatic oil painting")
2. SUJETO PRINCIPAL: Describe con detalles específicos (color de ropa, expresión, postura, edad, acción exacta, ambiente)
3. ELEMENTOS DE REFUERZO: Artista referencia + técnica (ej: "by Greg Rutkowski, by Artgerm, hyperdetailed, award winning photography")
4. COMPOSICIÓN: Tipo de plano y datos técnicos (ej: "full body shot", "close-up portrait", "wide establishing shot", "35mm lens", "f/2.8")
5. ILUMINACIÓN Y ATMÓSFERA: (ej: "dramatic chiaroscuro lighting", "golden hour", "neon rim light", "volumetric fog")
6. CALIFICADORES DE CALIDAD: (ej: "8k uhd", "ultra detailed", "sharp focus", "trending on artstation", "masterpiece")

REGLAS CRÍTICAS:
- Todo en INGLÉS
- Sin frases largas — solo palabras clave separadas por comas
- Sé muy específico en el sujeto (nada de "a person", di "a terrified young woman with dark hair, torn white dress, running")
- El prompt debe tener entre 60-100 palabras
- NO incluyas texto explicativo, SOLO el prompt

Responde ÚNICAMENTE con el prompt, sin comillas, sin explicación:`;

  const result = await chat([{ role: 'user', content: prompt }], { temperature: 0.7, max_tokens: 300 });
  return result.trim().replace(/^["']|["']$/g, '');
}

module.exports = { optimizeImagePrompt };
