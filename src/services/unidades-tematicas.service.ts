import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Facultad } from 'src/entities/Facultad/facultad.entity';
import { Proyecto } from 'src/entities/Proyecto/proyecto.etity';
import { Asignatura } from 'src/entities/Asignatura/asignatura.entity';
import { Temas } from 'src/entities/Tema/temas.entity';
import { Mensajes } from '../entities/Mensajes/mensajes.entity';
import { Conversacion } from 'src/entities/Conversacion/conversacion.entity';
//import  {Ollama}  from 'ollama' // Importamos la librería Ollama
import { UnidadesTematicas } from 'src/entities/unidades-tematicas/unidades-tematicas.entity';
import * as math from 'mathjs';
import { Ollama } from 'ollama'

const ollama = new Ollama({ host: 'https://0x4kt4cc-11434.use2.devtunnels.ms' })




@Injectable()
export class UnidadesTematicasService {
  constructor(
    @InjectRepository(Facultad)
    private FacultadRepository: Repository<Facultad>,
    @InjectRepository(Proyecto)
    private ProyectoRepository: Repository<Proyecto>,
    @InjectRepository(Asignatura)
    private AsignaturaRepository: Repository<Asignatura>,
    @InjectRepository(Temas)
    private TemasRepository: Repository<Temas>,
    @InjectRepository(Mensajes)
    private readonly mensajesRepository: Repository<Mensajes>,
    @InjectRepository(Conversacion)
    private readonly conversacionRepository: Repository<Conversacion>,
  ) {}

 async obtenerUnidades(): Promise<Facultad[]> {
    return this.FacultadRepository.find({
      relations: {
        proyecto: {
          asignaturas: {
            temas: true,
          },
        },
      },
    });
  }
  
  async obtenerContextoAcademico(idconversacion: number) {
  const conversacion = await this.conversacionRepository.findOne({
    where: { idconversacion },
    relations: [
      
      'tema',
      'tema.asignatura',
      'tema.asignatura.proyecto',
      'tema.asignatura.proyecto.Facultad',
    ],
  });

  if (!conversacion) {
    throw new Error('No se encontró la conversación');
  }

  const facultad = conversacion.tema.asignatura.proyecto.Facultad.nombre;
  const proyectoCurricular = conversacion.tema.asignatura.proyecto.nombre;
  const materia = conversacion.tema.asignatura.nombre;

  return {
    facultad,
    proyectoCurricular,
    materia,
  };
}

private async generarEmbedding(contenido: string): Promise<number[]> {
    const embeddingUrl = process.env.EMBEDDING;
    if (!embeddingUrl) {
      throw new InternalServerErrorException('La variable EMBEDDING no está definida');
    }

    const response = await fetch(embeddingUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: 'nomic-embed-text',
        prompt: contenido,
      }),
    });

    if (!response.ok) {
      throw new Error(`Error al generar embedding: ${response.statusText}`);
    }

    const data = (await response.json()) as { embedding: number[] };
    return data.embedding;
  }

  // 🧠 Cálculo de similitud coseno entre dos embeddings
  private calcularSimilitud(a: number[], b: number[]): number {
  const dot = math.dot(a, b) as number;
  const normaA = math.norm(a) as number;
  const normaB = math.norm(b) as number;

  return dot / (normaA * normaB);
}

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

  // 🧩 Caso 1: inicio de conversación
  if ('facultad' in data) {
    const { facultad, proyectoCurricular, materia, tema, subtema, pregunta } = data;

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

  // 🧩 Caso 2: continuación con historial relevante
 else if ("pregunta" in data) {
  const { pregunta } = data;

  // 1️⃣ Generar embedding de la nueva pregunta
  const embeddingPregunta = await this.generarEmbedding(pregunta);

  // 2️⃣ Traer todos los mensajes anteriores del AGENT
  const mensajes = await this.mensajesRepository.find({
    where: { idconversacion, emisor: "agent" },
    order: { fcreado: "ASC" },
  });

  // Si no hay mensajes, historial vacío
  if (mensajes.length === 0) {
    prompt = `
Nueva pregunta del estudiante:
"${pregunta}"

Responde de manera pedagógica, clara y estructurada.
`;
  }

  // 3️⃣ Normalizar recencia (0 → antiguo, 1 → reciente)
  const fechas = mensajes.map((m) => new Date(m.fcreado).getTime());
  const minFecha = Math.min(...fechas);
  const maxFecha = Math.max(...fechas);

  const normalizarRecencia = (fechaMs: number) => {
    if (maxFecha === minFecha) return 1; // evitar división por cero si solo hay un mensaje
    return (fechaMs - minFecha) / (maxFecha - minFecha); 
  };

  // 4️⃣ Calcular similitud + peso por recencia
  const mensajesConPeso = mensajes
    .filter((m) => m.embedding)
    .map((m) => {
      const vector = JSON.parse(m.embedding) as number[];
      const similitud = this.calcularSimilitud(embeddingPregunta, vector);

      const fechaMs = new Date(m.fcreado).getTime();
      const recencia = normalizarRecencia(fechaMs);

      // Score final combinando similitud + recencia
      const score = similitud * 0.7 + recencia * 0.3;

      return { ...m, similitud, recencia, score };
    })
    .sort((a, b) => b.score - a.score)
    .slice(0, 5);

  // 5️⃣ Crear texto del historial relevante
  const historialTexto = mensajesConPeso
    .map(
      (m) =>
        `Tutor: ${m.contenido}\n  → similitud: ${m.similitud.toFixed(
          2
        )}, recencia: ${m.recencia.toFixed(2)}, score: ${m.score.toFixed(2)}`
    )
    .join("\n\n");

  console.log("\n🧩 Historial relevante (ponderado por recencia):\n", historialTexto);

    // 6️⃣ Armar prompt final
    prompt = `
Eres un tutor virtual experto en nivelación universitaria.

Ten en cuenta lo siguiente para responder la nueva pregunta:

- 🧩 Historial relevante de la conversación (mensajes más relacionados con la nueva pregunta):
${historialTexto}

Nueva pregunta del estudiante:
"${pregunta}"

Responde de manera pedagógica, clara y estructurada. 
Puedes referirte brevemente a lo que ya explicó el tutor en su última respuesta si es relevante.
`;
  }

  // 🚀 Enviar prompt al modelo
  try {
    const response = await ollama.generate({
      model: 'llama3.2:3b',
      prompt,
      options: { temperature: 0 },
    });

    return response.response || 'No se pudo generar una respuesta.';
  } catch (error: any) {
    console.error('Error al generar la respuesta con Ollama:', error.message);
    return 'Ocurrió un error al intentar generar la respuesta.';
  }
}


  /*async obtenerUnidadesPorFiltros(
    facultad: string,
    proyecto: string,
    asignatura: string,
  ): Promise<any> {
    const unidades = await this.unidadesTematicasRepository.find({
      where: { facultad, proyecto, asignatura },
    });

    const resultado = {
      facultad,
      proyecto,
      asignatura,
      unidades: unidades.map((unidad) => ({
        unidad: unidad.unidad,
        nombre_unidad: unidad.nombre_unidad,
        tema: unidad.tema,
      })),
    };

    return [resultado];
  } */

  /*async obtenerUnidadesPorFacultad(): Promise<any> {
    const unidades = await this.unidadesTematicasRepository.find();

    const resultado = unidades.reduce((facultades, unidad) => {
      if (!facultades[unidad.facultad]) {
        facultades[unidad.facultad] = {};
      }

      if (!facultades[unidad.facultad][unidad.proyecto]) {
        facultades[unidad.facultad][unidad.proyecto] = [];
      }

      if (!facultades[unidad.facultad][unidad.proyecto].includes(unidad.asignatura)) {
        facultades[unidad.facultad][unidad.proyecto].push(unidad.asignatura);
      }

      return facultades;
    }, {});

    const respuesta = Object.keys(resultado).map((facultad) => ({
      facultad,
      proyectos: Object.keys(resultado[facultad]).map((proyecto) => ({
        proyecto,
        asignaturas: resultado[facultad][proyecto],
      })),
    }));

    return respuesta;
  }

  async generarPlanDeEstudio(
    facultad: string,
    proyecto: string,
    asignatura: string,
  ): Promise<string> {
    const data = await this.obtenerUnidadesPorFiltros(facultad, proyecto, asignatura);
    const unidadesTematicas = data[0]?.unidades;

    if (!unidadesTematicas || unidadesTematicas.length === 0) {
      return 'No se encontraron unidades temáticas para generar el plan de estudio.';
    }

    // Configuración de la conversación para Ollama
    const conversation = [
      {
        role: 'system',
        content:
          'Eres un tutor virtual. Tu tarea es crear un plan de aprendizaje estructurado para un estudiante basado en los temas proporcionados, no debes saliste de los temas que te pasen.',
      },
      {
        role: 'user',
        content: `Aquí están las unidades temáticas de la asignatura '${asignatura}':\n\n${JSON.stringify(
          unidadesTematicas,
          null,
          2,
        )}\n\nPor favor, crea un plan de aprendizaje detallado basado en estas unidades,Incluye conceptos clave, recursos recomendados y ejercicios prácticos para cada tema,,ademas de preguntarle al final si desea profundizar en algun tema.`,
      },
    ];
   
    try {
      // Usamos Ollama para generar la respuesta
      const response = await ollama.generate({
        model: 'llama3.2:3b',
        prompt: JSON.stringify(conversation),
        options: { temperature: 0 },
      });

      // Devolvemos el contenido generado por Ollama
      
      return response.response || 'No se pudo generar el plan de estudio.';
    } catch (error) {
      console.error('Error al generar el plan de estudio con Ollama:', error.message);
      return 'Ocurrió un error al intentar generar el plan de estudio.';
    }
  }

async iniciarChatConLLM(
    facultad: string,
    proyecto: string,
    asignatura: string,
    preguntasPrevias: string[] = [], // Inicializa con un arreglo vacío si es undefined
    preguntaActual: string,
    respuestasBot: string[] = [] // Inicializa con un arreglo vacío si es undefined
): Promise<string> {
    // Asegurarse de que preguntasPrevias sea un arreglo
    if (!Array.isArray(preguntasPrevias)) {
        preguntasPrevias = [];
    }

    // Asegurarse de que respuestasBot sea un arreglo
    if (!Array.isArray(respuestasBot)) {
        respuestasBot = [];
    }

    // Obtener unidades temáticas
    const data = await this.obtenerUnidadesPorFiltros(facultad, proyecto, asignatura);
    const unidadesTematicas = data[0]?.unidades;

    if (!unidadesTematicas || unidadesTematicas.length === 0) {
        return 'No se encontraron unidades temáticas para generar el plan de estudio.';
    }

    // Mantener solo las últimas 4 preguntas y respuestas
    const contextoPreguntas = [
        ...preguntasPrevias.slice(-4), // Últimas 4 preguntas del usuario
        ...respuestasBot.slice(-4), // Últimas 4 respuestas del bot
        preguntaActual // Pregunta actual
    ];

    // Configuración de la conversación para el LLM
    const conversation = [
        {
            role: 'system',
            content: `Eres un tutor virtual. La asignatura es '${asignatura}' y las unidades temáticas son:\n${JSON.stringify(unidadesTematicas, null, 2)}\nLas últimas preguntas y respuestas son:\n${contextoPreguntas.join('\n')} con esto te doy un contexto para que lo tengas presente para contestar la pregunta actual: "${preguntaActual}"`,
        }
    ];


    try {
        // Usamos Ollama para generar la respuesta
        const response = await ollama.generate({
            model: 'llama3.2:3b',
            prompt: JSON.stringify(conversation),
            options: { temperature: 0 },
        });

        // Devolvemos el contenido generado por Ollama
        return response.response || 'No se pudo generar una respuesta.';
    } catch (error) {
        console.error('Error al generar la respuesta con Ollama:', error.message);
        return 'Ocurrió un error al intentar generar la respuesta.';
    }
}
*/

}