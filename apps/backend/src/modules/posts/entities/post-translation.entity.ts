import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  Index,
} from 'typeorm';
import { BaseEntity } from '@shared';
import { Post } from './post.entity';

@Entity('post_translations')
@Index(['post_id', 'locale'], { unique: true })
@Index(['locale'])
@Index(['slug'])
export class PostTranslation extends BaseEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column('uuid')
  post_id: string;

  @Column({ length: 5 })
  locale: string;

  @Column()
  title: string;

  @Column({ unique: true })
  slug: string;

  @Column('text')
  content: string;

  @Column('text', { nullable: true })
  excerpt: string;

  @Column({ nullable: true })
  meta_title: string;

  @Column('text', { nullable: true })
  meta_description: string;

  @Column('text', { nullable: true })
  meta_keywords: string;

  // Relations
  @ManyToOne(() => Post, (post) => post.translations, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'post_id' })
  post: Post;
}
