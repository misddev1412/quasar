import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ComponentConfigEntity } from '../../modules/component-configs/entities/component-config.entity';
import { ComponentStructureType, ComponentCategory } from '@shared/enums/component.enums';

interface ComponentConfigSeed {
  componentKey: string;
  displayName: string;
  description?: string;
  componentType: ComponentStructureType;
  category: ComponentCategory;
  position?: number;
  isEnabled?: boolean;
  defaultConfig?: Record<string, unknown>;
  configSchema?: Record<string, unknown>;
  metadata?: Record<string, unknown>;
  allowedChildKeys?: string[];
  previewMediaUrl?: string;
  slotKey?: string | null;
  children?: ComponentConfigSeed[];
}

const STOREFRONT_COMPONENT_CONFIGS: ComponentConfigSeed[] = [
  {
    componentKey: 'product_card',
    displayName: 'Product Card',
    description: 'Composite card rendered in product grids, wishlists, cross-sell blocks and search results.',
    componentType: ComponentStructureType.COMPOSITE,
    category: ComponentCategory.PRODUCT,
    position: 0,
    defaultConfig: {
      layout: 'vertical',
      imageHeight: 'h-72',
      showAddToCart: true,
      showWishlist: true,
      showQuickView: false,
      showRating: true,
      badgeStyle: 'pill',
      priceDisplay: 'stacked',
      analytics: {
        impressionEvent: 'product_card_impression',
        clickEvent: 'product_card_click',
      },
    },
    configSchema: {
      layout: { type: 'enum', options: ['vertical', 'horizontal'] },
      imageHeight: { type: 'string', description: 'Tailwind height class used for the main image block' },
      showAddToCart: { type: 'boolean' },
      showWishlist: { type: 'boolean' },
      showQuickView: { type: 'boolean' },
      showRating: { type: 'boolean' },
      badgeStyle: { type: 'enum', options: ['pill', 'square'] },
      priceDisplay: { type: 'enum', options: ['stacked', 'inline'] },
    },
    metadata: {
      componentPath: 'apps/frontend/src/components/ecommerce/ProductCard.tsx',
      propsInterface: 'ProductCardProps',
      usedIn: ['ProductGrid', 'ProductList', 'Wishlist', 'CrossSellSection'],
      dataSource: 'products',
    },
    allowedChildKeys: [
      'product_card.media',
      'product_card.badge',
      'product_card.info',
      'product_card.actions',
    ],
    children: [
      {
        componentKey: 'product_card.media',
        displayName: 'Product Media',
        description: 'Handles image rendering, hover swapping and fallback placeholders.',
        componentType: ComponentStructureType.ATOMIC,
        category: ComponentCategory.PRODUCT,
        slotKey: 'media',
        position: 0,
        defaultConfig: {
          ratio: '3:4',
          hoverSwap: true,
          lazyLoad: true,
          fallbackUrl: '/placeholder-product.png',
        },
        configSchema: {
          ratio: { type: 'enum', options: ['1:1', '3:4', '16:9'] },
          hoverSwap: { type: 'boolean' },
          lazyLoad: { type: 'boolean' },
          fallbackUrl: { type: 'string' },
        },
        metadata: {
          dataSource: 'product.media',
          renderer: 'Image',
        },
      },
      {
        componentKey: 'product_card.badge',
        displayName: 'Product Badge',
        description: 'Displays featured, sale, or sold-out labels above the card.',
        componentType: ComponentStructureType.ATOMIC,
        category: ComponentCategory.PRODUCT,
        slotKey: 'badge',
        position: 1,
        defaultConfig: {
          showFeatured: true,
          showSale: true,
          showInventoryStatus: true,
          featuredLabel: {
            en: 'Featured',
            vi: 'Sản phẩm nổi bật',
          },
          saleLabel: {
            en: 'Sale',
            vi: 'Khuyến mãi',
          },
        },
        metadata: {
          dataSource: 'product',
        },
      },
      {
        componentKey: 'product_card.info',
        displayName: 'Product Content',
        description: 'Title, rating and pricing stack used under the image.',
        componentType: ComponentStructureType.COMPOSITE,
        category: ComponentCategory.PRODUCT,
        slotKey: 'content',
        position: 2,
        defaultConfig: {
          align: 'start',
          spacing: 'sm',
        },
        allowedChildKeys: [
          'product_card.info.title',
          'product_card.info.price',
          'product_card.info.rating',
        ],
        children: [
          {
            componentKey: 'product_card.info.title',
            displayName: 'Product Title',
            componentType: ComponentStructureType.ATOMIC,
            category: ComponentCategory.PRODUCT,
            slotKey: 'title',
            position: 0,
            defaultConfig: {
              clampLines: 2,
              htmlTag: 'h3',
            },
            metadata: {
              dataSource: 'product.name',
            },
          },
          {
            componentKey: 'product_card.info.price',
            displayName: 'Product Pricing',
            componentType: ComponentStructureType.ATOMIC,
            category: ComponentCategory.PRODUCT,
            slotKey: 'price',
            position: 1,
            defaultConfig: {
              locale: 'vi-VN',
              currency: 'VND',
              showCompareAtPrice: true,
              showDivider: false,
            },
            metadata: {
              dataSource: 'product.variants',
              componentPath: 'apps/frontend/src/components/ecommerce/PriceDisplay.tsx',
            },
          },
          {
            componentKey: 'product_card.info.rating',
            displayName: 'Product Rating',
            componentType: ComponentStructureType.ATOMIC,
            category: ComponentCategory.PRODUCT,
            slotKey: 'rating',
            position: 2,
            defaultConfig: {
              showCount: true,
              showEmptyState: true,
            },
            metadata: {
              dataSource: 'product.reviews',
              componentPath: 'apps/frontend/src/components/ecommerce/Rating.tsx',
            },
          },
        ],
      },
      {
        componentKey: 'product_card.actions',
        displayName: 'Product Actions',
        description: 'Call-to-action buttons below the content stack.',
        componentType: ComponentStructureType.COMPOSITE,
        category: ComponentCategory.ACTION,
        slotKey: 'actions',
        position: 3,
        defaultConfig: {
          align: 'stretch',
          gap: 12,
          layout: 'stacked',
        },
        allowedChildKeys: [
          'product_card.actions.add_to_cart',
          'product_card.actions.wishlist',
          'product_card.actions.quick_view',
        ],
        children: [
          {
            componentKey: 'product_card.actions.add_to_cart',
            displayName: 'Add to Cart Button',
            componentType: ComponentStructureType.ATOMIC,
            category: ComponentCategory.ACTION,
            slotKey: 'primary',
            position: 0,
            defaultConfig: {
              variant: 'primary',
              analyticsEvent: 'add_to_cart_clicked',
              showQuantity: false,
            },
            metadata: {
              componentPath: 'apps/frontend/src/components/ecommerce/AddToCartButton.tsx',
            },
          },
          {
            componentKey: 'product_card.actions.wishlist',
            displayName: 'Wishlist Toggle',
            componentType: ComponentStructureType.ATOMIC,
            category: ComponentCategory.ACTION,
            slotKey: 'secondary',
            position: 1,
            defaultConfig: {
              variant: 'ghost',
              showLabel: false,
            },
            metadata: {
              usedIn: ['Wishlist', 'ProductGrid'],
            },
          },
          {
            componentKey: 'product_card.actions.quick_view',
            displayName: 'Quick View Trigger',
            componentType: ComponentStructureType.ATOMIC,
            category: ComponentCategory.ACTION,
            slotKey: 'utility',
            position: 2,
            defaultConfig: {
              enabled: false,
              variant: 'outline',
            },
            metadata: {
              usedIn: ['ProductGrid', 'ProductList'],
            },
          },
        ],
      },
    ],
  },
  {
    componentKey: 'hero_slider',
    displayName: 'Hero Slider',
    description: 'Large marketing slider used on storefront home pages.',
    componentType: ComponentStructureType.COMPOSITE,
    category: ComponentCategory.MARKETING,
    position: 1,
    defaultConfig: {
      autoplay: true,
      interval: 6000,
      layout: 'full-width',
      overlay: {
        enabled: true,
        color: 'rgba(15,23,42,0.55)',
        opacityPercent: 60,
      },
      showPagination: true,
      showArrows: true,
    },
    metadata: {
      componentPath: 'apps/frontend/src/components/sections/HeroSlider.tsx',
      sectionType: 'hero_slider',
      usedOnPages: ['home'],
    },
    allowedChildKeys: ['hero_slider.slide'],
    children: [
      {
        componentKey: 'hero_slider.slide',
        displayName: 'Hero Slide',
        componentType: ComponentStructureType.COMPOSITE,
        category: ComponentCategory.MARKETING,
        slotKey: 'slide',
        defaultConfig: {
          alignment: 'left',
          eyebrow: 'Launch playbook',
          title: 'Build immersive storefronts',
          subtitle: 'Composable hero layouts, localized in minutes.',
          imageUrl: 'https://images.unsplash.com/photo-1498050108023-c5249f4df085?auto=format&fit=crop&w=1600&q=80',
          primaryAction: {
            label: 'Explore sections',
            href: '#sections',
          },
          secondaryAction: {
            label: 'See docs',
            href: '/docs',
            variant: 'ghost',
          },
        },
        allowedChildKeys: [
          'hero_slider.slide.media',
          'hero_slider.slide.content',
          'hero_slider.slide.actions',
        ],
        children: [
          {
            componentKey: 'hero_slider.slide.media',
            displayName: 'Hero Slide Media',
            componentType: ComponentStructureType.ATOMIC,
            category: ComponentCategory.MARKETING,
            slotKey: 'media',
            defaultConfig: {
              type: 'image',
              focalPoint: 'center',
              overlayGradient: 'none',
            },
          },
          {
            componentKey: 'hero_slider.slide.content',
            displayName: 'Hero Slide Content',
            componentType: ComponentStructureType.ATOMIC,
            category: ComponentCategory.MARKETING,
            slotKey: 'content',
            defaultConfig: {
              align: 'left',
              showEyebrow: true,
              showDescription: true,
            },
          },
          {
            componentKey: 'hero_slider.slide.actions',
            displayName: 'Hero Slide Actions',
            componentType: ComponentStructureType.COMPOSITE,
            category: ComponentCategory.ACTION,
            slotKey: 'actions',
            allowedChildKeys: [
              'hero_slider.slide.actions.primary',
              'hero_slider.slide.actions.secondary',
            ],
            children: [
              {
                componentKey: 'hero_slider.slide.actions.primary',
                displayName: 'Primary CTA',
                componentType: ComponentStructureType.ATOMIC,
                category: ComponentCategory.ACTION,
                slotKey: 'primary',
                defaultConfig: {
                  variant: 'primary',
                  size: 'lg',
                },
              },
              {
                componentKey: 'hero_slider.slide.actions.secondary',
                displayName: 'Secondary CTA',
                componentType: ComponentStructureType.ATOMIC,
                category: ComponentCategory.ACTION,
                slotKey: 'secondary',
                defaultConfig: {
                  variant: 'ghost',
                  size: 'lg',
                },
              },
            ],
          },
        ],
      },
    ],
  },
  {
    componentKey: 'cta_banner',
    displayName: 'CTA Banner',
    description: 'Full-width gradient banner with localized CTA copy used at the bottom of the homepage.',
    componentType: ComponentStructureType.COMPOSITE,
    category: ComponentCategory.MARKETING,
    position: 2,
    defaultConfig: {
      layout: 'full-width',
      style: 'center',
      background: 'gradient',
      gradient: 'from-violet-600 via-indigo-600 to-sky-500',
      border: 'rounded-3xl',
      padding: 10,
      primaryAction: {
        label: 'Book a walkthrough',
        href: '/contact',
      },
    },
    metadata: {
      componentPath: 'apps/frontend/src/components/sections/CTABannerSection.tsx',
      sectionType: 'cta',
    },
    allowedChildKeys: [
      'cta_banner.heading',
      'cta_banner.description',
      'cta_banner.actions',
    ],
    children: [
      {
        componentKey: 'cta_banner.heading',
        displayName: 'CTA Heading',
        componentType: ComponentStructureType.ATOMIC,
        category: ComponentCategory.CONTENT,
        slotKey: 'heading',
        defaultConfig: {
          clampLines: 2,
          textAlign: 'left',
        },
      },
      {
        componentKey: 'cta_banner.description',
        displayName: 'CTA Description',
        componentType: ComponentStructureType.ATOMIC,
        category: ComponentCategory.CONTENT,
        slotKey: 'description',
        defaultConfig: {
          clampLines: 3,
          textAlign: 'left',
        },
      },
      {
        componentKey: 'cta_banner.actions',
        displayName: 'CTA Actions',
        componentType: ComponentStructureType.COMPOSITE,
        category: ComponentCategory.ACTION,
        slotKey: 'actions',
        allowedChildKeys: ['cta_banner.actions.primary'],
        children: [
          {
            componentKey: 'cta_banner.actions.primary',
            displayName: 'CTA Primary Button',
            componentType: ComponentStructureType.ATOMIC,
            category: ComponentCategory.ACTION,
            slotKey: 'primary',
            defaultConfig: {
              variant: 'light',
              size: 'md',
            },
          },
        ],
      },
    ],
  },
];

@Injectable()
export class ComponentConfigsSeeder {
  private readonly logger = new Logger(ComponentConfigsSeeder.name);

  constructor(
    @InjectRepository(ComponentConfigEntity)
    private readonly componentRepository: Repository<ComponentConfigEntity>,
  ) {}

  async seed(): Promise<void> {
    this.logger.log('Seeding storefront component configurations...');

    for (const [index, seed] of STOREFRONT_COMPONENT_CONFIGS.entries()) {
      await this.upsertComponent(seed, null, index);
    }
  }

  private async upsertComponent(
    seed: ComponentConfigSeed,
    parentId: string | null,
    fallbackPosition: number,
  ): Promise<ComponentConfigEntity> {
    const existing = await this.componentRepository.findOne({
      where: { componentKey: seed.componentKey },
    });

    const entity = existing
      ? this.componentRepository.merge(existing, {
          displayName: seed.displayName,
          description: seed.description ?? null,
          componentType: seed.componentType,
          category: seed.category,
          position: seed.position ?? fallbackPosition,
          isEnabled: seed.isEnabled ?? true,
          defaultConfig: seed.defaultConfig ?? {},
          configSchema: seed.configSchema ?? {},
          metadata: seed.metadata ?? {},
          allowedChildKeys: seed.allowedChildKeys ?? [],
          previewMediaUrl: seed.previewMediaUrl ?? null,
          parentId,
          slotKey: seed.slotKey ?? null,
        })
      : this.componentRepository.create({
          componentKey: seed.componentKey,
          displayName: seed.displayName,
          description: seed.description ?? null,
          componentType: seed.componentType,
          category: seed.category,
          position: seed.position ?? fallbackPosition,
          isEnabled: seed.isEnabled ?? true,
          defaultConfig: seed.defaultConfig ?? {},
          configSchema: seed.configSchema ?? {},
          metadata: seed.metadata ?? {},
          allowedChildKeys: seed.allowedChildKeys ?? [],
          previewMediaUrl: seed.previewMediaUrl ?? null,
          parentId,
          slotKey: seed.slotKey ?? null,
        });

    const saved = await this.componentRepository.save(entity);

    if (seed.children && seed.children.length > 0) {
      for (const [childIndex, childSeed] of seed.children.entries()) {
        await this.upsertComponent(childSeed, saved.id, childSeed.position ?? childIndex);
      }
    }

    return saved;
  }
}
