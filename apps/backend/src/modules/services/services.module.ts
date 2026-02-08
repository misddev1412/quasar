import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Service } from '@backend/modules/services/entities/service.entity';
import { ServiceTranslation } from '@backend/modules/services/entities/service-translation.entity';
import { ServiceItem } from '@backend/modules/services/entities/service-item.entity';
import { ServiceItemTranslation } from '@backend/modules/services/entities/service-item-translation.entity';

import { SharedModule } from '@backend/modules/shared/shared.module';
import { ServicesRouter } from '@backend/modules/services/routers/services.router';
import { ServicesService } from '@backend/modules/services/services.service';

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
