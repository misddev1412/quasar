import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Post } from './entities/post.entity';
import { PostTranslation } from './entities/post-translation.entity';
import { PostCategory } from './entities/post-category.entity';
import { PostTag } from './entities/post-tag.entity';
import { PostRepository } from './repositories/post.repository';
import { PostCategoryRepository } from './repositories/post-category.repository';
import { PostTagRepository } from './repositories/post-tag.repository';
import { AdminPostsService } from './services/admin-posts.service';
import { AdminPostsRouter } from './routers/admin-posts.router';
import { AdminPostCategoriesRouter } from './routers/admin-post-categories.router';
import { AdminPostTagsRouter } from './routers/admin-post-tags.router';
import { SharedModule } from '../shared/shared.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Post,
      PostTranslation,
      PostCategory,
      PostTag,
    ]),
    SharedModule,
  ],
  providers: [
    PostRepository,
    PostCategoryRepository,
    PostTagRepository,
    AdminPostsService,
    AdminPostsRouter,
    AdminPostCategoriesRouter,
    AdminPostTagsRouter,
  ],
  exports: [
    PostRepository,
    PostCategoryRepository,
    PostTagRepository,
    AdminPostsService,
    AdminPostsRouter,
    AdminPostCategoriesRouter,
    AdminPostTagsRouter,
  ],
})
export class PostsModule {}
