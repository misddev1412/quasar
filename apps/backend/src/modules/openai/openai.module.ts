import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SharedModule } from '@backend/modules/shared/shared.module';
import { ProductsModule } from '@backend/modules/products/products.module';
import { StorageModule } from '@backend/modules/storage/storage.module';
import { OpenAiConfigEntity } from '@backend/modules/openai/entities/openai-config.entity';
import { OpenAiConfigRepository } from '@backend/modules/openai/repositories/openai-config.repository';
import { OpenAiConfigService } from '@backend/modules/openai/services/openai-config.service';
import { OpenAiContentService } from '@backend/modules/openai/services/openai-content.service';
import { AdminOpenAiConfigRouter } from '@backend/modules/openai/routers/admin-openai-config.router';

@Module({
  imports: [
    TypeOrmModule.forFeature([OpenAiConfigEntity]),
    SharedModule,
    ProductsModule,
    StorageModule,
  ],
  providers: [
    OpenAiConfigRepository,
    OpenAiConfigService,
    OpenAiContentService,
    AdminOpenAiConfigRouter,
  ],
  exports: [
    OpenAiConfigService,
    OpenAiContentService,
    OpenAiConfigRepository,
    AdminOpenAiConfigRouter,
  ],
})
export class OpenAiModule { }
