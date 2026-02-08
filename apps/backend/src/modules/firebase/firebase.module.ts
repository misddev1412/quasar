import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SharedModule } from '@backend/modules/shared/shared.module';
import { FirebaseConfigEntity } from '@backend/modules/firebase/entities/firebase-config.entity';
import { FirebaseConfigRepository } from '@backend/modules/firebase/repositories/firebase-config.repository';
import { FirebaseConfigService } from '@backend/modules/firebase/services/firebase-config.service';
import { FirebaseAuthService } from '@backend/modules/firebase/services/firebase-auth.service';
import { FirebaseRealtimeDatabaseService } from '@backend/modules/firebase/services/firebase-realtime.service';
import { AdminFirebaseConfigRouter } from '@backend/modules/firebase/routers/admin-firebase-config.router';

@Module({
  imports: [
    TypeOrmModule.forFeature([FirebaseConfigEntity]),
    SharedModule,
  ],
  providers: [
    FirebaseConfigRepository,
    FirebaseConfigService,
    FirebaseAuthService,
    FirebaseRealtimeDatabaseService,
    AdminFirebaseConfigRouter,
  ],
  exports: [
    FirebaseConfigService,
    FirebaseAuthService,
    FirebaseRealtimeDatabaseService,
    FirebaseConfigRepository,
    AdminFirebaseConfigRouter,
  ],
})
export class FirebaseModule {}
