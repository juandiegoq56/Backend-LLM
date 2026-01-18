// Importación de los decoradores y módulos necesarios de NestJS, un framework para aplicaciones del lado del servidor con Node.js.
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

// Importación de un módulo adicional relacionado con unidades temáticas,para lógica de aplicación específica.
import { TutorNiveladorsModule } from '../tutor_nivelador/tutor_nivelador.module';

// Importación de las entidades que representan las tablas de la base de datos, mapeadas por TypeORM.
import { Facultad } from 'src/entities/Facultad/facultad.entity';
import { Proyecto } from 'src/entities/Proyecto/proyecto.entity';
import { Asignatura } from 'src/entities/Asignatura/asignatura.entity';
import { Temas } from 'src/entities/Tema/temas.entity';
import { Conversacion } from 'src/entities/Conversacion/conversacion.entity';
import { Mensajes } from 'src/entities/Mensajes/mensajes.entity';
import { Usuario } from 'src/entities/Usuario/usuario.entity';

// Importación de la librería dotenv para cargar variables de entorno desde un archivo .env.
import * as dotenv from 'dotenv';

// Ejecución de la función config() para leer las variables de entorno definidas en un archivo .env y hacerlas accesibles 
// en process.env.
dotenv.config();

// Definición del módulo DatabaseModule usando el decorador @Module de NestJS.
@Module({
  imports: [
    // Configuración de la conexión a la base de datos usando TypeOrmModule.forRoot.
    TypeOrmModule.forRoot({
      type: 'mysql', // Especifica que se usa MySQL como tipo de base de datos, cambiar decorador segun la Base de datos utilizada
      host: process.env.DB_HOST, // Dirección del servidor de la base de datos, obtenida de variables de entorno.
      port: Number(process.env.DB_PORT), // Puerto de conexión, convertido a número desde una variable de entorno.
      username: process.env.DB_USERNAME, // Nombre de usuario para la conexión, desde variables de entorno.
      password: process.env.DB_PASSWORD, // Contraseña para la conexión, desde variables de entorno.
      database: process.env.DB_DATABASE, // Nombre de la base de datos a usar, desde variables de entorno.
      entities: [ // Lista de entidades (tablas) que TypeORM mapeará a la base de datos.
        Facultad,
        Proyecto,
        Asignatura,
        Temas,
        Conversacion,
        Mensajes,
        Usuario,
      ],
      synchronize: false, // Indica que las entidades no se sincronizarán automáticamente con la base de datos, recomendado para producción.
    }),
    // Importación de otro módulo de la aplicación, posiblemente relacionado con lógica de unidades temáticas.
    TutorNiveladorsModule,
  ],
})
// Exportación de la clase DatabaseModule como un módulo de NestJS.
export class DatabaseModule {}
