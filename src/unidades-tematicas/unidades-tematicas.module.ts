import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UnidadesTematicas } from '../entities/unidades-tematicas/unidades-tematicas.entity';
import { UnidadesTematicasService } from './unidades-tematicas.service';
import { UnidadesTematicasController } from './unidades-tematicas.controller';
import { Facultad } from '../entities/Facultad/facultad.entity';
import { Proyecto } from 'src/entities/Proyecto/proyecto.etity';
import { Asignatura } from 'src/entities/Asignatura/asignatura.entity';
import { Temas } from 'src/entities/Tema/temas.entity';
@Module({
  imports: [TypeOrmModule.forFeature([Facultad,UnidadesTematicas,Proyecto,Asignatura,Temas])], // Registra la entidad
  providers: [UnidadesTematicasService], // Registra el servicio
  controllers: [UnidadesTematicasController], // Registra el controlador
})
export class UnidadesTematicasModule {}

