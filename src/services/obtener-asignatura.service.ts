import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Facultad } from 'src/entities/Facultad/facultad.entity';
import { Proyecto } from 'src/entities/Proyecto/proyecto.etity';
import { Asignatura } from 'src/entities/Asignatura/asignatura.entity';

@Injectable()
export class AsignaturaService {
  constructor(
    @InjectRepository(Facultad)
    private facultadRepository: Repository<Facultad>,
    @InjectRepository(Proyecto)
    private proyectoRepository: Repository<Proyecto>,
     @InjectRepository(Asignatura)
    private asignaturaRepository: Repository<Asignatura>,
  ) {}

async obtenerAsignaturaPorProyecto(proyecto: number, idservicio: number): Promise<any> {

  if (Number(idservicio) === 1) {
    
    return await this.asignaturaRepository.find({
      where: {
        idproyecto: proyecto, // si tu campo en la DB es BIGINT
        semestre: BigInt(1),          // semestre fijo en 1
      },
    });
  } else {
    return await this.asignaturaRepository.find({
      where: {
        idproyecto: proyecto,
      },
    });
  }
}






}
