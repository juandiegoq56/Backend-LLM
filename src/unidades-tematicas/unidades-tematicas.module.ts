import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UnidadesTematicas } from '../entities/unidades-tematicas/unidades-tematicas.entity';
import { UnidadesTematicasService } from '../services/unidades-tematicas.service';
import { UnidadesTematicasController } from './unidades-tematicas.controller';
import { Facultad } from '../entities/Facultad/facultad.entity';
import { Proyecto } from 'src/entities/Proyecto/proyecto.etity';
import { Asignatura } from 'src/entities/Asignatura/asignatura.entity';
import { Temas } from 'src/entities/Tema/temas.entity';
import { Conversacion } from 'src/entities/Conversacion/conversacion.entity';
import { Mensajes } from 'src/entities/Mensajes/mensajes.entity';
import { Usuario } from 'src/entities/Usuario/usuario.entity';
import { ObtenerFacultad } from 'src/services/Obtener-facultad.service';
import { ProyectoService } from 'src/services/obtener-proyecto.service';
import { AsignaturaService } from 'src/services/obtener-asignatura.service';
import { TemasService } from 'src/services/obtener-temas.services';
import { ConversacionService } from 'src/services/conversaciones.service';
import { MensajesService } from 'src/services/mensajes.service';
import { MoodleService } from 'src/services/user.service';
@Module({
  imports: [TypeOrmModule.forFeature([Facultad,UnidadesTematicas,Proyecto,Asignatura,Temas,Conversacion,Mensajes,Usuario])], // Registra la entidad
  providers: [UnidadesTematicasService,ObtenerFacultad,ProyectoService,AsignaturaService,TemasService,ConversacionService,MensajesService,MoodleService], // Registra el servicio
  controllers: [UnidadesTematicasController], // Registra el controlador
})


export class UnidadesTematicasModule {}

