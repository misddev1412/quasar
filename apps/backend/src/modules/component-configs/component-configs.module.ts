import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ComponentConfigEntity } from './entities/component-config.entity';
import { ComponentConfigRepository } from './repositories/component-config.repository';
import { ComponentConfigsService } from './services/component-configs.service';
import { AdminComponentConfigsRouter } from './routers/admin-component-configs.router';
import { SharedModule } from '../shared/shared.module';

@Module({
  imports: [TypeOrmModule.forFeature([ComponentConfigEntity]), SharedModule],
  providers: [ComponentConfigRepository, ComponentConfigsService, AdminComponentConfigsRouter],
  exports: [ComponentConfigRepository, ComponentConfigsService],
})
export class ComponentConfigsModule {}
