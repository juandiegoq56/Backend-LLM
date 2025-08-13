import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Facultad } from 'src/entities/Facultad/facultad.entity';
import { Proyecto } from 'src/entities/Proyecto/proyecto.etity';


@Injectable()
export class AsignaturaService {
  constructor(
    @InjectRepository(Facultad)
    private facultadRepository: Repository<Facultad>,
    @InjectRepository(Proyecto)
    private proyectoRepository: Repository<Proyecto>,
  ) {}

 async obtenerAsignauraPorProyecto(proyecto: number): Promise<any> {
  const asignatura = await this.proyectoRepository.find({
    relations: {
      asignaturas: true, 
    },
    where: {
      idproyecto: proyecto, 
    },
  });

  
  const asignaturas = asignatura.map(f => f.asignaturas).flat();
  return asignaturas;
}

}
