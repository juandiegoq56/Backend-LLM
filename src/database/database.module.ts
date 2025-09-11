import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UnidadesTematicasModule } from '../unidades-tematicas/unidades-tematicas.module';
import { Facultad } from 'src/entities/Facultad/facultad.entity';
import { Proyecto } from 'src/entities/Proyecto/proyecto.etity';
import { Asignatura } from 'src/entities/Asignatura/asignatura.entity';
import { Temas } from 'src/entities/Tema/temas.entity';
import { Conversacion } from 'src/entities/Conversacion/conversacion.entity';
import { Mensajes } from 'src/entities/Mensajes/mensajes.entity';
import { Usuario } from 'src/entities/Usuario/usuario.entity';
import * as dotenv from 'dotenv';
dotenv.config();

@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: 'mysql', // Cambia según tu base de datos (puede ser postgres, sqlite, etc.)
      host: process.env.DB_HOST,
      port: Number(process.env.DB_PORT),
      username: process.env.DB_USERNAME,
      password: process.env.DB_PASSWORD, // Cambia según tu configuración
      database: process.env.DB_DATABASE, // Nombre de tu base de datos
      entities: [
        Facultad,
        Proyecto,
        Asignatura,
        Temas,
        Conversacion,
        Mensajes,
        Usuario,
      ], // Registra la entidad aquí
      synchronize: true, //QUitarla ojo no enviar
    }),
    UnidadesTematicasModule, // Importa el módulo
  ],
})
export class DatabaseModule {}
