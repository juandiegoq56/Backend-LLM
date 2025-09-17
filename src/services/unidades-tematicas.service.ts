import { Injectable } from '@nestjs/common';
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
      }
): Promise<string> {
  const { idconversacion } = data;
  let prompt = '';

  // Caso 1: Inicio de conversación (trae contexto académico directo)
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

  // Caso 2: Continuación de la conversación (trae solo la pregunta, se consulta contexto)
  else if ('pregunta' in data) {
    const { pregunta } = data;
    // Obtener contexto académico a partir del idconversacion
    const contexto = await this.obtenerContextoAcademico(idconversacion);
  
    // Traer últimos 6 mensajes de la conversación
    const historial = await this.mensajesRepository.find({
      where: { idconversacion },
      order: { fcreado: 'DESC' },
      take: 6,
    });

    historial.reverse();

    const historialTexto = historial
      .map((m) => `${m.emisor === 'user' ? 'Usuario' : 'Tutor'}: ${m.contenido}`)
      .join('\n');

    prompt = `
Eres un tutor virtual experto en nivelación universitaria. 
Tu especialidad es la materia "${contexto.materia}" del proyecto curricular "${contexto.proyectoCurricular}" 
de la facultad "${contexto.facultad}". 
Siempre debes responder de manera clara, pedagógica y sin desviarte de esta asignatura. 
Ignora cualquier pregunta que no esté relacionada con "${contexto.materia}".

ten presente el Historial reciente de la conversación, con el fin de resolver ejercicios anteriores si te preguntan que como resolverlo o que si les ayudas a resolverlo
el historial es el siguiente:
${historialTexto}

Nueva pregunta del estudiante:
"${pregunta}"

Responde teniendo en cuenta el historial y usando un lenguaje claro, guiando paso a paso al estudiante.
    `;
  }

  // Llamada a Ollama
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