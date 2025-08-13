import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UnidadesTematicas } from '../entities/unidades-tematicas/unidades-tematicas.entity';
import { UnidadesTematicasService } from '../services/unidades-tematicas.service';
import { UnidadesTematicasController } from './unidades-tematicas.controller';
import { Facultad } from '../entities/Facultad/facultad.entity';
import { Proyecto } from 'src/entities/Proyecto/proyecto.etity';
import { Asignatura } from 'src/entities/Asignatura/asignatura.entity';
import { Temas } from 'src/entities/Tema/temas.entity';
import { ObtenerFacultad } from 'src/services/Obtener-facultad.service';
import { ProyectoService } from 'src/services/obtener-proyecto.service';
import { AsignaturaService } from 'src/services/obtener-asignatura.service';
import { TemasService } from 'src/services/obtener-temas.services';
@Module({
  imports: [TypeOrmModule.forFeature([Facultad,UnidadesTematicas,Proyecto,Asignatura,Temas])], // Registra la entidad
  providers: [UnidadesTematicasService,ObtenerFacultad,ProyectoService,AsignaturaService,TemasService], // Registra el servicio
  controllers: [UnidadesTematicasController], // Registra el controlador
})


export class UnidadesTematicasModule {}

