# Development Guide

This guide explains how to extend and work with the tRPC architecture in this project.

## Table of Contents

- [Project Structure](#project-structure)
- [Adding New Features](#adding-new-features)
- [Creating New Routers](#creating-new-routers)
- [Database Operations](#database-operations)
- [Authentication & Authorization](#authentication--authorization)
- [Testing](#testing)
- [Deployment](#deployment)
- [Best Practices](#best-practices)

## Project Structure

### Backend Architecture

```
apps/backend/src/
├── app/                    # Main application module
├── auth/                   # Authentication system
│   ├── guards/            # Auth guards
│   ├── strategies/        # Passport strategies
│   └── auth.service.ts    # Auth service
├── modules/               # Feature modules
│   ├── admin/            # Admin-specific features
│   ├── client/           # Client-specific features
│   └── user/             # Core user functionality
│       ├── entities/     # TypeORM entities
│       ├── repositories/ # Data access layer
│       └── services/     # Business logic
├── trpc/                 # tRPC implementation
│   ├── routers/         # tRPC routers
│   ├── middlewares/     # tRPC middlewares
│   ├── context.ts       # tRPC context setup
│   └── trpc.ts          # tRPC configuration
└── types/               # Shared type definitions
```

### Frontend Architecture

```
apps/client/src/          # Client application
├── utils/
│   ├── trpc.ts          # tRPC client setup
│   └── auth.ts          # Auth utilities
├── pages/               # Next.js pages
├── components/          # React components
└── styles/              # CSS/SCSS styles

apps/admin/src/           # Admin application
├── utils/
│   └── trpc.ts          # tRPC client setup
├── pages/               # Admin pages
└── components/          # Admin components
```

## Adding New Features

### 1. Backend Feature Development

#### Step 1: Create Entity (if needed)

```typescript
// apps/backend/src/modules/posts/entities/post.entity.ts
import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, CreateDateColumn, UpdateDateColumn } from 'typeorm';
import { User } from '../../user/entities/user.entity';

@Entity('posts')
export class Post {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  title: string;

  @Column('text')
  content: string;

  @Column({ default: false })
  published: boolean;

  @ManyToOne(() => User, user => user.posts)
  author: User;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
```

#### Step 2: Create Repository

```typescript
// apps/backend/src/modules/posts/repositories/post.repository.ts
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Post } from '../entities/post.entity';

export interface CreatePostData {
  title: string;
  content: string;
  authorId: string;
  published?: boolean;
}

export interface UpdatePostData {
  title?: string;
  content?: string;
  published?: boolean;
}

@Injectable()
export class PostRepository {
  constructor(
    @InjectRepository(Post)
    private readonly postRepo: Repository<Post>
  ) {}

  async create(data: CreatePostData): Promise<Post> {
    const post = this.postRepo.create({
      title: data.title,
      content: data.content,
      published: data.published ?? false,
      author: { id: data.authorId } as any,
    });
    return await this.postRepo.save(post);
  }

  async findById(id: string): Promise<Post | null> {
    return await this.postRepo.findOne({
      where: { id },
      relations: ['author'],
    });
  }

  async findByAuthor(authorId: string): Promise<Post[]> {
    return await this.postRepo.find({
      where: { author: { id: authorId } },
      relations: ['author'],
      order: { createdAt: 'DESC' },
    });
  }

  async update(id: string, data: UpdatePostData): Promise<Post | null> {
    await this.postRepo.update(id, data);
    return await this.findById(id);
  }

  async delete(id: string): Promise<void> {
    await this.postRepo.delete(id);
  }
}
```

#### Step 3: Create Service

```typescript
// apps/backend/src/modules/posts/services/post.service.ts
import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { PostRepository, CreatePostData, UpdatePostData } from '../repositories/post.repository';
import { Post } from '../entities/post.entity';

export interface CreatePostDto {
  title: string;
  content: string;
  published?: boolean;
}

export interface UpdatePostDto {
  title?: string;
  content?: string;
  published?: boolean;
}

@Injectable()
export class PostService {
  constructor(private readonly postRepository: PostRepository) {}

  async createPost(authorId: string, createPostDto: CreatePostDto): Promise<Post> {
    return await this.postRepository.create({
      ...createPostDto,
      authorId,
    });
  }

  async getPostById(id: string, userId?: string): Promise<Post> {
    const post = await this.postRepository.findById(id);
    if (!post) {
      throw new NotFoundException('Post not found');
    }

    // Check if post is published or user is the author
    if (!post.published && post.author.id !== userId) {
      throw new ForbiddenException('Access denied');
    }

    return post;
  }

  async getUserPosts(userId: string): Promise<Post[]> {
    return await this.postRepository.findByAuthor(userId);
  }

  async updatePost(id: string, userId: string, updatePostDto: UpdatePostDto): Promise<Post> {
    const post = await this.postRepository.findById(id);
    if (!post) {
      throw new NotFoundException('Post not found');
    }

    if (post.author.id !== userId) {
      throw new ForbiddenException('You can only update your own posts');
    }

    return await this.postRepository.update(id, updatePostDto);
  }

  async deletePost(id: string, userId: string): Promise<void> {
    const post = await this.postRepository.findById(id);
    if (!post) {
      throw new NotFoundException('Post not found');
    }

    if (post.author.id !== userId) {
      throw new ForbiddenException('You can only delete your own posts');
    }

    await this.postRepository.delete(id);
  }
}
```

#### Step 4: Create tRPC Router

```typescript
// apps/backend/src/trpc/routers/post.router.ts
import { Inject, Injectable } from '@nestjs/common';
import { Router, Query, Mutation, UseMiddlewares, Input } from 'nestjs-trpc';
import { z } from 'zod';
import { PostService } from '../../modules/posts/services/post.service';
import { AuthMiddleware } from '../middlewares/auth.middleware';
import { AuthenticatedContext } from '../context';

// Zod schemas for validation
const createPostSchema = z.object({
  title: z.string().min(1).max(200),
  content: z.string().min(1),
  published: z.boolean().default(false),
});

const updatePostSchema = z.object({
  title: z.string().min(1).max(200).optional(),
  content: z.string().min(1).optional(),
  published: z.boolean().optional(),
});

const postResponseSchema = z.object({
  id: z.string(),
  title: z.string(),
  content: z.string(),
  published: z.boolean(),
  createdAt: z.date(),
  updatedAt: z.date(),
  author: z.object({
    id: z.string(),
    username: z.string(),
    email: z.string(),
  }),
});

@Injectable()
export class PostRouter {
  constructor(
    @Inject(PostService)
    private readonly postService: PostService,
  ) {}

  @UseMiddlewares(AuthMiddleware)
  @Mutation({
    input: createPostSchema,
    output: postResponseSchema,
  })
  async createPost(
    @Input() input: z.infer<typeof createPostSchema>,
    @Context() ctx: AuthenticatedContext
  ): Promise<z.infer<typeof postResponseSchema>> {
    const post = await this.postService.createPost(ctx.user!.id, input);
    return this.toPostResponse(post);
  }

  @Query({
    input: z.object({ id: z.string() }),
    output: postResponseSchema,
  })
  async getPost(
    @Input() input: { id: string },
    @Context() ctx: AuthenticatedContext
  ): Promise<z.infer<typeof postResponseSchema>> {
    const post = await this.postService.getPostById(input.id, ctx.user?.id);
    return this.toPostResponse(post);
  }

  @UseMiddlewares(AuthMiddleware)
  @Query({
    output: z.array(postResponseSchema),
  })
  async getMyPosts(
    @Context() ctx: AuthenticatedContext
  ): Promise<z.infer<typeof postResponseSchema>[]> {
    const posts = await this.postService.getUserPosts(ctx.user!.id);
    return posts.map(post => this.toPostResponse(post));
  }

  @UseMiddlewares(AuthMiddleware)
  @Mutation({
    input: z.object({ id: z.string() }).merge(updatePostSchema),
    output: postResponseSchema,
  })
  async updatePost(
    @Input() input: { id: string } & z.infer<typeof updatePostSchema>,
    @Context() ctx: AuthenticatedContext
  ): Promise<z.infer<typeof postResponseSchema>> {
    const { id, ...updateData } = input;
    const post = await this.postService.updatePost(id, ctx.user!.id, updateData);
    return this.toPostResponse(post);
  }

  @UseMiddlewares(AuthMiddleware)
  @Mutation({
    input: z.object({ id: z.string() }),
    output: z.void(),
  })
  async deletePost(
    @Input() input: { id: string },
    @Context() ctx: AuthenticatedContext
  ): Promise<void> {
    await this.postService.deletePost(input.id, ctx.user!.id);
  }

  private toPostResponse(post: any): z.infer<typeof postResponseSchema> {
    return {
      id: post.id,
      title: post.title,
      content: post.content,
      published: post.published,
      createdAt: post.createdAt,
      updatedAt: post.updatedAt,
      author: {
        id: post.author.id,
        username: post.author.username,
        email: post.author.email,
      },
    };
  }
}
```

#### Step 5: Create Module

```typescript
// apps/backend/src/modules/posts/post.module.ts
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Post } from './entities/post.entity';
import { PostRepository } from './repositories/post.repository';
import { PostService } from './services/post.service';
import { PostRouter } from '../../trpc/routers/post.router';
import { AuthModule } from '../../auth/auth.module';
import { AuthMiddleware } from '../../trpc/middlewares/auth.middleware';

@Module({
  imports: [
    TypeOrmModule.forFeature([Post]),
    AuthModule,
  ],
  providers: [
    PostService,
    PostRepository,
    PostRouter,
    AuthMiddleware,
  ],
  exports: [PostService],
})
export class PostModule {}
```

#### Step 6: Update App Router

```typescript
// apps/backend/src/types/app-router.ts
import { mergeRouters } from '../trpc/trpc';
import { adminUserRouter } from '../trpc/routers/admin-user.router';
import { clientUserRouter } from '../trpc/routers/client-user.router';
import { postRouter } from '../trpc/routers/post.router';

export const appRouter = mergeRouters(
  adminUserRouter,
  clientUserRouter,
  postRouter,
);

export type AppRouter = typeof appRouter;
```

### 2. Frontend Integration

#### Update tRPC Types

The frontend will automatically get the new types when you rebuild the backend.

#### Use in React Components

```typescript
// apps/client/src/components/PostForm.tsx
import { useState } from 'react';
import { trpc } from '../utils/trpc';

export function CreatePostForm() {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [published, setPublished] = useState(false);

  const createPostMutation = trpc.posts.createPost.useMutation({
    onSuccess: () => {
      // Reset form
      setTitle('');
      setContent('');
      setPublished(false);
      
      // Refetch posts
      utils.posts.getMyPosts.invalidate();
    },
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    await createPostMutation.mutateAsync({
      title,
      content,
      published,
    });
  };

  return (
    <form onSubmit={handleSubmit}>
      <div>
        <label>Title:</label>
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          required
        />
      </div>
      
      <div>
        <label>Content:</label>
        <textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          required
        />
      </div>
      
      <div>
        <label>
          <input
            type="checkbox"
            checked={published}
            onChange={(e) => setPublished(e.target.checked)}
          />
          Published
        </label>
      </div>
      
      <button type="submit" disabled={createPostMutation.isLoading}>
        {createPostMutation.isLoading ? 'Creating...' : 'Create Post'}
      </button>
    </form>
  );
}
```

## Creating New Routers

### Router Naming Convention

- Use descriptive names: `PostRouter`, `CommentRouter`, `ProductRouter`
- Group related functionality in the same router
- Separate admin and client functionality when needed

### Router Structure Template

```typescript
@Injectable()
export class [Feature]Router {
  constructor(
    @Inject([Feature]Service)
    private readonly [feature]Service: [Feature]Service,
  ) {}

  // Public procedures (no middleware)
  @Query({...})
  async getPublic[Feature]() {}

  // Protected procedures (AuthMiddleware)
  @UseMiddlewares(AuthMiddleware)
  @Query({...})
  async get[Feature]() {}

  @UseMiddlewares(AuthMiddleware)
  @Mutation({...})
  async create[Feature]() {}

  @UseMiddlewares(AuthMiddleware)
  @Mutation({...})
  async update[Feature]() {}

  @UseMiddlewares(AuthMiddleware)
  @Mutation({...})
  async delete[Feature]() {}

  // Admin-only procedures
  @UseMiddlewares(AuthMiddleware, AdminRoleMiddleware)
  @Query({...})
  async admin[Feature]List() {}

  // Helper methods
  private to[Feature]Response(entity: [Feature]): [Feature]Response {
    // Transform entity to response format
  }
}
```

## Database Operations

### Creating Migrations

```bash
# Generate migration
yarn nx run backend:migration:generate --name=CreatePostsTable

# Run migrations
yarn nx run backend:migration:run

# Revert last migration
yarn nx run backend:migration:revert
```

### Entity Relationships

```typescript
// One-to-Many
@Entity()
export class User {
  @OneToMany(() => Post, post => post.author)
  posts: Post[];
}

@Entity()
export class Post {
  @ManyToOne(() => User, user => user.posts)
  author: User;
}

// Many-to-Many
@Entity()
export class Post {
  @ManyToMany(() => Tag)
  @JoinTable()
  tags: Tag[];
}

@Entity()
export class Tag {
  @ManyToMany(() => Post, post => post.tags)
  posts: Post[];
}
```

### Repository Best Practices

```typescript
@Injectable()
export class PostRepository {
  constructor(
    @InjectRepository(Post)
    private readonly postRepo: Repository<Post>
  ) {}

  // Always use specific find methods
  async findById(id: string): Promise<Post | null> {
    return await this.postRepo.findOne({
      where: { id },
      relations: ['author', 'tags'], // Load relations explicitly
    });
  }

  // Use query builder for complex queries
  async findPostsWithFilters(filters: PostFilters): Promise<Post[]> {
    const query = this.postRepo.createQueryBuilder('post')
      .leftJoinAndSelect('post.author', 'author')
      .leftJoinAndSelect('post.tags', 'tags');

    if (filters.published !== undefined) {
      query.andWhere('post.published = :published', { published: filters.published });
    }

    if (filters.authorId) {
      query.andWhere('author.id = :authorId', { authorId: filters.authorId });
    }

    if (filters.search) {
      query.andWhere(
        '(post.title ILIKE :search OR post.content ILIKE :search)',
        { search: `%${filters.search}%` }
      );
    }

    return await query
      .orderBy('post.createdAt', 'DESC')
      .limit(filters.limit || 10)
      .offset((filters.page - 1) * (filters.limit || 10))
      .getMany();
  }

  // Use transactions for complex operations
  async createPostWithTags(
    postData: CreatePostData,
    tagIds: string[]
  ): Promise<Post> {
    return await this.postRepo.manager.transaction(async manager => {
      // Create post
      const post = manager.create(Post, postData);
      await manager.save(post);

      // Add tags
      const tags = await manager.findByIds(Tag, tagIds);
      post.tags = tags;
      await manager.save(post);

      return post;
    });
  }
}
```

## Authentication & Authorization

### Custom Middleware

```typescript
// apps/backend/src/trpc/middlewares/ownership.middleware.ts
import { Injectable } from '@nestjs/common';
import { TRPCError } from '@trpc/server';
import { TRPCMiddleware, MiddlewareOptions, MiddlewareResponse } from 'nestjs-trpc';
import { AuthenticatedContext } from '../context';

@Injectable()
export class OwnershipMiddleware implements TRPCMiddleware {
  constructor(
    private readonly resourceService: any, // Inject relevant service
    private readonly resourceIdField = 'id'
  ) {}

  async use(opts: MiddlewareOptions<AuthenticatedContext>): Promise<MiddlewareResponse> {
    const { ctx, next, input } = opts;
    
    if (!ctx.user) {
      throw new TRPCError({
        code: 'UNAUTHORIZED',
        message: 'Authentication required',
      });
    }

    // Extract resource ID from input
    const resourceId = (input as any)[this.resourceIdField];
    if (!resourceId) {
      throw new TRPCError({
        code: 'BAD_REQUEST',
        message: 'Resource ID required',
      });
    }

    // Check ownership
    const resource = await this.resourceService.findById(resourceId);
    if (!resource) {
      throw new TRPCError({
        code: 'NOT_FOUND',
        message: 'Resource not found',
      });
    }

    if (resource.authorId !== ctx.user.id) {
      throw new TRPCError({
        code: 'FORBIDDEN',
        message: 'Access denied: You can only modify your own resources',
      });
    }

    return next({
      ctx: {
        ...ctx,
        resource, // Add resource to context
      },
    });
  }
}
```

### Role-Based Permissions

```typescript
// apps/backend/src/trpc/middlewares/permissions.middleware.ts
import { Injectable } from '@nestjs/common';
import { TRPCError } from '@trpc/server';
import { TRPCMiddleware, MiddlewareOptions, MiddlewareResponse } from 'nestjs-trpc';
import { AuthenticatedContext } from '../context';
import { UserRole } from '../../modules/user/entities/user.entity';

export class RequirePermissions {
  static create(requiredRoles: UserRole[]) {
    @Injectable()
    class PermissionsMiddleware implements TRPCMiddleware {
      async use(opts: MiddlewareOptions<AuthenticatedContext>): Promise<MiddlewareResponse> {
        const { ctx, next } = opts;
        
        if (!ctx.user) {
          throw new TRPCError({
            code: 'UNAUTHORIZED',
            message: 'Authentication required',
          });
        }

        if (!requiredRoles.includes(ctx.user.role)) {
          throw new TRPCError({
            code: 'FORBIDDEN',
            message: `Access denied: Requires one of: ${requiredRoles.join(', ')}`,
          });
        }

        return next({ ctx });
      }
    }
    
    return PermissionsMiddleware;
  }
}

// Usage in router
@UseMiddlewares(
  AuthMiddleware,
  RequirePermissions.create([UserRole.ADMIN, UserRole.SUPER_ADMIN])
)
@Mutation({...})
async adminOnlyFunction() {}
```

## Testing

### Unit Testing Services

```typescript
// apps/backend/src/modules/posts/services/post.service.spec.ts
import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException, ForbiddenException } from '@nestjs/common';
import { PostService } from './post.service';
import { PostRepository } from '../repositories/post.repository';
import { Post } from '../entities/post.entity';

describe('PostService', () => {
  let service: PostService;
  let repository: jest.Mocked<PostRepository>;

  beforeEach(async () => {
    const mockRepository = {
      create: jest.fn(),
      findById: jest.fn(),
      findByAuthor: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PostService,
        {
          provide: PostRepository,
          useValue: mockRepository,
        },
      ],
    }).compile();

    service = module.get<PostService>(PostService);
    repository = module.get(PostRepository);
  });

  describe('getPostById', () => {
    it('should return post when found and published', async () => {
      const mockPost = {
        id: '1',
        title: 'Test Post',
        published: true,
        author: { id: 'user-1' },
      } as Post;

      repository.findById.mockResolvedValue(mockPost);

      const result = await service.getPostById('1');
      expect(result).toEqual(mockPost);
    });

    it('should throw NotFoundException when post not found', async () => {
      repository.findById.mockResolvedValue(null);

      await expect(service.getPostById('1')).rejects.toThrow(NotFoundException);
    });

    it('should throw ForbiddenException when accessing unpublished post of another user', async () => {
      const mockPost = {
        id: '1',
        published: false,
        author: { id: 'other-user' },
      } as Post;

      repository.findById.mockResolvedValue(mockPost);

      await expect(service.getPostById('1', 'user-1')).rejects.toThrow(ForbiddenException);
    });
  });
});
```

### Integration Testing tRPC

```typescript
// apps/backend/src/trpc/routers/post.router.spec.ts
import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { PostRouter } from './post.router';
import { PostService } from '../../modules/posts/services/post.service';

describe('PostRouter (Integration)', () => {
  let app: INestApplication;
  let postService: jest.Mocked<PostService>;

  beforeEach(async () => {
    const mockPostService = {
      createPost: jest.fn(),
      getPostById: jest.fn(),
      getUserPosts: jest.fn(),
      updatePost: jest.fn(),
      deletePost: jest.fn(),
    };

    const moduleFixture: TestingModule = await Test.createTestingModule({
      providers: [
        PostRouter,
        {
          provide: PostService,
          useValue: mockPostService,
        },
      ],
    }).compile();

    app = moduleFixture.createNestApplication();
    postService = moduleFixture.get(PostService);
    await app.init();
  });

  it('should create post with valid auth', async () => {
    const mockPost = { id: '1', title: 'Test', content: 'Content' };
    postService.createPost.mockResolvedValue(mockPost as any);

    const response = await request(app.getHttpServer())
      .post('/trpc/posts.createPost')
      .set('Authorization', 'Bearer valid-token')
      .send({
        title: 'Test Post',
        content: 'Test content',
        published: false,
      })
      .expect(200);

    expect(response.body.result.data).toMatchObject(mockPost);
  });
});
```

### Frontend Testing

```typescript
// apps/client/src/components/PostForm.test.tsx
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { CreatePostForm } from './PostForm';
import { trpc } from '../utils/trpc';

// Mock tRPC
jest.mock('../utils/trpc', () => ({
  trpc: {
    posts: {
      createPost: {
        useMutation: jest.fn(),
      },
    },
  },
}));

describe('CreatePostForm', () => {
  let queryClient: QueryClient;

  beforeEach(() => {
    queryClient = new QueryClient({
      defaultOptions: {
        queries: { retry: false },
        mutations: { retry: false },
      },
    });
  });

  it('should submit form with correct data', async () => {
    const mockMutate = jest.fn();
    (trpc.posts.createPost.useMutation as jest.Mock).mockReturnValue({
      mutateAsync: mockMutate,
      isLoading: false,
    });

    render(
      <QueryClientProvider client={queryClient}>
        <CreatePostForm />
      </QueryClientProvider>
    );

    fireEvent.change(screen.getByLabelText(/title/i), {
      target: { value: 'Test Title' },
    });
    fireEvent.change(screen.getByLabelText(/content/i), {
      target: { value: 'Test Content' },
    });
    fireEvent.click(screen.getByRole('button', { name: /create post/i }));

    await waitFor(() => {
      expect(mockMutate).toHaveBeenCalledWith({
        title: 'Test Title',
        content: 'Test Content',
        published: false,
      });
    });
  });
});
```

## Best Practices

### Schema Design

```typescript
// Use discriminated unions for better type safety
const createPostSchema = z.discriminatedUnion('type', [
  z.object({
    type: z.literal('draft'),
    title: z.string(),
    content: z.string(),
  }),
  z.object({
    type: z.literal('published'),
    title: z.string(),
    content: z.string(),
    publishedAt: z.date(),
    tags: z.array(z.string()),
  }),
]);

// Use brand types for IDs
const userIdSchema = z.string().uuid().brand('UserId');
const postIdSchema = z.string().uuid().brand('PostId');

// Create reusable schemas
const paginationSchema = z.object({
  page: z.number().min(1).default(1),
  limit: z.number().min(1).max(100).default(10),
});

const timestampsSchema = z.object({
  createdAt: z.date(),
  updatedAt: z.date(),
});
```

### Error Handling

```typescript
// Create custom error classes
export class PostNotFoundError extends Error {
  constructor(id: string) {
    super(`Post with ID ${id} not found`);
    this.name = 'PostNotFoundError';
  }
}

// Handle errors consistently in services
async getPostById(id: string): Promise<Post> {
  const post = await this.repository.findById(id);
  if (!post) {
    throw new PostNotFoundError(id);
  }
  return post;
}

// Map errors in tRPC routers
@Query({...})
async getPost(@Input() input: { id: string }) {
  try {
    return await this.postService.getPostById(input.id);
  } catch (error) {
    if (error instanceof PostNotFoundError) {
      throw new TRPCError({
        code: 'NOT_FOUND',
        message: error.message,
      });
    }
    throw new TRPCError({
      code: 'INTERNAL_SERVER_ERROR',
      message: 'An unexpected error occurred',
    });
  }
}
```

### Performance Optimization

```typescript
// Use select to fetch only needed fields
async findById(id: string): Promise<Post> {
  return await this.postRepo.findOne({
    where: { id },
    select: ['id', 'title', 'content', 'published', 'createdAt'],
    relations: ['author'],
  });
}

// Implement pagination properly
async findPaginated(options: PaginationOptions): Promise<PaginatedResult<Post>> {
  const [items, total] = await this.postRepo.findAndCount({
    take: options.limit,
    skip: (options.page - 1) * options.limit,
    order: { createdAt: 'DESC' },
  });

  return {
    items,
    total,
    page: options.page,
    limit: options.limit,
    totalPages: Math.ceil(total / options.limit),
  };
}

// Use batch loading for N+1 queries
@UseMiddlewares(AuthMiddleware)
@Query({...})
async getUserPosts(@Context() ctx: AuthenticatedContext) {
  // Use DataLoader or batch queries
  return await this.postService.batchLoadUserPosts([ctx.user!.id]);
}
```

### Security

```typescript
// Validate and sanitize input
const createPostSchema = z.object({
  title: z.string()
    .min(1, 'Title is required')
    .max(200, 'Title too long')
    .refine(title => !title.includes('<script>'), 'Invalid characters'),
  content: z.string()
    .min(1, 'Content is required')
    .transform(content => sanitizeHtml(content)),
});

// Use rate limiting (with a custom middleware)
@UseMiddlewares(AuthMiddleware, RateLimitMiddleware({ maxRequests: 10, windowMs: 60000 }))
@Mutation({...})
async createPost() {}

// Log security events
@UseMiddlewares(AuthMiddleware, AdminRoleMiddleware)
@Mutation({...})
async deleteUser(@Input() input: { id: string }, @Context() ctx: AuthenticatedContext) {
  this.logger.warn(`Admin ${ctx.user!.username} deleted user ${input.id}`);
  return await this.userService.deleteUser(input.id);
}
```

This development guide provides a comprehensive foundation for extending the tRPC architecture. Follow these patterns and practices to maintain consistency and quality as the application grows. 