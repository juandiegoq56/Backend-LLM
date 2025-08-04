import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Facultad } from 'src/entities/Facultad/facultad.entity';
import { Proyecto } from 'src/entities/Proyecto/proyecto.etity';
import { Asignatura } from 'src/entities/Asignatura/asignatura.entity';
import { Temas } from 'src/entities/Tema/temas.entity';
import  {Ollama}  from 'ollama' // Importamos la librería Ollama
import { UnidadesTematicas } from 'src/entities/unidades-tematicas/unidades-tematicas.entity';
//import ollama from 'ollama';

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
  
async obtenerTemasPorFiltros(
  facultad: string,
  proyecto: string,
  asignatura: string,
): Promise<any> {
  const facultades = await this.FacultadRepository.find({
    relations: {
      proyecto: {
        asignaturas: {
          temas: {
            temas: true
          }
        },
      },
    },
    where: {
      nombre: facultad,
      proyecto: {
        nombre: proyecto,
        asignaturas: {
          nombre: asignatura,
        },
      },
    },
  });
  const resultado = facultades.map((facultad) => ({
    facultad: facultad.nombre,
    proyecto: facultad.proyecto.find((p) => p.nombre === proyecto)?.nombre,
    asignatura: facultad.proyecto
      .find((p) => p.nombre === proyecto)
      ?.asignaturas.find((a) => a.nombre === asignatura)?.nombre,
    temas: this.agruparTemasPorJerarquia(
      facultad.proyecto
        .find((p) => p.nombre === proyecto)
        ?.asignaturas.find((a) => a.nombre === asignatura)
        ?.temas || []
    ),
  }));

  return resultado;
}

agruparTemasPorJerarquia(temas: any[]): any[] {
  const temasRaiz = temas.filter((tema) => tema.tema_padre_id === null);

  temasRaiz.forEach((temaRaiz) => {
    temaRaiz.subtemas = temas.filter((tema) => tema.tema_padre_id === temaRaiz.idtemas);
    this.agruparTemasPorJerarquia(temaRaiz.subtemas);
  });

  return temasRaiz.map(({ idtemas, nombre, subtemas }) => ({
    idtemas,
    nombre,
    subtemas: subtemas.map(({ idtemas, nombre, subtemas }) => ({
      idtemas,
      nombre,
      subtemas,
    })),
  }));
}


async obtenerUnidadesPorFacultad(): Promise<any> {
  const facultades = await this.FacultadRepository.find({
    relations: {
      proyecto: {
        asignaturas: true,
      },
    },
  });

  const resultado = facultades.map((facultad) => ({
    facultad: facultad.nombre,
    proyectos: facultad.proyecto.map((proyecto) => ({
      proyecto: proyecto.nombre,
      asignaturas: proyecto.asignaturas.map((asignatura) => asignatura.nombre),
    })),
  }));

  return resultado;
}

async generarPlanDeEstudio(
  facultad: string,
  proyecto: string,
  asignatura: string,
): Promise<string> {
  const data = await this.obtenerTemasPorFiltros(facultad, proyecto, asignatura);
  const unidadesTematicas = data[0]?.temas;

  if (!unidadesTematicas || unidadesTematicas.length === 0) {
    return 'No se encontraron unidades temáticas para generar el plan de estudio.';
  }

  const formattedUnidades = unidadesTematicas.map((unidad) => ({
    idtemas: unidad.idtemas,
    nombre: unidad.nombre,
    subtemas: unidad.subtemas.map((subtema) => ({
      idtemas: subtema.idtemas,
      nombre: subtema.nombre,
    })),
  }));
 console.log (formattedUnidades);
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
        formattedUnidades,
        null,
        2,
      )}\n\nPor favor, crea un plan de aprendizaje detallado basado en estas unidades. Incluye conceptos clave, recursos recomendados y ejercicios prácticos para cada tema. Al final, pregunta al usuario si desea profundizar en algún tema.`,
    },
  ];

  try {
    // Usamos Ollama para generar la respuesta
    const response = await ollama.generate({
      model: 'llama3.2:1b',
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
    console.log(preguntaActual);
    console.log(preguntasPrevias);
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

    console.log(conversation[0].content);

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