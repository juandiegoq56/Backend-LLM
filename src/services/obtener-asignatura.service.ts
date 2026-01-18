// Importación de módulos y decoradores necesarios de NestJS y TypeORM.
import { Injectable } from '@nestjs/common';
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
    // Condicional para manejar diferentes servicios. Si idservicio es 1, filtra por semestre fijo en 1.
    if (Number(idservicio) === 1) {
      // Retorna las asignaturas asociadas al proyecto y al semestre 1.
      return await this.asignaturaRepository.find({
        where: {
          idproyecto: proyecto, // Filtra por ID de proyecto (asumiendo que el campo en la base de datos es BIGINT).
          semestre: BigInt(1),  // Filtra por semestre fijo en 1.
        },
      });
    } else {
      // Si el servicio no es 1, retorna todas las asignaturas asociadas al proyecto sin filtro de semestre.
      return await this.asignaturaRepository.find({
        where: {
          idproyecto: proyecto, // Filtra solo por ID de proyecto.
        },
      });
    }
  }
}
