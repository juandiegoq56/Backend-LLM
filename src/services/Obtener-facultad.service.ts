// Importación de módulos y decoradores necesarios de NestJS y TypeORM.
import { Injectable, NotFoundException  } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

// Importación de la entidad Facultad para interactuar con la base de datos.
import { Facultad } from 'src/entities/Facultad/facultad.entity';

// Decorador que indica que esta clase es un servicio inyectable en NestJS.
@Injectable()
export class ObtenerFacultad {
    // Constructor que inyecta el repositorio de la entidad Facultad para interactuar con la base de datos.
    constructor(
        @InjectRepository(Facultad)
        private FacultadRepository: Repository<Facultad>,
    ) {}
    
    // Método para obtener todas las facultades de la base de datos.
    async obtenerFacultades(): Promise<Facultad[]> {
    try {
      // Retorna todas las facultades usando el método find del repositorio.
      const facultades = await this.FacultadRepository.find({});
      
      // Si no se encuentran facultades, lanzar una excepción 404
      if (!facultades || facultades.length === 0) {
        throw new NotFoundException('No se encontraron facultades en la base de datos.');
      }
      
      return facultades;
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
