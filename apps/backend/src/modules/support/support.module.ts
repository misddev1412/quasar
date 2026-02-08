import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SupportClient } from './entities/support-client.entity';
import { Inquiry } from './entities/inquiry.entity';
import { SupportClientService } from './services/support-client.service';
import { InquiryService } from './services/inquiry.service';
import { SupportClientRepository } from './repositories/support-client.repository';
import { InquiryRepository } from './repositories/inquiry.repository';

@Module({
  imports: [TypeOrmModule.forFeature([SupportClient, Inquiry])],
  providers: [SupportClientService, InquiryService, SupportClientRepository, InquiryRepository],
  exports: [SupportClientService, InquiryService, SupportClientRepository, InquiryRepository],
})
export class SupportModule { }