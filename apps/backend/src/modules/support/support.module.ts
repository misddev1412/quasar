import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SupportClient } from '@backend/modules/support/entities/support-client.entity';
import { Inquiry } from '@backend/modules/support/entities/inquiry.entity';
import { Product } from '@backend/modules/products/entities/product.entity';
import { ProductMedia } from '@backend/modules/products/entities/product-media.entity';
import { ProductVariant } from '@backend/modules/products/entities/product-variant.entity';
import { SupportClientService } from '@backend/modules/support/services/support-client.service';
import { InquiryService } from '@backend/modules/support/services/inquiry.service';
import { SupportClientRepository } from '@backend/modules/support/repositories/support-client.repository';
import { InquiryRepository } from '@backend/modules/support/repositories/inquiry.repository';

@Module({
  imports: [TypeOrmModule.forFeature([SupportClient, Inquiry, Product, ProductMedia, ProductVariant])],
  providers: [SupportClientService, InquiryService, SupportClientRepository, InquiryRepository],
  exports: [SupportClientService, InquiryService, SupportClientRepository, InquiryRepository],
})
export class SupportModule { }
