import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  OneToMany,
  ManyToMany,
  JoinColumn,
  Index,
} from 'typeorm';
import { BaseEntity } from '@shared';
import { Post } from './post.entity';

@Entity('post_categories')
@Index(['slug'])
@Index(['parent_id'])
export class PostCategory extends BaseEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  name: string;

  @Column({ unique: true })
  slug: string;

  @Column('text', { nullable: true })
  description: string;

  @Column('uuid', { nullable: true })
  parent_id: string;

  @Column({ type: 'int', default: 0 })
  sort_order: number;

  @Column({ type: 'boolean', default: true })
  is_active: boolean;

  // Relations
  @ManyToOne(() => PostCategory, (category) => category.children, {
    onDelete: 'SET NULL',
  })
  @JoinColumn({ name: 'parent_id' })
  parent: PostCategory;

  @OneToMany(() => PostCategory, (category) => category.parent)
  children: PostCategory[];

  @ManyToMany(() => Post, (post) => post.categories)
  posts: Post[];
}
