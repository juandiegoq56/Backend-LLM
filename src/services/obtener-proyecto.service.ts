import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Facultad } from 'src/entities/Facultad/facultad.entity';
import { Proyecto } from 'src/entities/Proyecto/proyecto.etity';

@Injectable()
export class ProyectoService {
  constructor(
    @InjectRepository(Facultad)
    private facultadRepository: Repository<Facultad>,
    @InjectRepository(Proyecto)
    private proyectoRepository: Repository<Proyecto>,
  ) {}

 async obtenerProyectosPorFacultad(facultad: number): Promise<any> {
  const facultades = await this.facultadRepository.find({
    relations: {
      proyecto: true, // Relación directa con proyectos
    },
    where: {
      idfacultad: facultad, // Filtrar por el nombre de la facultad
    },
  });

  // Extraer solo los proyectos de la facultad
  const proyectos = facultades.map(f => f.proyecto).flat();
  return proyectos;
}

}
