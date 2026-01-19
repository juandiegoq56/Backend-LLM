// Importación de módulos y decoradores necesarios de NestJS y TypeORM.
import { Injectable, BadRequestException, NotFoundException, InternalServerErrorException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

// Importación de las entidades necesarias para trabajar con facultades, proyectos y asignaturas.
import { Facultad } from 'src/entities/Facultad/facultad.entity';
import { Proyecto } from 'src/entities/Proyecto/proyecto.entity';
import { Asignatura } from 'src/entities/Asignatura/asignatura.entity';

// Decorador que indica que esta clase es un servicio inyectable en NestJS.
@Injectable()
export class AsignaturaService {
  // Constructor que inyecta los repositorios de las entidades Facultad, Proyecto y Asignatura para interactuar con la base de datos.
  constructor(
    @InjectRepository(Facultad)
    private facultadRepository: Repository<Facultad>,
    @InjectRepository(Proyecto)
    private proyectoRepository: Repository<Proyecto>,
    @InjectRepository(Asignatura)
    private asignaturaRepository: Repository<Asignatura>,
  ) {}

  // Método para obtener asignaturas asociadas a un proyecto y un servicio específico.
  async obtenerAsignaturaPorProyecto(proyecto: number, idservicio: number): Promise<any> {
    try {
      // Validar que los parámetros sean números válidos
      if (isNaN(proyecto) || isNaN(idservicio)) {
        throw new BadRequestException('Los identificadores del proyecto y del servicio deben ser números válidos.');
      }

      let asignaturas: any;

      // Condicional para manejar diferentes servicios. Si idservicio es 1, filtra por semestre fijo en 1.
      if (Number(idservicio) === 1) {
        asignaturas = await this.asignaturaRepository.find({
          where: {
            idproyecto: proyecto, // Filtra por ID de proyecto
            semestre: BigInt(1),  // Filtra por semestre fijo en 1
          },
        });
      } else if (Number(idservicio) === 2) {
        // Si el servicio no es 1, retorna todas las asignaturas asociadas al proyecto sin filtro de semestre
        asignaturas = await this.asignaturaRepository.find({
          where: {
            idproyecto: proyecto, // Filtra solo por ID de proyecto
          },
        });
      }
      else{
        throw new NotFoundException('No se encontraron asignaturas para el proyecto y servicio especificados.')
      }

      // Validar si se encontraron asignaturas
      if (!asignaturas || asignaturas.length === 0) {
        throw new NotFoundException('No se encontraron asignaturas para el proyecto y servicio especificados.');
      }

      return asignaturas;
    } catch (error) {
      // Manejo de errores específicos
      if (error instanceof BadRequestException || error instanceof NotFoundException) {
        throw error; // Re-lanzar errores específicos para que sean manejados por el controlador
      }
      // Manejo de errores inesperados (como problemas de base de datos)
      throw new InternalServerErrorException('Error interno del servidor al obtener las asignaturas.');
    }
  }
}
