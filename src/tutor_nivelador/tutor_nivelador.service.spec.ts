// Importación de módulos necesarios para las pruebas unitarias en NestJS.
import { Test, TestingModule } from '@nestjs/testing';
import { UnidadesTematicasService } from '../services/tutor_nivelador.service';

// Describe el bloque de pruebas para el servicio UnidadesTematicasService.
describe('UnidadesTematicasService', () => {
  // Declara una variable para almacenar la instancia del servicio.
  let service: UnidadesTematicasService;

  // Configuración que se ejecuta antes de cada prueba (beforeEach).
  beforeEach(async () => {
    // Crea un módulo de prueba con el servicio UnidadesTematicasService.
    const module: TestingModule = await Test.createTestingModule({
      providers: [UnidadesTematicasService], // Registra el servicio en el módulo de prueba.
    }).compile();

    // Obtiene una instancia del servicio desde el módulo de prueba.
    service = module.get<UnidadesTematicasService>(UnidadesTematicasService);
  });

  // Prueba unitaria para verificar que el servicio está definido.
  it('should be defined', () => {
    // Verifica que la instancia del servicio no sea undefined, es decir, que se haya creado correctamente.
    expect(service).toBeDefined();
  });
});
