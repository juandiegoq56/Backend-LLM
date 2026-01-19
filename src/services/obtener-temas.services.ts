// Importación de módulos y decoradores necesarios de NestJS y TypeORM.
import { Injectable, BadRequestException, NotFoundException, InternalServerErrorException } from '@nestjs/common';
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
  try {
    // Validar que el parámetro sea un número válido
    if (isNaN(asignatura)) {
      throw new BadRequestException('El identificador de la asignatura debe ser un número válido.');
    }

    // Busca asignaturas con sus temas relacionados, filtrando por el ID de la asignatura
    const asignaturaConTemas = await this.asignaturaRepository.find({
      relations: {
        temas: true, // Carga la relación directa con los temas
      },
      where: {
        idasignatura: asignatura, // Filtra por el ID de la asignatura proporcionada
      },
    });

    // Validar si se encontró la asignatura
    if (!asignaturaConTemas || asignaturaConTemas.length === 0) {
      throw new NotFoundException('No se encontró la asignatura especificada.');
    }

    // Extraer los temas de la asignatura encontrada
    const temas = asignaturaConTemas[0].temas;

    // Validar si la asignatura tiene temas asociados
    if (!temas || temas.length === 0) {
      throw new NotFoundException('No se encontraron temas para la asignatura especificada.');
    }

    // Filtrar los temas con tema_padre_id igual a null, como en la lógica original
    const temasConPadreIgualId = temas.filter(t => t.tema_padre_id === null);

    // Validar si hay temas con tema_padre_id igual a null
    if (!temasConPadreIgualId || temasConPadreIgualId.length === 0) {
      throw new NotFoundException('No se encontraron temas con tema_padre_id igual a null para la asignatura especificada.');
    }

    return temasConPadreIgualId;
  } catch (error) {
    // Manejo de errores específicos
    if (error instanceof BadRequestException || error instanceof NotFoundException) {
      throw error; // Re-lanzar errores específicos para que sean manejados por el controlador
    }
    // Manejo de errores inesperados (como problemas de base de datos)
    throw new InternalServerErrorException('Error interno del servidor al obtener los temas de la asignatura.');
  }
}

  // Método para obtener subtemas asociados a un tema padre y una asignatura específica.
  async obtenerTemasPorTema(asignatura: bigint, idpadre: bigint): Promise<any> {
  try {
    // Validar que los parámetros sean números válidos
    if (isNaN(Number(asignatura)) || asignatura.toString().includes('.')) {
      throw new BadRequestException('El identificador de la asignatura debe ser un número válido (bigint).');
    }
    if (isNaN(Number(idpadre)) || idpadre.toString().includes('.')) {
      throw new BadRequestException('El identificador del tema padre debe ser un número válido (bigint).');
    }

    // Busca temas que tengan como padre el idpadre proporcionado y pertenezcan a la asignatura dada.
    const tema = await this.temaRepository.find({
      where: {
        tema_padre_id: idpadre, // Filtra por el ID del tema padre.
        idasignatura: asignatura, // Filtra por el ID de la asignatura.
      },
    });

    // Validar si se encontraron temas
    if (!tema || tema.length === 0) {
      throw new NotFoundException('No se encontraron temas para la asignatura y tema padre especificados.');
    }

    return tema; // Retorna el arreglo de subtemas.
  } catch (error) {
    // Manejo de errores específicos
    if (error instanceof BadRequestException || error instanceof NotFoundException) {
      throw error; // Re-lanzar errores específicos para que sean manejados por el controlador
    }
    // Manejo de errores inesperados (como problemas de base de datos)
    throw new InternalServerErrorException('Error interno del servidor al obtener los temas de la asignatura y tema padre.');
  }
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
