const { chat } = require('./_services/deepseek');

// Elementos aleatorios para forzar variación en cada historia
const SETTINGS = [
  'en un pequeño pueblo rural', 'en una megaciudad futurista', 'en un barco en altamar',
  'en una mansión abandonada', 'en una estación espacial', 'en un mercado callejero',
  'en un hospital a medianoche', 'en un tren en movimiento', 'en una isla desierta',
  'en un subterráneo secreto', 'en un pueblo costero', 'en un rascacielos corporativo',
];

const TWISTS = [
  'el protagonista descubre que todo fue una trampa',
  'resulta que el antagonista era un aliado disfrazado',
  'el protagonista tiene un poder oculto que nunca supo que tenía',
  'todo lo que creía saber era mentira',
  'un objeto insignificante resulta ser la clave de todo',
  'el protagonista mismo era el culpable sin saberlo',
  'dos enemigos deben unirse para sobrevivir',
  'el final feliz esconde una nueva amenaza mayor',
  'el protagonista sacrifica algo valioso para salvar a otro',
  'la solución estaba frente a ellos desde el principio',
  'el tiempo se acaba y hay que tomar una decisión imposible',
  'la verdad es más extraña que cualquier mentira',
];

const PROTAGONISTS_POOL = [
  'una joven detective', 'un chef retirado', 'una abuela aventurera', 'un niño prodigio',
  'una científica loca', 'un ladrón con corazón de oro', 'una enfermera valiente',
  'un maestro misterioso', 'una artista rebelde', 'un taxista que lo ha visto todo',
  'un inmigrante recién llegado', 'una empresaria despiadada que cambia', 'un veterano solitario',
];

const NARRATIVE_ANGLES = [
  'contada desde el punto de vista del villano',
  'narrada a través de flashbacks',
  'con un narrador que no sabe toda la verdad',
  'donde el espectador sabe algo que el protagonista no',
  'con dos líneas de tiempo que convergen al final',
  'comenzando por el final y mostrando cómo se llegó ahí',
  'con un giro en el último segundo que redefine todo lo anterior',
];

function pick(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

module.exports = async (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Método no permitido' });

  try {
    const { category, genre, platform = 'tiktok', protagonistDescription = '' } = req.body;
    if (!category || !genre) return res.status(400).json({ error: 'category y genre son requeridos' });

    // Elementos aleatorios — garantizan que cada historia sea diferente
    const setting       = pick(SETTINGS);
    const twist         = pick(TWISTS);
    const angle         = pick(NARRATIVE_ANGLES);
    const suggestedProt = pick(PROTAGONISTS_POOL);
    const randomSeed    = Math.floor(Math.random() * 10000);

    const protagonistNote = protagonistDescription
      ? `El protagonista es EXACTAMENTE: "${protagonistDescription}". Basa el protagonist_visual_description en esta descripción.`
      : `Protagonista sugerido (puedes adaptarlo): ${suggestedProt}. Crea una versión única y memorable.`;

    const prompt = `Eres un guionista de cine de alto nivel, especializado en historias cortas virales.

BRIEF CREATIVO #${randomSeed}:
- Categoría/Tema: "${category}"
- Género: ${genre}
- Plataforma: ${platform}
- Ambientación OBLIGATORIA: ${setting}
- Giro narrativo OBLIGATORIO: ${twist}
- Ángulo narrativo OBLIGATORIO: ${angle}
- ${protagonistNote}

REGLAS INVIOLABLES:
1. La historia DEBE ocurrir ${setting}
2. El giro DEBE ser: ${twist}
3. El ángulo narrativo DEBE ser: ${angle}
4. La historia debe ser COMPLETAMENTE DIFERENTE a cualquier historia típica de "${category}"
5. El género ${genre} debe sentirse desde la primera palabra
6. NUNCA uses tramas genéricas o predecibles

Responde ÚNICAMENTE con este JSON (sin markdown, sin texto extra):
{
  "title": "Título único y llamativo (máx 8 palabras)",
  "protagonist_visual_description": "Descripción visual detallada del protagonista EN INGLÉS para prompt de imagen: edad exacta, género, color y estilo de cabello, color de ojos, ropa específica con colores, rasgos únicos. Ej: 'young woman 28 years old, curly red hair, green eyes, worn leather jacket, jeans, freckled face, determined fierce expression'",
  "hook": "2 oraciones iniciales que atrapan en 3 segundos, en español, género ${genre} evidente",
  "story": "Historia completa 150-200 palabras en español. DEBE incluir el giro: ${twist}. DEBE sentirse como ${genre}.",
  "scenes": [
    {
      "description": "Escena de apertura: qué vemos visualmente, muy específico, 1 oración",
      "action": "Opening scene action in English, specific verb + what protagonist does"
    },
    {
      "description": "Escena central con tensión o conflicto, muy visual, 1 oración",
      "action": "Central conflict action in English"
    },
    {
      "description": "Escena del giro final: ${twist} — visual y específica, 1 oración",
      "action": "Twist reveal action in English"
    }
  ],
  "cta": "Llamada a la acción corta en español, específica para ${platform}"
}`;

    const raw = await chat(
      [{ role: 'user', content: prompt }],
      { temperature: 1.0, max_tokens: 1500 }  // temperature alta = más creatividad
    );

    const jsonMatch = raw.match(/\{[\s\S]*\}/);
    if (!jsonMatch) return res.status(500).json({ error: 'Error parseando respuesta', raw: raw.slice(0, 300) });
    const script = JSON.parse(jsonMatch[0]);
    res.json({ script });
  } catch (err) {
    res.status(500).json({ error: 'Error generando historia', detail: err.message });
  }
};
