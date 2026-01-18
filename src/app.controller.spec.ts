// Importación de módulos necesarios para las pruebas unitarias en NestJS.
import { Test, TestingModule } from '@nestjs/testing';
import { AppController } from './app.controller';
import { AppService } from './app.service';

// Describe el bloque de pruebas para el controlador AppController.
describe('AppController', () => {
  // Declara una variable para almacenar la instancia del controlador.
  let appController: AppController;

  // Configuración que se ejecuta antes de cada prueba (beforeEach).
  beforeEach(async () => {
    // Crea un módulo de prueba con el controlador AppController y el servicio AppService.
    const app: TestingModule = await Test.createTestingModule({
      controllers: [AppController], // Registra el controlador en el módulo de prueba.
      providers: [AppService], // Registra el servicio necesario para el controlador.
    }).compile();

    // Obtiene una instancia del controlador desde el módulo de prueba.
    appController = app.get<AppController>(AppController);
  });

  // Describe un grupo de pruebas específicas para el endpoint raíz.
  describe('root', () => {
    // Prueba unitaria para verificar que el método getHello() devuelve el texto esperado.
    it('should return "Tutor_Nivelador"', () => {
      // Verifica que la respuesta del método getHello() sea igual a 'Tutor_Nivelador'.
      expect(appController.getHello()).toBe('Tutor_Nivelador');
    });
  });
});
