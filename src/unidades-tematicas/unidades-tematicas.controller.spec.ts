import { Test, TestingModule } from '@nestjs/testing';
import { UnidadesTematicasController } from './unidades-tematicas.controller';

describe('UnidadesTematicasController', () => {
  let controller: UnidadesTematicasController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [UnidadesTematicasController],
    }).compile();

    controller = module.get<UnidadesTematicasController>(UnidadesTematicasController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
