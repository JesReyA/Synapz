import type { FeynTopicContext } from "../types/classes.ts";

/** Palabras demasiado comunes para identificar un tema. */
const GENERIC = new Set(["numeros", "numero", "operaciones", "tema", "temas", "sobre", "entre", "como", "para", "cuando"]);

const normalize = (s: string): string => s.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");

function keywords(title: string): string[] {
  return normalize(title)
    .split(/[^a-z0-9]+/)
    .filter((w) => w.length >= 5 && !GENERIC.has(w));
}

/**
 * Busca a qué tema se refiere el alumno ("quiero explicarte fracciones").
 * Devuelve null si no hay coincidencia o si dos temas coinciden por igual.
 */
export function matchTopic(text: string, topics: FeynTopicContext[]): FeynTopicContext | null {
  const message = normalize(text);
  const scored = topics
    .map((topic) => ({
      topic,
      // Se compara la raíz de la palabra para aceptar singular y plural ("fracción" y "fracciones").
      score: keywords(topic.title).filter((k) => message.includes(k.slice(0, Math.max(5, k.length - 2)))).length,
    }))
    .filter((x) => x.score > 0)
    .sort((a, b) => b.score - a.score);

  const best = scored[0];
  if (!best) return null;
  if (scored[1] && scored[1].score === best.score) return null;
  return best.topic;
}
