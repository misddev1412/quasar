import { MigrationInterface, QueryRunner, Table } from "typeorm";

export class CreatePostsTables1752500000000 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
        // Create posts table
        await queryRunner.createTable(new Table({
            name: 'posts',
            columns: [
                {
                    name: 'id',
                    type: 'uuid',
                    isPrimary: true,
                    generationStrategy: 'uuid',
                    default: 'gen_random_uuid()'
                },
                {
                    name: 'slug',
                    type: 'varchar',
                    isUnique: true,
                    isNullable: false
                },
                {
                    name: 'status',
                    type: 'enum',
                    enum: ['draft', 'published', 'archived', 'scheduled'],
                    default: "'draft'"
                },
                {
                    name: 'type',
                    type: 'enum',
                    enum: ['post', 'page', 'news', 'event'],
                    default: "'post'"
                },
                {
                    name: 'featured_image',
                    type: 'varchar',
                    isNullable: true
                },
                {
                    name: 'author_id',
                    type: 'uuid',
                    isNullable: false
                },
                {
                    name: 'published_at',
                    type: 'timestamp',
                    isNullable: true
                },
                {
                    name: 'scheduled_at',
                    type: 'timestamp',
                    isNullable: true
                },
                {
                    name: 'view_count',
                    type: 'int',
                    default: 0
                },
                {
                    name: 'is_featured',
                    type: 'boolean',
                    default: false
                },
                {
                    name: 'allow_comments',
                    type: 'boolean',
                    default: true
                },
                {
                    name: 'meta_title',
                    type: 'varchar',
                    isNullable: true
                },
                {
                    name: 'meta_description',
                    type: 'text',
                    isNullable: true
                },
                {
                    name: 'meta_keywords',
                    type: 'text',
                    isNullable: true
                },
                // BaseEntity fields
                {
                    name: 'created_at',
                    type: 'timestamp',
                    default: 'CURRENT_TIMESTAMP'
                },
                {
                    name: 'updated_at',
                    type: 'timestamp',
                    default: 'CURRENT_TIMESTAMP'
                },
                {
                    name: 'version',
                    type: 'int',
                    default: 1
                },
                {
                    name: 'created_by',
                    type: 'uuid',
                    isNullable: true
                },
                {
                    name: 'updated_by',
                    type: 'uuid',
                    isNullable: true
                }
            ],
            foreignKeys: [
                {
                    columnNames: ['author_id'],
                    referencedTableName: 'users',
                    referencedColumnNames: ['id'],
                    onDelete: 'CASCADE'
                }
            ],
            indices: [
                {
                    name: 'IDX_POSTS_SLUG',
                    columnNames: ['slug']
                },
                {
                    name: 'IDX_POSTS_STATUS',
                    columnNames: ['status']
                },
                {
                    name: 'IDX_POSTS_TYPE',
                    columnNames: ['type']
                },
                {
                    name: 'IDX_POSTS_PUBLISHED_AT',
                    columnNames: ['published_at']
                },
                {
                    name: 'IDX_POSTS_AUTHOR_ID',
                    columnNames: ['author_id']
                }
            ]
        }), true);

        // Create post_translations table
        await queryRunner.createTable(new Table({
            name: 'post_translations',
            columns: [
                {
                    name: 'id',
                    type: 'uuid',
                    isPrimary: true,
                    generationStrategy: 'uuid',
                    default: 'gen_random_uuid()'
                },
                {
                    name: 'post_id',
                    type: 'uuid',
                    isNullable: false
                },
                {
                    name: 'locale',
                    type: 'varchar',
                    length: '5',
                    isNullable: false
                },
                {
                    name: 'title',
                    type: 'varchar',
                    isNullable: false
                },
                {
                    name: 'content',
                    type: 'text',
                    isNullable: false
                },
                {
                    name: 'excerpt',
                    type: 'text',
                    isNullable: true
                },
                {
                    name: 'meta_title',
                    type: 'varchar',
                    isNullable: true
                },
                {
                    name: 'meta_description',
                    type: 'text',
                    isNullable: true
                },
                {
                    name: 'meta_keywords',
                    type: 'text',
                    isNullable: true
                },
                // BaseEntity fields
                {
                    name: 'created_at',
                    type: 'timestamp',
                    default: 'CURRENT_TIMESTAMP'
                },
                {
                    name: 'updated_at',
                    type: 'timestamp',
                    default: 'CURRENT_TIMESTAMP'
                },
                {
                    name: 'version',
                    type: 'int',
                    default: 1
                },
                {
                    name: 'created_by',
                    type: 'uuid',
                    isNullable: true
                },
                {
                    name: 'updated_by',
                    type: 'uuid',
                    isNullable: true
                }
            ],
            foreignKeys: [
                {
                    columnNames: ['post_id'],
                    referencedTableName: 'posts',
                    referencedColumnNames: ['id'],
                    onDelete: 'CASCADE'
                }
            ],
            indices: [
                {
                    name: 'IDX_POST_TRANSLATIONS_POST_ID_LOCALE',
                    columnNames: ['post_id', 'locale'],
                    isUnique: true
                },
                {
                    name: 'IDX_POST_TRANSLATIONS_LOCALE',
                    columnNames: ['locale']
                }
            ]
        }), true);

        // Create post_categories table
        await queryRunner.createTable(new Table({
            name: 'post_categories',
            columns: [
                {
                    name: 'id',
                    type: 'uuid',
                    isPrimary: true,
                    generationStrategy: 'uuid',
                    default: 'gen_random_uuid()'
                },
                {
                    name: 'name',
                    type: 'varchar',
                    isNullable: false
                },
                {
                    name: 'slug',
                    type: 'varchar',
                    isUnique: true,
                    isNullable: false
                },
                {
                    name: 'description',
                    type: 'text',
                    isNullable: true
                },
                {
                    name: 'parent_id',
                    type: 'uuid',
                    isNullable: true
                },
                {
                    name: 'sort_order',
                    type: 'int',
                    default: 0
                },
                {
                    name: 'is_active',
                    type: 'boolean',
                    default: true
                },
                // BaseEntity fields
                {
                    name: 'created_at',
                    type: 'timestamp',
                    default: 'CURRENT_TIMESTAMP'
                },
                {
                    name: 'updated_at',
                    type: 'timestamp',
                    default: 'CURRENT_TIMESTAMP'
                },
                {
                    name: 'version',
                    type: 'int',
                    default: 1
                },
                {
                    name: 'created_by',
                    type: 'uuid',
                    isNullable: true
                },
                {
                    name: 'updated_by',
                    type: 'uuid',
                    isNullable: true
                }
            ],
            foreignKeys: [
                {
                    columnNames: ['parent_id'],
                    referencedTableName: 'post_categories',
                    referencedColumnNames: ['id'],
                    onDelete: 'SET NULL'
                }
            ],
            indices: [
                {
                    name: 'IDX_POST_CATEGORIES_SLUG',
                    columnNames: ['slug']
                },
                {
                    name: 'IDX_POST_CATEGORIES_PARENT_ID',
                    columnNames: ['parent_id']
                }
            ]
        }), true);

        // Create post_tags table
        await queryRunner.createTable(new Table({
            name: 'post_tags',
            columns: [
                {
                    name: 'id',
                    type: 'uuid',
                    isPrimary: true,
                    generationStrategy: 'uuid',
                    default: 'gen_random_uuid()'
                },
                {
                    name: 'name',
                    type: 'varchar',
                    isNullable: false
                },
                {
                    name: 'slug',
                    type: 'varchar',
                    isUnique: true,
                    isNullable: false
                },
                {
                    name: 'description',
                    type: 'text',
                    isNullable: true
                },
                {
                    name: 'color',
                    type: 'varchar',
                    length: '7',
                    isNullable: true
                },
                {
                    name: 'is_active',
                    type: 'boolean',
                    default: true
                },
                // BaseEntity fields
                {
                    name: 'created_at',
                    type: 'timestamp',
                    default: 'CURRENT_TIMESTAMP'
                },
                {
                    name: 'updated_at',
                    type: 'timestamp',
                    default: 'CURRENT_TIMESTAMP'
                },
                {
                    name: 'version',
                    type: 'int',
                    default: 1
                },
                {
                    name: 'created_by',
                    type: 'uuid',
                    isNullable: true
                },
                {
                    name: 'updated_by',
                    type: 'uuid',
                    isNullable: true
                }
            ],
            indices: [
                {
                    name: 'IDX_POST_TAGS_SLUG',
                    columnNames: ['slug']
                },
                {
                    name: 'IDX_POST_TAGS_NAME',
                    columnNames: ['name']
                }
            ]
        }), true);

        // Create post_category_relations table (junction table)
        await queryRunner.createTable(new Table({
            name: 'post_category_relations',
            columns: [
                {
                    name: 'id',
                    type: 'uuid',
                    isPrimary: true,
                    generationStrategy: 'uuid',
                    default: 'gen_random_uuid()'
                },
                {
                    name: 'post_id',
                    type: 'uuid',
                    isNullable: false
                },
                {
                    name: 'category_id',
                    type: 'uuid',
                    isNullable: false
                },
                // BaseEntity fields
                {
                    name: 'created_at',
                    type: 'timestamp',
                    default: 'CURRENT_TIMESTAMP'
                },
                {
                    name: 'updated_at',
                    type: 'timestamp',
                    default: 'CURRENT_TIMESTAMP'
                },
                {
                    name: 'version',
                    type: 'int',
                    default: 1
                },
                {
                    name: 'created_by',
                    type: 'uuid',
                    isNullable: true
                },
                {
                    name: 'updated_by',
                    type: 'uuid',
                    isNullable: true
                }
            ],
            foreignKeys: [
                {
                    columnNames: ['post_id'],
                    referencedTableName: 'posts',
                    referencedColumnNames: ['id'],
                    onDelete: 'CASCADE'
                },
                {
                    columnNames: ['category_id'],
                    referencedTableName: 'post_categories',
                    referencedColumnNames: ['id'],
                    onDelete: 'CASCADE'
                }
            ],
            indices: [
                {
                    name: 'IDX_POST_CATEGORY_RELATIONS_POST_ID_CATEGORY_ID',
                    columnNames: ['post_id', 'category_id'],
                    isUnique: true
                }
            ]
        }), true);

        // Create post_tag_relations table (junction table)
        await queryRunner.createTable(new Table({
            name: 'post_tag_relations',
            columns: [
                {
                    name: 'id',
                    type: 'uuid',
                    isPrimary: true,
                    generationStrategy: 'uuid',
                    default: 'gen_random_uuid()'
                },
                {
                    name: 'post_id',
                    type: 'uuid',
                    isNullable: false
                },
                {
                    name: 'tag_id',
                    type: 'uuid',
                    isNullable: false
                },
                // BaseEntity fields
                {
                    name: 'created_at',
                    type: 'timestamp',
                    default: 'CURRENT_TIMESTAMP'
                },
                {
                    name: 'updated_at',
                    type: 'timestamp',
                    default: 'CURRENT_TIMESTAMP'
                },
                {
                    name: 'version',
                    type: 'int',
                    default: 1
                },
                {
                    name: 'created_by',
                    type: 'uuid',
                    isNullable: true
                },
                {
                    name: 'updated_by',
                    type: 'uuid',
                    isNullable: true
                }
            ],
            foreignKeys: [
                {
                    columnNames: ['post_id'],
                    referencedTableName: 'posts',
                    referencedColumnNames: ['id'],
                    onDelete: 'CASCADE'
                },
                {
                    columnNames: ['tag_id'],
                    referencedTableName: 'post_tags',
                    referencedColumnNames: ['id'],
                    onDelete: 'CASCADE'
                }
            ],
            indices: [
                {
                    name: 'IDX_POST_TAG_RELATIONS_POST_ID_TAG_ID',
                    columnNames: ['post_id', 'tag_id'],
                    isUnique: true
                }
            ]
        }), true);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.dropTable('post_tag_relations');
        await queryRunner.dropTable('post_category_relations');
        await queryRunner.dropTable('post_tags');
        await queryRunner.dropTable('post_categories');
        await queryRunner.dropTable('post_translations');
        await queryRunner.dropTable('posts');
    }
}
