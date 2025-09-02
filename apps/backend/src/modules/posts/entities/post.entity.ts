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
