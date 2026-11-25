/**
 * Material del profesor por tema, para el chat de Feyn.
 * Hoy es un mock. En producción el backend lee `syllabus_topics.material_text` con el `topic_id`
 * y el cliente ya no envía el texto (API_CONTRACT.md §2.5.1).
 */
import { MOCK_CLASSES } from "./mockClasses.ts";
import type { FeynTopicContext } from "../types/classes.ts";

const MATERIAL: Record<string, string> = {
  "t-mate-1": [
    "Fracciones y operaciones.",
    "Una fracción representa partes iguales de un todo. El denominador indica en cuántas partes iguales se divide el todo y el numerador indica cuántas partes se toman.",
    "Dos fracciones son equivalentes cuando representan la misma cantidad, por ejemplo 1/2 y 2/4. Se obtienen multiplicando o dividiendo numerador y denominador por el mismo número.",
    "Para sumar o restar fracciones con el mismo denominador se suman o restan los numeradores y se conserva el denominador. Por ejemplo, 3/8 + 2/8 = 5/8.",
    "Para sumar fracciones con distinto denominador primero se buscan fracciones equivalentes con un denominador común.",
  ].join("\n"),
  "t-mate-2": [
    "Números decimales.",
    "Los números decimales usan el punto para separar los enteros de las partes de un entero: décimos, centésimos y milésimos.",
    "Cada posición a la derecha del punto vale diez veces menos que la anterior.",
    "Para comparar decimales se completan con ceros hasta tener los mismos lugares y se comparan dígito por dígito de izquierda a derecha.",
  ].join("\n"),
};

export function getTeacherMaterial(topicId: string): string | undefined {
  return MATERIAL[topicId];
}

/** Añade el material del profesor al tema, si el contexto no lo trae ya. */
export function withTeacherMaterial(topic: FeynTopicContext): FeynTopicContext {
  const material = topic.teacher_material ?? getTeacherMaterial(topic.topic_id);
  return material ? { ...topic, teacher_material: material } : topic;
}

/** Temas del alumno que Feyn puede escuchar: los que tienen material del profesor. */
export function listFeynTopics(): FeynTopicContext[] {
  return MOCK_CLASSES.flatMap((classroom) =>
    classroom.topics
      .map((t) => withTeacherMaterial({ classroom_id: t.classroom_id, topic_id: t.id, title: t.title }))
      .filter((t) => t.teacher_material !== undefined),
  );
}