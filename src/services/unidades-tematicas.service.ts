import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Facultad } from 'src/entities/Facultad/facultad.entity';
import { Proyecto } from 'src/entities/Proyecto/proyecto.etity';
import { Asignatura } from 'src/entities/Asignatura/asignatura.entity';
import { Temas } from 'src/entities/Tema/temas.entity';
import { Mensajes } from '../entities/Mensajes/mensajes.entity';
import { Conversacion } from 'src/entities/Conversacion/conversacion.entity';
import { LlmService } from './llm.service'; // Importamos el nuevo servicio LlmService

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
    private readonly llmService: LlmService, // Inyectamos el nuevo servicio
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

  private esPreguntaSobreFormulario(pregunta: string): boolean {
    return /(formulario|ejercicio|cuestionario|pregunta\s+\d+|preguntas\s+anteriores)/i.test(pregunta);
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
    } else if ('pregunta' in data) {
      const { pregunta } = data;

      const esFormulario = this.esPreguntaSobreFormulario(pregunta);

      if (esFormulario) {
        const ultimoFormulario = await this.mensajesRepository.findOne({
          where: {
            idconversacion,
            emisor: 'agent',
            isform: 1,
          },
          order: { fcreado: 'DESC' },
        });

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
        const embeddingPregunta = await this.llmService.generarEmbedding(pregunta);

        const mensajes = await this.mensajesRepository.find({
          where: { idconversacion, emisor: 'agent' },
          order: { fcreado: 'ASC' },
        });

        if (mensajes.length === 0) {
          prompt = `
Nueva pregunta del estudiante:
"${pregunta}"

Responde de manera pedagógica, clara y estructurada.
`;
        }

        const fechas = mensajes.map((m) => new Date(m.fcreado).getTime());
        const minFecha = Math.min(...fechas);
        const maxFecha = Math.max(...fechas);

        const normalizarRecencia = (fechaMs: number) => {
          if (maxFecha === minFecha) return 1;
          return (fechaMs - minFecha) / (maxFecha - minFecha);
        };

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
          .slice(0, 5);

        const historialTexto = mensajesConPeso
          .map(
            (m) =>
              `Tutor: ${m.contenido}\n  → similitud: ${m.similitud.toFixed(
                2,
              )}, recencia: ${m.recencia.toFixed(2)}, score: ${m.score.toFixed(2)}`,
          )
          .join('\n\n');

        prompt = `
Eres un tutor virtual experto en nivelación universitaria.

Ten en cuenta lo siguiente para responder la nueva pregunta:

- 🧩 Historial relevante de la conversación:
${historialTexto}

Nueva pregunta del estudiante:
"${pregunta}"

Responde de manera pedagógica, clara y estructurada e Ignora cualquier pregunta que no esté relacionada con
Tema del contexto.
`;
      }
    }

    return this.llmService.generarRespuesta(prompt);
  }
}
