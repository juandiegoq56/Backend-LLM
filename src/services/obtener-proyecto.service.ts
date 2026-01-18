// Importación de módulos y decoradores necesarios de NestJS y TypeORM.
import { Injectable } from '@nestjs/common';
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
    // Busca facultades con sus proyectos relacionados, filtrando por el ID de la facultad.
    const facultades = await this.facultadRepository.find({
      relations: {
        proyecto: true, // Carga la relación directa con los proyectos.
      },
      where: {
        idfacultad: facultad, // Filtra por el ID de la facultad proporcionada.
      },
    });

    // Extrae los proyectos de las facultades encontradas y los aplana en un solo arreglo.
    const proyectos = facultades.map(f => f.proyecto).flat();
    return proyectos; // Retorna el arreglo de proyectos.
  }
}
