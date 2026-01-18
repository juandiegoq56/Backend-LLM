// Importación de módulos necesarios de NestJS y TypeORM.
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

// Importación de servicios personalizados para manejar lógica de negocio.
import { UnidadesTematicasService } from '../services/tutor_nivelador.service';
import { ObtenerFacultad } from 'src/services/Obtener-facultad.service';
import { ProyectoService } from 'src/services/obtener-proyecto.service';
import { AsignaturaService } from 'src/services/obtener-asignatura.service';
import { TemasService } from 'src/services/obtener-temas.services';
import { ConversacionService } from 'src/services/conversaciones.service';
import { MensajesService } from 'src/services/mensajes.service';
import { MoodleService } from 'src/services/user.service';
import { LlmService } from 'src/services/llm.service';

// Importación del controlador para manejar las rutas y endpoints.
import { UnidadesTematicasController } from './tutor_nivelador.controller';

// Importación de entidades para interactuar con la base de datos mediante TypeORM.
import { Facultad } from '../entities/Facultad/facultad.entity';
import { Proyecto } from 'src/entities/Proyecto/proyecto.entity';
import { Asignatura } from 'src/entities/Asignatura/asignatura.entity';
import { Temas } from 'src/entities/Tema/temas.entity';
import { Conversacion } from 'src/entities/Conversacion/conversacion.entity';
import { Mensajes } from 'src/entities/Mensajes/mensajes.entity';
import { Usuario } from 'src/entities/Usuario/usuario.entity';

// Decorador que define esta clase como un módulo de NestJS.
@Module({
  // Registra las entidades para que TypeORM las reconozca y pueda interactuar con la base de datos.
  imports: [TypeOrmModule.forFeature([Facultad, Proyecto, Asignatura, Temas, Conversacion, Mensajes, Usuario])],
  
  // Registra los servicios como proveedores para que puedan ser inyectados en otras clases.
  providers: [
    UnidadesTematicasService,
    ObtenerFacultad,
    ProyectoService,
    AsignaturaService,
    TemasService,
    ConversacionService,
    MensajesService,
    MoodleService,
    LlmService
  ],
  
  // Registra el controlador que manejará las solicitudes HTTP relacionadas con este módulo.
  controllers: [UnidadesTematicasController],
})
export class TutorNiveladorsModule {}
