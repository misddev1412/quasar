import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SettingEntity } from '@backend/modules/settings/entities/setting.entity';
import { Media } from '@backend/modules/storage/entities/media.entity';
import { MediaRelation } from '@backend/modules/storage/entities/media-relation.entity';
import { StorageService } from '@backend/modules/storage/services/storage.service';
import { FileUploadService } from '@backend/modules/storage/services/file-upload.service';
import { MediaService } from '@backend/modules/storage/services/media.service';
import { UploadController } from '@backend/modules/storage/controllers/upload.controller';
import { AdminStorageRouter } from '@backend/modules/storage/routers/admin-storage.router';
import { AdminMediaRouter } from '@backend/modules/storage/routers/admin-media.router';
import { SharedModule } from '@backend/modules/shared/shared.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([SettingEntity, Media, MediaRelation]),
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
export class StorageModule { }