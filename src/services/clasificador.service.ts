// formFlagClassifier.ts

import { Ollama } from 'ollama'

const ollama = new Ollama({ host: 'https://0x4kt4cc-11434.use2.devtunnels.ms' })
//const ollama = new Ollama({ host: 'localhost:11434'})

/**
 * Clasifica si un mensaje solicita la creación de preguntas / formulario.
 *
 * Retorna:
 *   1n   -> es formulario (setear isform = 1)
 *   null -> no es formulario
 */
export async function classifyFormFlag(
  message: string
): Promise<number | null>{
    console.log(message)
  if (!message || !message.trim()) return null;
 
  console.log(classifyWithOllama(message))

  // Clasificación con LLM pequeño (Ollama)
  return await classifyWithOllama(message);
  
}

/**
 * Clasificador binario ultra simple con Ollama
 */
async function classifyWithOllama(
  message: string
): Promise<number | null> {
  const prompt = `
Analiza SOLO el mensaje, sin usar contexto previo.

Devuelve ÚNICAMENTE:
- "1" si el mensaje ES o SOLICITA un FORMULARIO o CUESTIONARIO,
  es decir, un instrumento para que alguien RESPONDA preguntas.
- "null" en cualquier otro caso.

Marca "1" SOLO si el mensaje:
- pide crear / formular un formulario o cuestionario, O
- presenta preguntas con intención clara de ser RESPONDIDAS
  (por ejemplo: "responde", "contesta", "elige", "marca",
   "completa", "selecciona", "opción A/B/C").

NO marques "1" si el mensaje:
- es una explicación o contenido educativo
- incluye preguntas como ejemplos o ejercicios sugeridos
- explica un tema y luego pregunta "¿tienes alguna duda?"
- no tiene intención explícita de evaluación o recolección de respuestas

Mensaje:
"${message}"
`.trim(); 

  try {
    const response = await ollama.generate({
      model: "llama3.2:3b",
      prompt,
      options: { temperature: 0 }
    });
    
    console.log(response.response)
    const output = response.response?.trim();
    
    if (output === "null") {
    return null;
    
  }
    else{
      return 1;
    }
    
  } catch (error) {
    console.error("Error clasificando bandera isform con Ollama:", error);
    return null;
  }
}
