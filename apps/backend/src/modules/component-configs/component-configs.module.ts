import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ComponentConfigEntity } from '@backend/modules/component-configs/entities/component-config.entity';
import { ComponentConfigRepository } from '@backend/modules/component-configs/repositories/component-config.repository';
import { ComponentConfigsService } from '@backend/modules/component-configs/services/component-configs.service';
import { AdminComponentConfigsRouter } from '@backend/modules/component-configs/routers/admin-component-configs.router';
import { ClientComponentConfigsRouter } from '@backend/modules/component-configs/routers/client-component-configs.router';
import { SharedModule } from '@backend/modules/shared/shared.module';

@Module({
  imports: [TypeOrmModule.forFeature([ComponentConfigEntity]), SharedModule],
  providers: [
    ComponentConfigRepository,
    ComponentConfigsService,
    AdminComponentConfigsRouter,
    ClientComponentConfigsRouter,
  ],
  exports: [ComponentConfigRepository, ComponentConfigsService],
})
export class ComponentConfigsModule {}
