// Importación de módulos y decoradores necesarios de NestJS y TypeORM.
import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

// Importación de la entidad Facultad para interactuar con la base de datos.
import { Facultad } from 'src/entities/Facultad/facultad.entity';

// Decorador que indica que esta clase es un servicio inyectable en NestJS.
@Injectable()
export class ProyectoService {
  // Constructor que inyecta el repositorio de la entidad Facultad para interactuar con la base de datos.
  constructor(
    @InjectRepository(Facultad)
    private facultadRepository: Repository<Facultad>,
  ) {}

  // Método para obtener proyectos asociados a una facultad específica.
 async obtenerProyectosPorFacultad(facultad: number): Promise<any> {
    try {
      // Busca facultades con sus proyectos relacionados, filtrando por el ID de la facultad.
      const facultades = await this.facultadRepository.find({
        relations: {
          proyecto: true, // Carga la relación directa con los proyectos.
        },
        where: {
          idfacultad: facultad, // Filtra por el ID de la facultad proporcionada.
        },
      });

      // Si no se encuentra la facultad, lanzar una excepción 404
      if (!facultades || facultades.length === 0) {
        throw new NotFoundException('No se encontró la facultad especificada.');
      }

      // Si la facultad existe pero no tiene proyectos, lanzar una excepción 404
      if (!facultades[0].proyecto || facultades[0].proyecto.length === 0) {
        throw new NotFoundException('No se encontraron proyectos para la facultad especificada.');
      }

      // Retornar los proyectos asociados a la facultad
      return facultades[0].proyecto;
    } catch (error) {
      // Si el error ya es una NotFoundException, lo re-lanzamos tal cual
      if (error instanceof NotFoundException) {
        throw error;
      }
      // Para cualquier otro error inesperado, NestJS lo manejará como 500 automáticamente
      throw error;
    }
  }
}
