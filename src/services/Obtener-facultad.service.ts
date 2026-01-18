// Importación de módulos y decoradores necesarios de NestJS y TypeORM.
import { Injectable } from '@nestjs/common';
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
        // Retorna todas las facultades usando el método find del repositorio.
        return this.FacultadRepository.find({});
    }
}
