import { Column, Entity, Index } from 'typeorm';
import { SoftDeletableEntity } from '@shared';
import { SiteContentCategory, SiteContentStatus } from '@shared/enums/site-content.enums';

@Entity('site_contents')
@Index('IDX_site_contents_category', ['category'])
@Index('IDX_site_contents_status', ['status'])
@Index('IDX_site_contents_language_code', ['languageCode'])
@Index('IDX_site_contents_is_featured', ['isFeatured'])
@Index('IDX_site_contents_display_order', ['displayOrder'])
@Index('UQ_site_contents_code', ['code'], { unique: true })
@Index('UQ_site_contents_slug', ['slug'], { unique: true })
export class SiteContentEntity extends SoftDeletableEntity {
  @Column({
    name: 'code',
    type: 'varchar',
    length: 100,
    unique: true,
    comment: 'Stable identifier used to reference the page (e.g. privacy_policy)',
  })
  code!: string;

  @Column({
    name: 'title',
    type: 'varchar',
    length: 255,
    comment: 'Display title for storefront usage',
  })
  title!: string;

  @Column({
    name: 'slug',
    type: 'varchar',
    length: 255,
    unique: true,
    comment: 'URL friendly slug for routing on storefront',
  })
  slug!: string;

  @Column({
    name: 'category',
    type: 'enum',
    enum: SiteContentCategory,
    default: SiteContentCategory.INFORMATION,
    comment: 'Broad classification such as policy, guide, about, etc.',
  })
  category!: SiteContentCategory;

  @Column({
    name: 'status',
    type: 'enum',
    enum: SiteContentStatus,
    default: SiteContentStatus.DRAFT,
    comment: 'Publication lifecycle status',
  })
  status!: SiteContentStatus;

  @Column({
    name: 'summary',
    type: 'text',
    nullable: true,
    comment: 'Optional short summary shown in listings',
  })
  summary?: string;

  @Column({
    name: 'content',
    type: 'text',
    nullable: true,
    comment: 'Rich content body rendered on storefront',
  })
  content?: string;

  @Column({
    name: 'language_code',
    type: 'varchar',
    length: 10,
    default: 'vi',
    comment: 'Language code of the content (e.g. vi, en)',
  })
  languageCode!: string;

  @Column({
    name: 'published_at',
    type: 'timestamp',
    nullable: true,
    comment: 'Timestamp when the page becomes publicly visible',
  })
  publishedAt?: Date;

  @Column({
    name: 'metadata',
    type: 'jsonb',
    nullable: true,
    comment: 'Structured metadata such as SEO configuration',
  })
  metadata?: Record<string, any>;

  @Column({
    name: 'display_order',
    type: 'int',
    default: 0,
    comment: 'Manual ordering for storefront navigation',
  })
  displayOrder!: number;

  @Column({
    name: 'is_featured',
    type: 'boolean',
    default: false,
    comment: 'Highlight page in prominent placements',
  })
  isFeatured!: boolean;
}
