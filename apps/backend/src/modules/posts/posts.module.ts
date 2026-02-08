import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Post } from '@backend/modules/posts/entities/post.entity';
import { PostTranslation } from '@backend/modules/posts/entities/post-translation.entity';
import { PostCategory } from '@backend/modules/posts/entities/post-category.entity';
import { PostTag } from '@backend/modules/posts/entities/post-tag.entity';
import { PostRepository } from '@backend/modules/posts/repositories/post.repository';
import { PostCategoryRepository } from '@backend/modules/posts/repositories/post-category.repository';
import { PostTagRepository } from '@backend/modules/posts/repositories/post-tag.repository';
import { AdminPostsService } from '@backend/modules/posts/services/admin-posts.service';
import { ClientPostsService } from '@backend/modules/posts/services/client-posts.service';
import { AdminPostsRouter } from '@backend/modules/posts/routers/admin-posts.router';
import { AdminPostCategoriesRouter } from '@backend/modules/posts/routers/admin-post-categories.router';
import { AdminPostTagsRouter } from '@backend/modules/posts/routers/admin-post-tags.router';
import { SharedModule } from '@backend/modules/shared/shared.module';
import { StorageModule } from '@backend/modules/storage/storage.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Post,
      PostTranslation,
      PostCategory,
      PostTag,
    ]),
    SharedModule,
    StorageModule,
  ],
  providers: [
    PostRepository,
    PostCategoryRepository,
    PostTagRepository,
    AdminPostsService,
    ClientPostsService,
    AdminPostsRouter,
    AdminPostCategoriesRouter,
    AdminPostTagsRouter,
  ],
  exports: [
    PostRepository,
    PostCategoryRepository,
    PostTagRepository,
    AdminPostsService,
    ClientPostsService,
    AdminPostsRouter,
    AdminPostCategoriesRouter,
    AdminPostTagsRouter,
  ],
})
export class PostsModule { }
