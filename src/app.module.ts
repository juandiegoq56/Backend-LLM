import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DatabaseModule } from './database/database.module';
import { UnidadesTematicasModule } from './unidades-tematicas/unidades-tematicas.module';
import { UnidadesTematicas } from './entities/unidades-tematicas/unidades-tematicas.entity';

@Module({
  imports: [
    DatabaseModule,
    TypeOrmModule.forFeature([UnidadesTematicas]),
    UnidadesTematicasModule,
  ],
})
export class AppModule {}
