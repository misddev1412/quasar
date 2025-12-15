import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  OneToMany,
  ManyToMany,
  JoinTable,
  JoinColumn,
  Index,
} from 'typeorm';
import { BaseEntity } from '@shared';
import { User } from '../../user/entities/user.entity';
import { PostTranslation } from './post-translation.entity';
import { PostCategory } from './post-category.entity';
import { PostTag } from './post-tag.entity';

export interface PostGalleryImage {
  id?: string;
  url: string;
  alt?: string;
  caption?: string;
  order?: number;
  focalPoint?: { x: number; y: number };
  dominantColor?: string;
}

export interface PostContentHeading {
  id?: string;
  title: string;
  slug: string;
  level: number;
  position: number;
  children?: PostContentHeading[];
}

export interface PostCategoryTocItem {
  id?: string;
  categoryId?: string;
  title: string;
  slug: string;
  url?: string;
  description?: string;
  keywords?: string[];
  children?: PostCategoryTocItem[];
}

export interface PostSocialMetadata {
  og?: {
    title?: string;
    description?: string;
    type?: string;
    url?: string;
    image?: string;
  };
  twitter?: {
    card?: 'summary' | 'summary_large_image' | 'app' | 'player';
    title?: string;
    description?: string;
    image?: string;
    site?: string;
    creator?: string;
  };
  shareImage?: string;
}

export interface StructuredDataBlock {
  '@context'?: string;
  '@type': string;
  data: Record<string, unknown>;
}

export enum PostStatus {
  DRAFT = 'draft',
  PUBLISHED = 'published',
  ARCHIVED = 'archived',
  SCHEDULED = 'scheduled',
}

export enum PostType {
  POST = 'post',
  PAGE = 'page',
  NEWS = 'news',
  EVENT = 'event',
}

@Entity('posts')
@Index(['status'])
@Index(['type'])
@Index(['published_at'])
@Index(['author_id'])
@Index(['is_featured'])
export class Post extends BaseEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({
    type: 'enum',
    enum: PostStatus,
    default: PostStatus.DRAFT,
  })
  status: PostStatus;

  @Column({
    type: 'enum',
    enum: PostType,
    default: PostType.POST,
  })
  type: PostType;

  @Column({ nullable: true })
  featured_image: string;

  @Column('uuid')
  author_id: string;

  @Column({ type: 'timestamp', nullable: true })
  published_at: Date;

  @Column({ type: 'timestamp', nullable: true })
  scheduled_at: Date;

  @Column({ type: 'int', default: 0 })
  view_count: number;

  @Column({ type: 'boolean', default: false })
  is_featured: boolean;

  @Column({ type: 'boolean', default: true })
  allow_comments: boolean;

  @Column({ nullable: true })
  meta_title: string;

  @Column({ type: 'text', nullable: true })
  meta_description: string;

  @Column({ type: 'text', nullable: true })
  meta_keywords: string;

  @Column({ length: 500, nullable: true, name: 'canonical_url' })
  canonical_url?: string;

  @Column({ length: 255, nullable: true, name: 'meta_robots' })
  meta_robots?: string;

  @Column({ type: 'jsonb', nullable: true, name: 'social_metadata' })
  social_metadata?: PostSocialMetadata;

  @Column({
    type: 'jsonb',
    nullable: true,
    name: 'structured_data',
  })
  structured_data?: StructuredDataBlock[];

  @Column({
    type: 'jsonb',
    nullable: true,
    name: 'image_gallery',
  })
  image_gallery?: PostGalleryImage[];

  @Column({
    type: 'jsonb',
    nullable: true,
    name: 'content_table_of_contents',
  })
  content_table_of_contents?: PostContentHeading[];

  @Column({
    type: 'jsonb',
    nullable: true,
    name: 'category_table_of_contents',
  })
  category_table_of_contents?: PostCategoryTocItem[];

  @Column({ type: 'jsonb', nullable: true, name: 'additional_meta' })
  additional_meta?: Record<string, string>;

  @Column({ type: 'int', default: 0, name: 'seo_score' })
  seo_score: number;

  @Column({ type: 'int', nullable: true, name: 'reading_time_minutes' })
  reading_time_minutes?: number;

  // Relations
  @ManyToOne(() => User, { eager: false })
  @JoinColumn({ name: 'author_id' })
  author: User;

  @OneToMany(() => PostTranslation, (translation) => translation.post, {
    cascade: true,
    eager: false,
  })
  translations: PostTranslation[];

  @ManyToMany(() => PostCategory, (category) => category.posts, {
    cascade: false,
  })
  @JoinTable({
    name: 'post_category_relations',
    joinColumn: { name: 'post_id', referencedColumnName: 'id' },
    inverseJoinColumn: { name: 'category_id', referencedColumnName: 'id' },
  })
  categories: PostCategory[];

  @ManyToMany(() => PostTag, (tag) => tag.posts, {
    cascade: false,
  })
  @JoinTable({
    name: 'post_tag_relations',
    joinColumn: { name: 'post_id', referencedColumnName: 'id' },
    inverseJoinColumn: { name: 'tag_id', referencedColumnName: 'id' },
  })
  tags: PostTag[];
}
