// Importación de módulos y decoradores necesarios de NestJS y TypeORM.
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

// Importación de las entidades necesarias para interactuar con la base de datos.
import { Facultad } from 'src/entities/Facultad/facultad.entity';
import { Mensajes } from '../entities/Mensajes/mensajes.entity';
import { Conversacion } from 'src/entities/Conversacion/conversacion.entity';

// Importación de servicios personalizados para manejar temas y respuestas de LLM.
import { TemasService } from './obtener-temas.services';
import { LlmService } from './llm.service'; // Importamos el nuevo servicio LlmService
import { esPreguntaSobreFormulario } from './clasificador.service';

// Decorador que indica que esta clase es un servicio inyectable en NestJS.
@Injectable()
export class UnidadesTematicasService {
  // Constructor que inyecta los repositorios y servicios necesarios.
  constructor(
    @InjectRepository(Facultad)
    private FacultadRepository: Repository<Facultad>,
    @InjectRepository(Mensajes)
    private readonly mensajesRepository: Repository<Mensajes>,
    @InjectRepository(Conversacion)
    private readonly conversacionRepository: Repository<Conversacion>,
    private readonly llmService: LlmService, // Inyectamos el servicio para generar respuestas con LLM.
    private readonly temaService: TemasService, // Inyectamos el servicio para manejar temas.
  ) {}

  // Método para obtener todas las facultades con sus relaciones anidadas (proyectos, asignaturas y temas).

  // Método para obtener el contexto académico de una conversación específica.
  async obtenerContextoAcademico(idconversacion: number) {
    // Busca la conversación con todas las relaciones necesarias para obtener el contexto académico.
    const conversacion = await this.conversacionRepository.findOne({
      where: { idconversacion },
      relations: [
        'tema',
        'tema.asignatura',
        'tema.asignatura.proyecto',
        'tema.asignatura.proyecto.Facultad',
      ],
    });

    // Lanza un error si no se encuentra la conversación.
    if (!conversacion) {
      throw new Error('No se encontró la conversación');
    }

    // Extrae la información del contexto académico desde las relaciones.
    const facultad = conversacion.tema.asignatura.proyecto.Facultad.nombre;
    const proyectoCurricular = conversacion.tema.asignatura.proyecto.nombre;
    const materia = conversacion.tema.asignatura.nombre;

    // Retorna un objeto con el contexto académico.
    return {
      facultad,
      proyectoCurricular,
      materia,
    };
  }

  // Método para generar una respuesta usando un modelo de lenguaje (LLM) basado en el contexto o pregunta.
  async generarRespuestaLLM(
    data:
      | {
          idconversacion: number;
          facultad: string;
          proyectoCurricular: string;
          materia: string;
          tema: string;
          subtema: string;
          pregunta: string;
        }
      | {
          idconversacion: number;
          pregunta: string;
        },
  ): Promise<string> {
    const { idconversacion } = data;
    let prompt = '';

    // Caso 1: Si el objeto contiene información de contexto académico completo.
    if ('facultad' in data) {
      const { facultad, proyectoCurricular, materia, tema, subtema, pregunta } = data;

      // Construye un prompt detallado con el contexto académico para el tutor virtual.
      prompt = `
Eres un tutor virtual experto en nivelación universitaria. 
Tu especialidad es la materia "${materia}" del proyecto curricular "${proyectoCurricular}" de la facultad "${facultad}". 
Siempre debes responder de manera clara, pedagógica y sin desviarte de esta asignatura. 
Ignora cualquier pregunta que no esté relacionada con "${materia}".

Contexto inicial:
- Facultad: ${facultad}
- Proyecto curricular: ${proyectoCurricular}
- Materia: ${materia}
- Tema: ${tema}
- Subtema: ${subtema}

Pregunta del estudiante:
"${pregunta}"

Responde de forma estructurada, clara y con ejemplos sencillos para ayudar al estudiante a nivelarse en esta materia.
`;
    } 
    // Caso 2: Si el objeto solo contiene la pregunta y el ID de la conversación.
    else if ('pregunta' in data) {
      const { pregunta } = data;

      // Verifica si la pregunta está relacionada con un formulario.
      const esFormulario = await esPreguntaSobreFormulario(pregunta);
      if (esFormulario) {
        // Busca el último formulario generado por el agente en la conversación.
        const ultimoFormulario = await this.mensajesRepository.findOne({
          where: {
            idconversacion,
            emisor: 'agent',
            isform: 1,
          },
          order: { fcreado: 'DESC' },
        });
        // Construye un prompt basado en el formulario.
        prompt = `
Eres un tutor virtual experto en nivelación universitaria.

El estudiante está haciendo una pregunta relacionada con el último formulario generado.

Formulario:
${ultimoFormulario ? ultimoFormulario.contenido : 'No hay un formulario previo registrado.'}

Pregunta del estudiante:
"${pregunta}"

Responde de manera clara y precisa, basándote únicamente en el formulario e Ignora cualquier pregunta que no esté relacionada con
Tema del formulario.
`;
      } else {
        // Genera un embedding para la pregunta para compararla con mensajes previos.
        const embeddingPregunta = await this.llmService.generarEmbedding(pregunta);

        // Busca los mensajes previos del agente en la conversación.
        const mensajes = await this.mensajesRepository.find({
          where: { idconversacion, emisor: 'agent' },
          order: { fcreado: 'ASC' },
        });

        // Si no hay mensajes previos, construye un prompt simple con la pregunta.
        if (mensajes.length === 0) {
          prompt = `
Nueva pregunta del estudiante:
"${pregunta}"

Responde de manera pedagógica, clara y estructurada.
`;
        } else {
          // Calcula recencia de los mensajes para priorizar los más recientes.
          const fechas = mensajes.map((m) => new Date(m.fcreado).getTime());
          const minFecha = Math.min(...fechas);
          const maxFecha = Math.max(...fechas);

          const normalizarRecencia = (fechaMs: number) => {
            if (maxFecha === minFecha) return 1;
            return (fechaMs - minFecha) / (maxFecha - minFecha);
          };

          // Calcula un puntaje combinado de similitud (con el embedding) y recencia para seleccionar los mensajes más relevantes.
          const mensajesConPeso = mensajes
            .filter((m) => m.embedding)
            .map((m) => {
              const vector = JSON.parse(m.embedding) as number[];
              const similitud = this.llmService.calcularSimilitud(embeddingPregunta, vector);

              const fechaMs = new Date(m.fcreado).getTime();
              const recencia = normalizarRecencia(fechaMs);

              const score = similitud * 0.7 + recencia * 0.3;

              return { ...m, similitud, recencia, score };
            })
            .sort((a, b) => b.score - a.score)
            .slice(0, 5); // Selecciona los 5 mensajes más relevantes.

          // Construye un texto con el historial relevante para incluir en el prompt.
          const historialTexto = mensajesConPeso
            .map(
              (m) =>
                `Tutor: ${m.contenido}\n  → similitud: ${m.similitud.toFixed(
                  2,
                )}, recencia: ${m.recencia.toFixed(2)}, score: ${m.score.toFixed(2)}`,
            )
            .join('\n\n');

          // Obtiene el tema y subtemas asociados a la conversación para el contexto.
          const tema_context = await this.temaService.obtenerTemaPorConversacion(idconversacion);
          const subtema_context = await this.temaService.obtenerSubtemasPorConversacion(idconversacion);
          
          // Construye el prompt final con el contexto académico, historial y la nueva pregunta.
          prompt = `
Eres un tutor virtual experto en nivelación universitaria en Física Newtoniana.
Tu rol es explicar y reforzar conceptos académicos de forma continua y guiada.

Contexto académico activo (OBLIGATORIO):
- Tema principal: ${tema_context?.nombre}
- Subtema(s): ${subtema_context}

🧩 Historial relevante de la conversación:
${historialTexto}

Nueva interacción del estudiante:
"${pregunta}"

REGLAS CRÍTICAS (OBLIGATORIAS):
1. TEN encuenta el historial Historial relevante de la conversación.
2. NUNCA digas que falta información, formulario, ejercicio o contexto.
3. NUNCA indiques que no puedes continuar por ausencia de datos.
4. Si la pregunta es ambigua o poco clara, ASUME que el estudiante desea profundizar en el Subtema.
5. Si el historial es insuficiente, responde exclusivamente usando el Tema y Subtema proporcionados.
6. NO cambies de tema bajo ninguna circunstancia.
7. Si el estudiante pregunta algo fuera del tema, responde únicamente:
   "Como tutor de este tema, no puedo salir del contenido de ${tema_context?.nombre}, continuemos con el subtema."

COMPORTAMIENTO ESPERADO:
- Continúa explicando activamente el subtema.
- Divide la explicación en secciones claras.
- Usa ejemplos sencillos y progresivos.
- Puedes hacer preguntas retóricas para guiar el aprendizaje.
- Si existen varios subtemas, explícalos uno por uno, sin pedir confirmación.
- Si te dice que generes preguntas no las respondas a menos que se indique.


`;
        }
      }
    }

    // Genera y retorna la respuesta usando el servicio LLM con el prompt construido.
    return this.llmService.generarRespuesta(prompt);
  }
}
