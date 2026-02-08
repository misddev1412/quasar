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
import { Post } from '@backend/modules/posts/entities/post.entity';

@Entity('post_categories')
@Index(['slug'])
@Index(['parentId'])
export class PostCategory extends BaseEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  name: string;

  @Column({ unique: true })
  slug: string;

  @Column('text', { nullable: true })
  description: string;

  @Column('uuid', { name: 'parent_id', nullable: true })
  parentId: string;

  @Column({ name: 'sort_order', type: 'int', default: 0 })
  sortOrder: number;

  @Column({ name: 'is_active', type: 'boolean', default: true })
  isActive: boolean;

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
