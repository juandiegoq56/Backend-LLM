// Importación del decorador Module de NestJS para definir un módulo.
import { Module } from '@nestjs/common';
import { DatabaseModule } from './database/database.module';
import { TutorNiveladorsModule } from './tutor_nivelador/tutor_nivelador.module';

// Decorador que define esta clase como el módulo raíz de la aplicación.
@Module({
  // Importa los módulos necesarios para la aplicación.
  imports: [
    DatabaseModule, // Módulo para la configuración de la base de datos.
    TutorNiveladorsModule, // Módulo relacionado con la funcionalidad de tutor nivelador.
  ],
})
export class AppModule {}
