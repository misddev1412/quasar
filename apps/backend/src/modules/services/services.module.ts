import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Service } from './entities/service.entity';
import { ServiceTranslation } from './entities/service-translation.entity';
import { ServiceItem } from './entities/service-item.entity';
import { ServiceItemTranslation } from './entities/service-item-translation.entity';

import { SharedModule } from '../shared/shared.module';
import { ServicesRouter } from './routers/services.router';
import { ServicesService } from './services.service';

@Module({
    imports: [
        TypeOrmModule.forFeature([
            Service,
            ServiceTranslation,
            ServiceItem,
            ServiceItemTranslation,
        ]),
        SharedModule,
    ],
    providers: [ServicesService, ServicesRouter],
    exports: [TypeOrmModule, ServicesService, ServicesRouter],
})
export class ServicesModule { }
