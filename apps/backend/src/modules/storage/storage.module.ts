import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SettingEntity } from '../settings/entities/setting.entity';
import { Media } from './entities/media.entity';
import { StorageService } from './services/storage.service';
import { FileUploadService } from './services/file-upload.service';
import { MediaService } from './services/media.service';
import { UploadController } from './controllers/upload.controller';
import { AdminStorageRouter } from './routers/admin-storage.router';
import { AdminMediaRouter } from './routers/admin-media.router';
import { SharedModule } from '../shared/shared.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([SettingEntity, Media]),
    SharedModule, // For ResponseService
  ],
  controllers: [UploadController],
  providers: [
    StorageService, 
    FileUploadService, 
    MediaService,
    AdminStorageRouter,
    AdminMediaRouter,
  ],
  exports: [
    StorageService, 
    FileUploadService, 
    MediaService,
    AdminStorageRouter,
    AdminMediaRouter,
  ],
})
export class StorageModule {}