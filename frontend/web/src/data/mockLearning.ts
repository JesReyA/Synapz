/**
 * Datos de ejemplo de "Aprender". Las formas coinciden con API_CONTRACT.md §2.2, §2.3 y §2.4
 * para sustituirlos por llamadas reales sin tocar los componentes.
 */
import type {
  AdaptLessonResponse,
  AudioError,
  ClozeBlank,
  DailyFocus,
  EvaluateAudioResponse,
  GenerateReadingResponse,
  LessonBundle,
  ReadingBundle,
  RemedialSet,
  StudyCard,
} from "../types/learning.ts";

const delay = (ms: number) => new Promise<void>((resolve) => setTimeout(resolve, ms));

const CLASSROOM_ID = "c-mate";
const TOPIC_FRACTIONS = { classroom_id: CLASSROOM_ID, topic_id: "t-mate-1", title: "Fracciones y operaciones" };
const TOPIC_DECIMALS = { classroom_id: CLASSROOM_ID, topic_id: "t-mate-2", title: "Números decimales" };

/* ===================== Lección 1: Fracciones ===================== */

const FRACTIONS_GROUNDING = [
  {
    source_id: "src-mate-pptx-1",
    topic_id: TOPIC_FRACTIONS.topic_id,
    quote: "Una fracción representa partes iguales de un todo. El denominador indica en cuántas partes se divide.",
  },
];

const FRACTIONS_VISUAL: AdaptLessonResponse = {
  topic_id: TOPIC_FRACTIONS.topic_id,
  modality: "visual",
  title: "Fracciones con bloques de Minecraft",
  interests_used: ["Minecraft", "Dibujar"],
  grounding: FRACTIONS_GROUNDING,
  blocks: [
    {
      heading: "El todo: un cofre de 8 espacios",
      body: "Imagina un cofre pequeño con 8 espacios iguales. El cofre completo es el todo, o sea 1 entero.",
      visual_description: "Dibuja un cofre dividido en 8 cuadros iguales, en 2 filas de 4.",
    },
    {
      heading: "Las partes: lo que ya llenaste",
      body: "Si guardas objetos en 6 espacios, llenaste 6/8. El número de abajo (denominador) dice en cuántas partes iguales se divide el todo. El de arriba (numerador) dice cuántas partes tomas.",
      visual_description: "Pinta de verde 6 cuadros, deja 2 vacíos y escribe 6/8 debajo.",
    },
    {
      heading: "Fracciones equivalentes",
      body: "6/8 y 3/4 son la misma cantidad. Si agrupas los cuadros de 2 en 2, quedan 4 grupos y 3 están llenos.",
      visual_description: "Encierra los cuadros por parejas con un lápiz de otro color.",
    },
    {
      heading: "Sumar con el mismo denominador",
      body: "3/8 + 2/8 = 5/8. Suma solo los numeradores y conserva el denominador, porque los espacios siguen siendo del mismo tamaño.",
      visual_description: "Pinta 3 cuadros de azul y 2 de amarillo en el mismo cofre. Cuenta 5 de 8.",
    },
  ],
};

const FRACTIONS_READING: AdaptLessonResponse = {
  topic_id: TOPIC_FRACTIONS.topic_id,
  modality: "reading",
  title: "Fracciones y la vida de los mobs",
  interests_used: ["Minecraft", "Videojuegos"],
  grounding: FRACTIONS_GROUNDING,
  blocks: [
    {
      heading: "Una fracción compara una parte con el todo",
      body: "Un creeper tiene 20 puntos de vida. Si lo golpeas con una espada de piedra, que hace 5 de daño, le quitas 5 de 20. Eso se escribe 5/20 y se simplifica a 1/4.",
    },
    {
      heading: "El denominador no cambia el tamaño de la parte",
      body: "Un enderman tiene 40 puntos de vida. Un golpe de espada de diamante hace 7 de daño, así que le quitas 7/40. El denominador es mayor porque su vida total es mayor.",
    },
    {
      heading: "Comparar fracciones decide combates",
      body: "¿Qué golpe quita más proporción de vida: 5/20 al creeper o 7/40 al enderman? Convierte 5/20 en 10/40. Como 10/40 es mayor que 7/40, el golpe al creeper pesa más.",
    },
  ],
};

const FRACTIONS_AUDITORY: AdaptLessonResponse = {
  topic_id: TOPIC_FRACTIONS.topic_id,
  modality: "auditory",
  title: "Escucha las fracciones",
  interests_used: ["Música", "Minecraft"],
  grounding: FRACTIONS_GROUNDING,
  blocks: [
    {
      heading: "Resumen escrito",
      body: "Numerador arriba: cuántas partes tomas. Denominador abajo: en cuántas partes iguales se divide el todo. Con el mismo denominador, solo se suman los numeradores.",
    },
  ],
  narration_script:
    "Piensa en un cofre de Minecraft con ocho espacios. Ese cofre completo es el todo. Si llenas seis espacios, tienes seis octavos. El número de abajo, el denominador, te dice en cuántas partes iguales se divide el cofre. El número de arriba, el numerador, te dice cuántas partes tomaste. Si dos fracciones tienen el mismo denominador, sumas solo los de arriba: tres octavos más dos octavos son cinco octavos.",
  mnemonic_song:
    "Arriba el numerador, cuántas partes tomé.\nAbajo el denominador, en cuántas dividí.\nSi abajo es igual, solo sumo arriba,\n¡y las fracciones me salen sin fallar!",
};

/* ===================== Lección 2: Decimales ===================== */

const DECIMALS_GROUNDING = [
  {
    source_id: "src-mate-pdf-2",
    topic_id: TOPIC_DECIMALS.topic_id,
    quote: "Los números decimales usan el punto para separar enteros de partes de un entero: décimos, centésimos.",
  },
];

const DECIMALS_VISUAL: AdaptLessonResponse = {
  topic_id: TOPIC_DECIMALS.topic_id,
  modality: "visual",
  title: "Decimales en la barra de vida",
  interests_used: ["Videojuegos"],
  grounding: DECIMALS_GROUNDING,
  blocks: [
    {
      heading: "Una barra de 10 partes",
      body: "Cada corazón de la barra es un décimo. Con 7 corazones llenos tienes 0.7 de vida.",
      visual_description: "Dibuja una barra con 10 corazones y pinta 7.",
    },
    {
      heading: "Dividir un décimo en 10",
      body: "Si cada corazón se divide en 10 mitades pequeñas, cada una es un centésimo (0.01).",
      visual_description: "Amplía un corazón y divídelo en 10 rayitas.",
    },
  ],
};

const DECIMALS_READING: AdaptLessonResponse = {
  topic_id: TOPIC_DECIMALS.topic_id,
  modality: "reading",
  title: "Decimales y tus partidas",
  interests_used: ["Videojuegos", "Fútbol"],
  grounding: DECIMALS_GROUNDING,
  blocks: [
    {
      heading: "El punto separa enteros de partes",
      body: "Un corredor que hace 12.45 segundos tiene 12 segundos enteros y 45 centésimos. Ese detalle decide quién gana.",
    },
    {
      heading: "Compara dígito por dígito",
      body: "12.45 y 12.5: escribe 12.50 y compara. 12.45 es menor, así que es más rápido.",
    },
  ],
};

const DECIMALS_AUDITORY: AdaptLessonResponse = {
  topic_id: TOPIC_DECIMALS.topic_id,
  modality: "auditory",
  title: "Escucha los decimales",
  interests_used: ["Música"],
  grounding: DECIMALS_GROUNDING,
  blocks: [{ heading: "Resumen escrito", body: "Décimos, centésimos y milésimos van después del punto, en ese orden." }],
  narration_script:
    "Después del punto decimal vienen los décimos, luego los centésimos y después los milésimos. Cada lugar vale diez veces menos que el anterior. Para comparar, completa con ceros hasta tener los mismos lugares.",
  mnemonic_song: "Después del punto, décimo, centésimo,\nmilésimo al final, así los voy contando.\nCompleto con ceros y comparo mejor,\n¡el decimal más grande me gana el valor!",
};

export const MOCK_LESSON_BUNDLES: LessonBundle[] = [
  {
    id: "lb-fracciones",
    topic: TOPIC_FRACTIONS,
    preferred: "visual",
    lessons: { visual: FRACTIONS_VISUAL, reading: FRACTIONS_READING, auditory: FRACTIONS_AUDITORY },
  },
  {
    id: "lb-decimales",
    topic: TOPIC_DECIMALS,
    preferred: "auditory",
    lessons: { visual: DECIMALS_VISUAL, reading: DECIMALS_READING, auditory: DECIMALS_AUDITORY },
  },
];

/* ===================== Lectura personalizada ===================== */

const READING_TEXT =
  "Steve abre su inventario en Minecraft. Tiene 36 espacios y ha llenado 27. Para saber qué parte está ocupada, escribe una fracción: 27 de 36, que se simplifica a 3/4. Después sale a explorar y un creeper se acerca. Steve guarda la espada y cuenta cuántos bloques de piedra le quedan: la mitad de 12 son 6. Con una fracción puede comparar partes de un todo y decidir con rapidez. Así, las matemáticas lo ayudan a sobrevivir.";

const READING_GROUNDING = [
  {
    source_id: "src-mate-pdf-1",
    topic_id: TOPIC_FRACTIONS.topic_id,
    quote: "Una fracción expresa cuántas partes se toman de un todo dividido en partes iguales.",
  },
];

const CLEAN = /[.,:;¡!¿?"()]/g;

export function cleanWord(token: string): string {
  return token.replace(CLEAN, "").toLowerCase();
}

function wordIndex(text: string, word: string): number {
  return text.split(/\s+/).findIndex((t) => cleanWord(t) === word);
}

const CLOZE_PLAN: { word: string; options: string[] }[] = [
  { word: "inventario", options: ["mapa", "inventario", "cofre"] },
  { word: "fracción", options: ["suma", "medida", "fracción"] },
  { word: "mitad", options: ["doble", "mitad", "cuarta"] },
  { word: "partes", options: ["colores", "mundos", "partes"] },
];

function buildCloze(): { text: string; blanks: ClozeBlank[] } {
  const tokens = READING_TEXT.split(/\s+/);
  const blanks: ClozeBlank[] = [];
  CLOZE_PLAN.forEach((plan, i) => {
    const position = wordIndex(READING_TEXT, plan.word);
    if (position < 0) return;
    const original = tokens[position] ?? "";
    const trailing = original.match(/[.,:;!?]+$/)?.[0] ?? "";
    tokens[position] = `____${trailing}`;
    blanks.push({ id: `b${i + 1}`, position, answer: plan.word, options: plan.options });
  });
  return { text: tokens.join(" "), blanks };
}

const cloze = buildCloze();
const WORD_COUNT = READING_TEXT.split(/\s+/).length;

const COMPREHENSION: GenerateReadingResponse = {
  reading_session_id: "rs-mock-1",
  mode: "comprehension",
  title: "El inventario de Steve",
  text: READING_TEXT,
  word_count: WORD_COUNT,
  interests_used: ["Minecraft", "Videojuegos"],
  grounding: READING_GROUNDING,
  questions: [
    {
      id: "q1",
      question: "¿Cuántos espacios tiene el inventario de Steve?",
      options: ["27", "36", "12"],
      correct_index: 1,
    },
    {
      id: "q2",
      question: "¿A qué fracción se simplifica 27/36?",
      options: ["2/3", "1/2", "3/4"],
      correct_index: 2,
    },
    {
      id: "q3",
      question: "¿Cuánto es la mitad de 12 bloques de piedra?",
      options: ["6", "4", "10"],
      correct_index: 0,
    },
    {
      id: "q4",
      question: "¿Para qué le sirven las fracciones a Steve en el texto?",
      options: ["Para construir una casa", "Para comparar partes de un todo y decidir rápido", "Para ahuyentar al creeper"],
      correct_index: 1,
    },
  ],
};

const CLOZE: GenerateReadingResponse = {
  reading_session_id: "rs-mock-2",
  mode: "cloze",
  title: "El inventario de Steve",
  text: cloze.text,
  word_count: WORD_COUNT,
  interests_used: ["Minecraft", "Videojuegos"],
  grounding: READING_GROUNDING,
  blanks: cloze.blanks,
};

export const MOCK_READING_BUNDLES: ReadingBundle[] = [
  { id: "rb-steve", topic: TOPIC_FRACTIONS, comprehension: COMPREHENSION, cloze: CLOZE },
];

/* ===================== Evaluación de voz (mock) ===================== */

const SCORE_BY_ATTEMPT = [64, 74, 83, 90];

function buildErrorPool(text: string): AudioError[] {
  return [
    {
      type: "mispronounced",
      word: "creeper",
      expected: "crí-per",
      position: wordIndex(text, "creeper"),
      suggestion: "Di «crí-per», con la «ee» larga y el acento en la primera sílaba.",
    },
    {
      type: "omitted",
      word: "simplifica",
      position: wordIndex(text, "simplifica"),
      suggestion: "Esta palabra no se escuchó. Léela completa: «sim-pli-fi-ca».",
    },
    {
      type: "punctuation",
      word: "fracción:",
      position: wordIndex(text, "fracción"),
      suggestion: "Haz una pausa breve en los dos puntos antes de leer «27 de 36».",
    },
  ];
}

const FEEDBACK_BY_ATTEMPT = [
  "Buen inicio. Tu ritmo es parejo, pero cuida unas palabras y las pausas en la puntuación.",
  "Mejoraste. Ya casi no te trabas. Sigue respetando los dos puntos y las comas.",
  "Muy bien. Se nota que practicaste. Queda un detalle pequeño por pulir.",
  "Lectura clara y con buen ritmo. ¡Excelente trabajo!",
];

/** Equivale a `POST /api/reading/evaluate-audio`. El audio real no se envía en el mock. */
export async function mockEvaluateAudio(
  reading: GenerateReadingResponse,
  attempt: number,
  previousBest: number,
): Promise<EvaluateAudioResponse> {
  await delay(1100);
  const i = Math.min(Math.max(attempt, 1), SCORE_BY_ATTEMPT.length) - 1;
  const score = SCORE_BY_ATTEMPT[i] ?? 64;
  const errorCount = Math.max(0, 3 - i);
  return {
    reading_session_id: reading.reading_session_id,
    attempt,
    read_the_text: true,
    score,
    diction_score: Math.min(100, score + (i < 2 ? -3 : 2)),
    punctuation_score: Math.min(100, score + (i < 2 ? -9 : 3)),
    completeness: Math.min(1, 0.88 + i * 0.04),
    errors: buildErrorPool(reading.text).slice(0, errorCount),
    feedback: FEEDBACK_BY_ATTEMPT[i] ?? "",
    best_score: Math.max(previousBest, score),
    improved: score > previousBest,
  };
}

/* ===================== Nivelación sin reloj ===================== */

export const MOCK_REMEDIAL_SETS: RemedialSet[] = [
  {
    id: "rm-sumas",
    title: "Sumas sin prisa",
    prerequisite: { classroom_id: CLASSROOM_ID, topic_id: "t-prev-1", title: "Suma con llevadas" },
    exercises: [
      {
        id: "e1",
        skill: "addition",
        prompt: "27 + 15",
        accepted_answers: ["42"],
        display_answer: "42",
        hint_title: "Piensa en el cambio de la tienda",
        everyday_hint:
          "Pagas $27 de pan y $15 de leche. Primero suma los $10 de la leche: 27 + 10 = 37. Luego suma los $5 que faltan.",
        worked_example: "27 + 15 → 27 + 10 = 37 → 37 + 5 = 42",
      },
      {
        id: "e2",
        skill: "addition",
        prompt: "38 + 24",
        accepted_answers: ["62"],
        display_answer: "62",
        hint_title: "Redondea como al contar personas en el camión",
        everyday_hint:
          "En la primera parada suben 38 personas y en la siguiente 24. Redondea 38 a 40, suma 24 y quita los 2 que añadiste.",
        worked_example: "38 + 24 → 40 + 24 = 64 → 64 − 2 = 62",
      },
      {
        id: "e3",
        skill: "addition",
        prompt: "56 + 19",
        accepted_answers: ["75"],
        display_answer: "75",
        hint_title: "Piensa en los puntos de tu videojuego",
        everyday_hint: "Llevas 56 puntos y ganas 19. Es casi 20: suma 20 y resta 1.",
        worked_example: "56 + 19 → 56 + 20 = 76 → 76 − 1 = 75",
      },
      {
        id: "e4",
        skill: "addition",
        prompt: "125 + 48",
        accepted_answers: ["173"],
        display_answer: "173",
        hint_title: "Piensa en tus pasos a la escuela",
        everyday_hint: "Caminas 125 pasos hasta la esquina y 48 más hasta la puerta. Suma por partes: primero 40 y luego 8.",
        worked_example: "125 + 48 → 125 + 40 = 165 → 165 + 8 = 173",
      },
    ],
  },
  {
    id: "rm-fracciones",
    title: "Fracciones base",
    prerequisite: { classroom_id: CLASSROOM_ID, topic_id: "t-prev-2", title: "Fracciones como partes de un todo" },
    exercises: [
      {
        id: "f1",
        skill: "fractions",
        prompt: "1/2 + 1/2",
        accepted_answers: ["1", "2/2"],
        display_answer: "1",
        hint_title: "Piensa en una pizza",
        everyday_hint: "Si te comes media pizza y tu hermana come la otra mitad, se acabó la pizza completa.",
        worked_example: "1/2 + 1/2 = 2/2 = 1 entero",
      },
      {
        id: "f2",
        skill: "fractions",
        prompt: "1/4 + 2/4",
        accepted_answers: ["3/4"],
        display_answer: "3/4",
        hint_title: "Cuenta rebanadas",
        everyday_hint: "Una pizza tiene 4 rebanadas. Comes 1 y luego 2 más. ¿Cuántas de las 4 te comiste?",
        worked_example: "1/4 + 2/4 = (1 + 2)/4 = 3/4",
      },
      {
        id: "f3",
        skill: "fractions",
        prompt: "¿Qué fracción equivale a 2/4?",
        accepted_answers: ["1/2", "2/4"],
        display_answer: "1/2",
        hint_title: "Piensa en media pizza",
        everyday_hint: "2 rebanadas de una pizza de 4 es lo mismo que la mitad de la pizza.",
        worked_example: "2/4 = (2 ÷ 2)/(4 ÷ 2) = 1/2",
      },
      {
        id: "f4",
        skill: "fractions",
        prompt: "3/8 + 2/8",
        accepted_answers: ["5/8"],
        display_answer: "5/8",
        hint_title: "Piensa en una barra de chocolate",
        everyday_hint: "Una barra tiene 8 cuadritos. Te comes 3 hoy y 2 mañana. ¿Cuántos cuadritos de 8 te comiste?",
        worked_example: "3/8 + 2/8 = 5/8",
      },
    ],
  },
];

/* ===================== Tarjetas y enfoque diario ===================== */

export const MOCK_STUDY_CARDS: StudyCard[] = [
  {
    id: "sc-fracciones",
    category: "lessons",
    ref_id: "lb-fracciones",
    subject: "Matemáticas",
    accent: "blue",
    title: "Fracciones y operaciones",
    description: "Explicación con bloques y mobs de Minecraft, hecha con el material de tu profesora.",
    badge: "visual",
    progress: 68,
    minutes: 12,
    topic: TOPIC_FRACTIONS,
  },
  {
    id: "sc-decimales",
    category: "lessons",
    ref_id: "lb-decimales",
    subject: "Matemáticas",
    accent: "blue",
    title: "Números decimales",
    description: "Décimos y centésimos explicados con barras de vida y escucha guiada.",
    badge: "audio",
    progress: 20,
    minutes: 10,
    topic: TOPIC_DECIMALS,
  },
  {
    id: "sc-lectura",
    category: "reading",
    ref_id: "rb-steve",
    subject: "Comprensión lectora",
    accent: "violet",
    title: "El inventario de Steve",
    description: "Lee en voz alta, recibe la calificación de Feyn y responde la comprensión.",
    badge: "live_voice",
    progress: 40,
    minutes: 8,
    topic: TOPIC_FRACTIONS,
  },
  {
    id: "sc-sumas",
    category: "remedial",
    ref_id: "rm-sumas",
    subject: "Nivelación",
    accent: "teal",
    title: "Sumas sin prisa",
    description: "Practica sin reloj. Si fallas, te damos una pista con un ejemplo de tu día a día.",
    badge: "practice",
    progress: 0,
    minutes: 6,
    topic: { classroom_id: CLASSROOM_ID, topic_id: "t-prev-1", title: "Suma con llevadas" },
  },
  {
    id: "sc-fracciones-base",
    category: "remedial",
    ref_id: "rm-fracciones",
    subject: "Nivelación",
    accent: "teal",
    title: "Fracciones base",
    description: "Refuerza el tema previo que necesitas para entender fracciones y operaciones.",
    badge: "practice",
    progress: 25,
    minutes: 7,
    topic: { classroom_id: CLASSROOM_ID, topic_id: "t-prev-2", title: "Fracciones como partes de un todo" },
  },
];

export const MOCK_DAILY_FOCUS: DailyFocus = {
  card_id: "sc-fracciones-base",
  headline: "Hoy: refuerza fracciones base y vuelve a tu lección",
  reason:
    "Tu diagnóstico mostró rezago en fracciones como partes de un todo, un tema previo de la unidad actual.",
  based_on: ["Diagnóstico de conocimientos previos", "Tu gusto por Minecraft", "Temario de tu profesora"],
};
