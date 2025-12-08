import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SharedModule } from '../shared/shared.module';
import { FirebaseConfigEntity } from './entities/firebase-config.entity';
import { FirebaseConfigRepository } from './repositories/firebase-config.repository';
import { FirebaseConfigService } from './services/firebase-config.service';
import { FirebaseAuthService } from './services/firebase-auth.service';
import { AdminFirebaseConfigRouter } from './routers/admin-firebase-config.router';

@Module({
  imports: [
    TypeOrmModule.forFeature([FirebaseConfigEntity]),
    SharedModule,
  ],
  providers: [
    FirebaseConfigRepository,
    FirebaseConfigService,
    FirebaseAuthService,
    AdminFirebaseConfigRouter,
  ],
  exports: [
    FirebaseConfigService,
    FirebaseAuthService,
    FirebaseConfigRepository,
    AdminFirebaseConfigRouter,
  ],
})
export class FirebaseModule {}