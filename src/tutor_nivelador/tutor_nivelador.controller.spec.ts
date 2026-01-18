// Importación de módulos necesarios para las pruebas unitarias en NestJS.
import { Test, TestingModule } from '@nestjs/testing';
import { UnidadesTematicasController } from './tutor_nivelador.controller';

// Describe el bloque de pruebas para el controlador UnidadesTematicasController.
describe('UnidadesTematicasController', () => {
  // Declara una variable para almacenar la instancia del controlador.
  let controller: UnidadesTematicasController;

  // Configuración que se ejecuta antes de cada prueba (beforeEach).
  beforeEach(async () => {
    // Crea un módulo de prueba con el controlador UnidadesTematicasController.
    const module: TestingModule = await Test.createTestingModule({
      controllers: [UnidadesTematicasController], // Registra el controlador en el módulo de prueba.
    }).compile();

    // Obtiene una instancia del controlador desde el módulo de prueba.
    controller = module.get<UnidadesTematicasController>(UnidadesTematicasController);
  });

  // Prueba unitaria para verificar que el controlador está definido.
  it('should be defined', () => {
    // Verifica que la instancia del controlador no sea undefined, es decir, que se haya creado correctamente.
    expect(controller).toBeDefined();
  });
});
