import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SupportClient } from './entities/support-client.entity';
import { SupportClientService } from './services/support-client.service';
import { SupportClientRepository } from './repositories/support-client.repository';

@Module({
  imports: [TypeOrmModule.forFeature([SupportClient])],
  providers: [SupportClientService, SupportClientRepository],
  exports: [SupportClientService, SupportClientRepository],
})
export class SupportModule {}