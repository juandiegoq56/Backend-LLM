import { Test, TestingModule } from '@nestjs/testing';
import { UnidadesTematicasService } from '../services/unidades-tematicas.service';

describe('UnidadesTematicasService', () => {
  let service: UnidadesTematicasService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [UnidadesTematicasService],
    }).compile();

    service = module.get<UnidadesTematicasService>(UnidadesTematicasService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
