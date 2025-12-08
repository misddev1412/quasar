import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToMany,
  Index,
} from 'typeorm';
import { BaseEntity } from '@shared';
import { Post } from './post.entity';

@Entity('post_tags')
@Index(['slug'])
@Index(['name'])
export class PostTag extends BaseEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  name: string;

  @Column({ unique: true })
  slug: string;

  @Column('text', { nullable: true })
  description: string;

  @Column({ length: 7, nullable: true })
  color: string;

  @Column({ type: 'boolean', default: true })
  is_active: boolean;

  // Relations
  @ManyToMany(() => Post, (post) => post.tags)
  posts: Post[];
}
