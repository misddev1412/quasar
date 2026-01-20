import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In } from 'typeorm';
import { ProductBundleEntity } from '../entities/product-bundle.entity';
import { ProductBundleItemEntity, BundleItemMode } from '../entities/product-bundle-item.entity';
import { Category } from '../../products/entities/category.entity';
import { Product } from '../../products/entities/product.entity';
import slugify from 'slugify';

@Injectable()
export class ProductBundlesService {
    constructor(
        @InjectRepository(ProductBundleEntity)
        private readonly productBundleRepository: Repository<ProductBundleEntity>,
        @InjectRepository(ProductBundleItemEntity)
        private readonly productBundleItemRepository: Repository<ProductBundleItemEntity>,
        @InjectRepository(Category)
        private readonly categoryRepository: Repository<Category>,
        @InjectRepository(Product)
        private readonly productRepository: Repository<Product>,
    ) { }

    async create(createDto: any): Promise<ProductBundleEntity> {
        const { name, slug, description, isActive, items } = createDto;

        const bundle = new ProductBundleEntity();
        bundle.name = name;
        bundle.slug = slug || slugify(name, { lower: true });
        bundle.description = description;
        bundle.isActive = isActive ?? true;

        // Save parent first to get ID
        const savedBundle = await this.productBundleRepository.save(bundle);

        if (items && items.length > 0) {
            await this.saveBundleItems(savedBundle, items);
        }

        return this.findOne(savedBundle.id);
    }

    async findAll(options: { skip?: number; take?: number; search?: string } = {}): Promise<[ProductBundleEntity[], number]> {
        const query = this.productBundleRepository.createQueryBuilder('bundle')
            .leftJoinAndSelect('bundle.items', 'items')
            .leftJoinAndSelect('items.categories', 'categories')
            .leftJoinAndSelect('items.products', 'products')
            .skip(options.skip)
            .take(options.take)
            .orderBy('bundle.createdAt', 'DESC');

        if (options.search) {
            query.where('bundle.name ILIKE :search', { search: `%${options.search}%` });
        }

        return query.getManyAndCount();
    }

    async findOne(id: string): Promise<ProductBundleEntity> {
        const bundle = await this.productBundleRepository.findOne({
            where: { id },
            relations: ['items', 'items.categories', 'items.products'],
            order: {
                items: {
                    position: 'ASC'
                }
            }
        });

        if (!bundle) {
            throw new NotFoundException(`Product bundle with ID ${id} not found`);
        }

        return bundle;
    }

    async update(id: string, updateDto: any): Promise<ProductBundleEntity> {
        const bundle = await this.findOne(id);
        const { name, slug, description, isActive, items } = updateDto;

        bundle.name = name;
        if (slug) bundle.slug = slug;
        bundle.description = description;
        if (isActive !== undefined) bundle.isActive = isActive;

        await this.productBundleRepository.save(bundle);

        if (items) {
            // Delete existing items to replace with new ones (could be optimized, but safer for simple logic)
            await this.productBundleItemRepository.delete({ bundleId: id });
            await this.saveBundleItems(bundle, items);
        }

        return this.findOne(id);
    }

    async remove(id: string): Promise<void> {
        const bundle = await this.productBundleRepository.findOne({ where: { id } });
        if (!bundle) return;
        await this.productBundleRepository.remove(bundle);
    }

    private async saveBundleItems(bundle: ProductBundleEntity, itemsDto: any[]) {
        const itemsToSave: ProductBundleItemEntity[] = [];

        for (const [index, itemDto] of itemsDto.entries()) {
            const item = new ProductBundleItemEntity();
            item.bundle = bundle;
            item.label = itemDto.label;
            item.mode = itemDto.mode as BundleItemMode;
            item.position = itemDto.position ?? index;

            if (item.mode === BundleItemMode.CATEGORY && itemDto.categoryIds?.length) {
                const categories = await this.categoryRepository.findBy({ id: In(itemDto.categoryIds) });
                item.categories = categories;
                item.products = [];
            } else if (item.mode === BundleItemMode.PRODUCT && itemDto.productIds?.length) {
                const products = await this.productRepository.findBy({ id: In(itemDto.productIds) });
                item.products = products;
                item.categories = [];
            }

            itemsToSave.push(item);
        }

        await this.productBundleItemRepository.save(itemsToSave);
    }
}
