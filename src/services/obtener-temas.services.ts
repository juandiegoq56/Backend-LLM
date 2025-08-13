import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Asignatura } from 'src/entities/Asignatura/asignatura.entity';
import { Temas } from 'src/entities/Tema/temas.entity';
import { isNull } from 'util';

@Injectable()
export class TemasService {
  constructor(
    @InjectRepository(Asignatura)
    private asignaturaRepository: Repository<Asignatura>,
    @InjectRepository(Temas)
        private temaRepository: Repository<Temas>,
  ) {}

 async obtenerTemasPorAsignatura(asignatura: number): Promise<any> {
  const tema = await this.asignaturaRepository.find({
    relations: {
      temas: true, 
    },
    where: {
      idasignatura: asignatura, 
      
    },
  });

  const temasConPadreIgualId = tema.map(f => f.temas).flat().filter(t => t.tema_padre_id === null);


  return temasConPadreIgualId;
}

async obtenerTemasPorTema( asignatura: bigint,idpadre: bigint): Promise<any> {
  const tema = await this.temaRepository.find({
    where: {
      tema_padre_id: idpadre,
      idasignatura: asignatura
    },
  });


  return tema;
}

}
