// Importación de decoradores y módulos necesarios de NestJS.
import { Controller, Get } from '@nestjs/common';
import { AppService } from './app.service';

// Decorador que define esta clase como un controlador sin una ruta base específica.
@Controller()
export class AppController {
  // Constructor que inyecta el servicio AppService para manejar la lógica de negocio.
  constructor(private readonly appService: AppService) {}

  // Endpoint GET para la ruta raíz ("/").
  @Get()
  getHello(): string {
    // Llama al método getHello() del servicio AppService y devuelve su resultado.
    return this.appService.getHello();
  }
}
