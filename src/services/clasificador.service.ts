// Importación del servicio LlmService para interactuar con un modelo de lenguaje.
import { LlmService } from "./llm.service";

// Instanciación del servicio LlmService para su uso en el archivo.
const llmService = new LlmService();

/**
 * Clasifica si un mensaje solicita la creación de preguntas o formulario.
 *
 * Retorna:
 *   1   -> es formulario (setear isform = 1)
 *   null -> no es formulario
 */
export async function classifyFormFlag(
  message: string
): Promise<number | null> {
  if (!message || !message.trim()) return null;
  return await classifyWithOllama(message);
}

/**
 * Clasificador binario: ¿CREA o SOLICITA un formulario?
 */
async function classifyWithOllama(
  message: string
): Promise<number | null> {
  const prompt = `
Tarea: clasificación binaria estricta.

Analiza SOLO el mensaje proporcionado.
NO uses contexto previo.
NO asumas intención implícita.

Devuelve ÚNICAMENTE:
- "1" si el mensaje ES un FORMULARIO o CUESTIONARIO,
  es decir, un texto que PRESENTA preguntas
  y ESPERA que el lector las RESPONDA.
- "null" en cualquier otro caso.

Marca "1" SOLO si el mensaje:
- solicita explícitamente que alguien responda preguntas
- contiene instrucciones de respuesta ("responde", "contesta", "marca", "elige", "selecciona")
- presenta preguntas SIN resolver, dirigidas al lector

NO marques "1" si el mensaje:
- explica o RESUELVE ejercicios
- desarrolla soluciones paso a paso
- es una respuesta, explicación o tutoría
- incluye preguntas ya respondidas
- es contenido educativo, aunque esté numerado
- finaliza con conclusiones o explicaciones
- pregunta algo como "¿te gustaría continuar?"

Mensaje a analizar:
"${message}"
`.trim();


  try {
    const response = await llmService.generarRespuesta(prompt);
    const output = response?.trim();
    return output === "null" ? null : 1;
  } catch {
    return null;
  }
}

/**
 * Clasificador binario: ¿PREGUNTA SOBRE un formulario YA EXISTENTE?
 *
 * Retorna:
 *   true  -> sí hace referencia a un formulario previo
 *   false -> no (flujo normal del tutor)
 */
export async function esPreguntaSobreFormulario(
  pregunta: string
): Promise<boolean> {
  if (!pregunta || !pregunta.trim()) return false;

const prompt = `
Tarea: clasificación binaria estricta.

Analiza SOLO el mensaje del estudiante.
NO uses contexto previo.
NO inventes contenido nuevo.

Devuelve ÚNICAMENTE:
- "1" si el estudiante hace referencia a
  PREGUNTAS, EJERCICIOS o ÍTEMS NUMERADOS
  que claramente ASUMEN que ya existen
  (por ejemplo: "ejercicio 4", "pregunta 2",
   "el punto b", "el anterior").
- "null" en cualquier otro caso.

Marca "1" SOLO si el mensaje:
- menciona un número de ejercicio o pregunta (ej: "ejercicio 4")
- se refiere a un elemento previo de una lista
- asume continuidad ("el anterior", "ese ejercicio")

NO marques "1" si:
- el estudiante pide crear nuevos ejercicios
- hace una pregunta general o teórica
- menciona números sin relación a ejercicios
- no hay referencia clara a contenido previo

Mensaje del estudiante:
"${pregunta}"
`.trim();


  try {
    const response = await llmService.generarRespuesta(prompt);
    return response?.trim() === "1";
  } catch {
    return false;
  }
}
