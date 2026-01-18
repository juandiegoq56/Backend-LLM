// Importación de módulos y decoradores necesarios de NestJS y TypeORM.
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

// Importación de las entidades Asignatura, Temas y Conversacion para interactuar con la base de datos.
import { Asignatura } from 'src/entities/Asignatura/asignatura.entity';
import { Temas } from 'src/entities/Tema/temas.entity';
import { Conversacion } from 'src/entities/Conversacion/conversacion.entity';

// Decorador que indica que esta clase es un servicio inyectable en NestJS.
@Injectable()
export class TemasService {
  // Constructor que inyecta los repositorios de las entidades Asignatura, Conversacion y Temas para interactuar con la base de datos.
  constructor(
    @InjectRepository(Asignatura)
    private asignaturaRepository: Repository<Asignatura>,
    @InjectRepository(Conversacion)
    private conversacionRepository: Repository<Conversacion>,
    @InjectRepository(Temas)
    private temaRepository: Repository<Temas>,
  ) {}

  // Método para obtener temas asociados a una asignatura específica, filtrando por temas sin padre (temas principales).
  async obtenerTemasPorAsignatura(asignatura: number): Promise<any> {
    // Busca asignaturas con sus temas relacionados, filtrando por el ID de la asignatura.
    const tema = await this.asignaturaRepository.find({
      relations: {
        temas: true, // Carga la relación directa con los temas.
      },
      where: {
        idasignatura: asignatura, // Filtra por el ID de la asignatura proporcionada.
      },
    });

    // Filtra los temas para retornar solo aquellos cuyo tema_padre_id sea null (temas principales, sin padre).
    const temasConPadreIgualId = tema.map(f => f.temas).flat().filter(t => t.tema_padre_id === null);

    return temasConPadreIgualId; // Retorna el arreglo de temas principales.
  }

  // Método para obtener subtemas asociados a un tema padre y una asignatura específica.
  async obtenerTemasPorTema(asignatura: bigint, idpadre: bigint): Promise<any> {
    // Busca temas que tengan como padre el idpadre proporcionado y pertenezcan a la asignatura dada.
    const tema = await this.temaRepository.find({
      where: {
        tema_padre_id: idpadre, // Filtra por el ID del tema padre.
        idasignatura: asignatura, // Filtra por el ID de la asignatura.
      },
    });

    return tema; // Retorna el arreglo de subtemas.
  }

  // Método para obtener el tema asociado a una conversación específica.
  async obtenerTemaPorConversacion(idconversacion: number): Promise<Temas | null> {
    // Busca una conversación por su ID, cargando la relación con el tema.
    const conversacion = await this.conversacionRepository.findOne({
      where: { idconversacion },
      relations: {
        tema: true, // Carga la relación directa con el tema.
      },
    });

    // Retorna el tema asociado a la conversación si existe, o null si no hay conversación o tema.
    return conversacion?.tema ?? null;
  }

  // Método para obtener los subtemas asociados al tema de una conversación específica.
  async obtenerSubtemasPorConversacion(idconversacion: number): Promise<Temas[]> {
    // Busca una conversación por su ID, cargando la relación con el tema.
    const conversacion = await this.conversacionRepository.findOne({
      where: { idconversacion },
      relations: {
        tema: true, // Carga la relación directa con el tema.
      },
    });

    // Si no hay conversación o no tiene tema asociado, retorna un arreglo vacío.
    if (!conversacion?.tema) {
      return [];
    }

    // Busca los subtemas cuyo tema_padre_id coincide con el ID del tema de la conversación.
    return await this.temaRepository.find({
      where: {
        tema_padre_id: BigInt(conversacion.tema.idtemas), // Filtra por el ID del tema padre.
      },
    });
  }
}
