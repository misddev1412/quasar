import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SharedModule } from '../shared/shared.module';
import { ProductsModule } from '../products/products.module';
import { StorageModule } from '../storage/storage.module';
import { OpenAiConfigEntity } from './entities/openai-config.entity';
import { OpenAiConfigRepository } from './repositories/openai-config.repository';
import { OpenAiConfigService } from './services/openai-config.service';
import { OpenAiContentService } from './services/openai-content.service';
import { AdminOpenAiConfigRouter } from './routers/admin-openai-config.router';

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
