import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UnidadesTematicas } from '../entities/unidades-tematicas/unidades-tematicas.entity';
import { UnidadesTematicasModule } from '../unidades-tematicas/unidades-tematicas.module';
import { Facultad } from 'src/entities/Facultad/facultad.entity';
import { Proyecto } from 'src/entities/Proyecto/proyecto.etity';
import { Asignatura } from 'src/entities/Asignatura/asignatura.entity';
import { Temas } from 'src/entities/Tema/temas.entity';

@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: 'mysql', // Cambia según tu base de datos (puede ser postgres, sqlite, etc.)
      host: '10.80.32.11',
      port: 3306,
      username: 'remote',
      password: '1234', // Cambia según tu configuración
      database: 'llm_tutor_db', // Nombre de tu base de datos
      entities: [Facultad,Proyecto,Asignatura,Temas], // Registra la entidad aquí
    }),
    UnidadesTematicasModule, // Importa el módulo
  ],
})
export class DatabaseModule {}

