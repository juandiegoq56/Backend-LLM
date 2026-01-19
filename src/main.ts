import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  
  // Habilitar CORS para permitir solicitudes desde diferentes orígenes
  app.enableCors();

  // Configuración de Swagger para la documentación de la API
  const config = new DocumentBuilder()
    .setTitle('API de Tutor Nivelador')
    .setDescription('Documentación de la API para el sistema Tutor Nivelador')
    .setVersion('1.0')
    .addTag('tutor-nivelador') // Etiqueta para categorizar los endpoints
    .build();

  // Crear el documento Swagger basado en la configuración
  const document = SwaggerModule.createDocument(app, config);
  
  // Configurar la ruta donde estará disponible la documentación (por ejemplo, /api)
  SwaggerModule.setup('api', app, document);

  // Iniciar la aplicación en el puerto especificado en las variables de entorno o en el puerto 3001 por defecto
  await app.listen(process.env.PORT ?? 3001);
}

bootstrap();
