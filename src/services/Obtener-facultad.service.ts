import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { Facultad } from 'src/entities/Facultad/facultad.entity';

@Injectable()
export class ObtenerFacultad{

    constructor(
        @InjectRepository(Facultad)
        private FacultadRepository: Repository<Facultad>,
      ) {}
    
    async obtenerFacultades(): Promise<Facultad[]> {
    return this.FacultadRepository.find({

    });
  }
    
}

