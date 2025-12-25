import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ComponentConfigEntity } from '../../modules/component-configs/entities/component-config.entity';
import { ComponentStructureType, ComponentCategory } from '@shared/enums/component.enums';
import { DEFAULT_MAIN_MENU_CONFIG } from '@shared/types/navigation.types';

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

const VIEW_MORE_BUTTON_TEXT_COLOR_PRESETS = [
  'text-gray-700 hover:text-gray-900 dark:text-gray-200 dark:hover:text-gray-50',
  'text-gray-900 dark:text-gray-100',
  'text-indigo-600 hover:text-indigo-700 dark:text-indigo-300 dark:hover:text-indigo-200',
  'text-primary-600 hover:text-primary-700 dark:text-primary-400 dark:hover:text-primary-300',
  'text-white hover:text-white dark:text-white dark:hover:text-white',
];

const VIEW_MORE_BUTTON_BACKGROUND_COLOR_PRESETS = [
  'bg-transparent hover:bg-gray-50 dark:bg-transparent dark:hover:bg-gray-900/40',
  'bg-white hover:bg-gray-100 dark:bg-gray-900 dark:hover:bg-gray-800',
  'bg-gray-900 hover:bg-gray-800 dark:bg-gray-100 dark:hover:bg-gray-200',
  'bg-indigo-600 hover:bg-indigo-700 dark:bg-indigo-500 dark:hover:bg-indigo-600',
  'bg-primary-600 hover:bg-primary-700 dark:bg-primary-500 dark:hover:bg-primary-600',
];

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
      showShortDescription: false,
      badgeStyle: 'pill',
      priceDisplay: 'stacked',
      titleStyle: {
        fontWeight: 'semibold',
        fontSize: 'lg',
      },
      priceStyle: {
        colorTone: 'emphasis',
      },
      thumbnail: {
        orientation: 'portrait',
      },
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
      showShortDescription: { type: 'boolean' },
      badgeStyle: { type: 'enum', options: ['pill', 'square'] },
      priceDisplay: { type: 'enum', options: ['stacked', 'inline'] },
      titleStyle: {
        type: 'object',
        properties: {
          fontWeight: { type: 'enum', options: ['normal', 'medium', 'semibold', 'bold'] },
          fontSize: { type: 'enum', options: ['sm', 'base', 'lg', 'xl'] },
        },
      },
      priceStyle: {
        type: 'object',
        properties: {
          colorTone: { type: 'enum', options: ['muted', 'default', 'emphasis', 'custom'] },
          customColor: { type: 'string' },
        },
      },
      thumbnail: {
        type: 'object',
        properties: {
          orientation: { type: 'enum', options: ['portrait', 'landscape'] },
        },
      },
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
              fontWeight: 'semibold',
              fontSize: 'lg',
              textColor: '',
              uppercase: false,
            },
            configSchema: {
              clampLines: { type: 'number', min: 1, max: 5 },
              htmlTag: { type: 'enum', options: ['h2', 'h3', 'h4', 'h5', 'p', 'span'] },
              fontWeight: { type: 'enum', options: ['normal', 'medium', 'semibold', 'bold'] },
              fontSize: { type: 'enum', options: ['sm', 'base', 'lg', 'xl'] },
              textColor: { type: 'string' },
              uppercase: { type: 'boolean' },
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
              fontWeight: 'bold',
              fontSize: 'lg',
              colorTone: 'emphasis',
              customColor: '',
            },
            configSchema: {
              locale: { type: 'string' },
              currency: { type: 'string' },
              showCompareAtPrice: { type: 'boolean' },
              showDivider: { type: 'boolean' },
              fontWeight: { type: 'enum', options: ['normal', 'medium', 'semibold', 'bold'] },
              fontSize: { type: 'enum', options: ['sm', 'base', 'lg', 'xl'] },
              colorTone: { type: 'enum', options: ['muted', 'default', 'emphasis', 'custom'] },
              customColor: { type: 'string' },
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
  {
    componentKey: 'featured_products',
    displayName: 'Featured Products Section',
    description: 'Showcase a curated list of products in a grid or carousel.',
    componentType: ComponentStructureType.COMPOSITE,
    category: ComponentCategory.PRODUCT,
    position: 3,
    defaultConfig: {
      productIds: ['SKU-1001', 'SKU-1002', 'SKU-1003', 'SKU-1004'],
      displayStyle: 'grid',
      itemsPerRow: 4,
    },
    configSchema: {
      productIds: { type: 'array', items: 'string', description: 'Product IDs to render in order' },
      displayStyle: { type: 'enum', options: ['grid', 'carousel'] },
      itemsPerRow: { type: 'number', minimum: 2, maximum: 4 },
    },
    metadata: {
      componentPath: 'apps/frontend/src/components/sections/FeaturedProducts.tsx',
      sectionType: 'featured_products',
      dataSource: 'products',
    },
    allowedChildKeys: ['product_card'],
  },
  {
    componentKey: 'products_by_category',
    displayName: 'Products By Category Section',
    description: 'Rows of products driven by category or merchandising strategy.',
    componentType: ComponentStructureType.COMPOSITE,
    category: ComponentCategory.PRODUCT,
    position: 4,
    defaultConfig: {
      displayStyle: 'grid',
      rows: [
        {
          id: 'home-products-latest',
          strategy: 'latest',
          limit: 6,
          title: 'Latest arrivals',
        },
        {
          id: 'home-products-featured',
          strategy: 'featured',
          limit: 6,
          title: 'Featured picks',
        },
        {
          id: 'home-products-custom',
          strategy: 'custom',
          productIds: ['SKU-2001', 'SKU-2002'],
          limit: 6,
          title: 'Editorial set',
        },
      ],
      sidebar: {
        enabled: true,
        title: 'Khám phá theo danh mục',
        description: 'Chọn nhanh bộ sưu tập nổi bật hoặc danh mục yêu thích.',
        sections: [
          {
            id: 'collections',
            title: 'Bộ sưu tập đặc biệt',
            description: 'Những nhóm sản phẩm được đề xuất.',
            items: [
              {
                id: 'collection-premium',
                label: 'Premium Essentials',
                href: '/collections/premium-essentials',
                description: 'Phong cách tối giản với chất liệu cao cấp.',
                icon: 'lucide:sparkles',
              },
              {
                id: 'collection-sport',
                label: 'Sport Capsule',
                href: '/collections/sport-capsule',
                description: 'Trang phục linh hoạt cho mọi hoạt động.',
                icon: 'lucide:activity',
              },
            ],
          },
          {
            id: 'categories',
            title: 'Danh mục nổi bật',
            items: [
              {
                id: 'category-men',
                label: 'Thời trang nam',
                href: '/categories/mens-fashion',
                icon: 'lucide:user',
              },
              {
                id: 'category-women',
                label: 'Thời trang nữ',
                href: '/categories/womens-fashion',
                icon: 'lucide:user-round',
              },
            ],
          },
        ],
      },
    },
    configSchema: {
      displayStyle: { type: 'enum', options: ['grid', 'carousel'] },
      rows: {
        type: 'array',
        items: {
          type: 'object',
          properties: {
            id: { type: 'string' },
            categoryId: { type: 'string' },
            title: { type: 'string' },
            strategy: { type: 'enum', options: ['latest', 'featured', 'bestsellers', 'custom'] },
            productIds: { type: 'array', items: 'string' },
            limit: { type: 'number' },
            displayStyle: { type: 'enum', options: ['grid', 'carousel'] },
          },
        },
      },
      sidebar: {
        type: 'object',
        properties: {
          enabled: { type: 'boolean' },
          title: { type: 'string' },
          description: { type: 'string' },
          sections: {
            type: 'array',
            items: {
              type: 'object',
              properties: {
                id: { type: 'string' },
                title: { type: 'string' },
                description: { type: 'string' },
                items: {
                  type: 'array',
                  items: {
                    type: 'object',
                    properties: {
                      id: { type: 'string' },
                      label: { type: 'string' },
                      href: { type: 'string' },
                      description: { type: 'string' },
                      icon: { type: 'string' },
                    },
                  },
                },
              },
            },
          },
        },
      },
    },
    metadata: {
      componentPath: 'apps/frontend/src/components/sections/ProductsByCategory.tsx',
      sectionType: 'products_by_category',
      dataSource: 'products/categories',
    },
  },
  {
    componentKey: 'news_section',
    displayName: 'News / Blog Section',
    description: 'Editorial feed that pulls latest or featured news with optional category scoping.',
    componentType: ComponentStructureType.COMPOSITE,
    category: ComponentCategory.CONTENT,
    position: 5,
    defaultConfig: {
      limit: 3,
      categories: ['press', 'product'],
      strategy: 'latest',
      rows: [
        { id: 'news-latest', title: 'Latest news', strategy: 'latest', limit: 3 },
        { id: 'news-featured', title: 'Featured stories', strategy: 'featured', limit: 3 },
      ],
    },
    configSchema: {
      limit: { type: 'number', minimum: 1, maximum: 12 },
      categories: { type: 'array', items: 'string' },
      strategy: { type: 'enum', options: ['latest', 'most_viewed', 'featured'] },
      rows: {
        type: 'array',
        items: {
          type: 'object',
          properties: {
            id: { type: 'string' },
            categoryId: { type: 'string' },
            title: { type: 'string' },
            strategy: { type: 'enum', options: ['latest', 'most_viewed', 'featured'] },
            limit: { type: 'number' },
          },
        },
      },
    },
    metadata: {
      componentPath: 'apps/frontend/src/components/sections/NewsSection.tsx',
      sectionType: 'news',
      dataSource: 'articles',
    },
  },
  {
    componentKey: 'custom_html_section',
    displayName: 'Custom HTML Section',
    description: 'Raw HTML block with gradient background used for bespoke storytelling.',
    componentType: ComponentStructureType.ATOMIC,
    category: ComponentCategory.CONTENT,
    position: 6,
    defaultConfig: {
      html:
        '<div class="rounded-3xl bg-gradient-to-r from-violet-600 via-indigo-600 to-sky-500 p-10 text-white shadow-xl">' +
        '<div class="max-w-3xl">' +
        '<p class="text-sm uppercase tracking-[0.3em] text-white/70">CUSTOM BLOCK</p>' +
        '<h2 class="mt-4 text-3xl font-semibold">Compose HTML snippets for bespoke campaigns</h2>' +
        '<p class="mt-4 text-white/80 text-base">Use this slot for legal copy, brand storytelling, or campaign-specific layouts.</p>' +
        '</div>' +
        '</div>',
    },
    configSchema: {
      html: { type: 'string', description: 'HTML content rendered as-is on the storefront' },
    },
    metadata: {
      componentPath: 'apps/frontend/src/components/sections/CustomHtmlSection.tsx',
      sectionType: 'custom_html',
    },
  },
  {
    componentKey: 'view_more_button',
    displayName: 'View More Button',
    description: 'Reusable, configurable "View More" button/link component for consistent CTA styling across sections.',
    componentType: ComponentStructureType.ATOMIC,
    category: ComponentCategory.ACTION,
    position: 7,
    defaultConfig: {
      size: 'md',
      weight: 'medium',
      textColor: 'text-indigo-600 hover:text-indigo-700 dark:text-indigo-300 dark:hover:text-indigo-200',
      backgroundColor: 'bg-transparent hover:bg-gray-50 dark:bg-transparent dark:hover:bg-gray-900/40',
    },
    configSchema: {
      size: { type: 'enum', options: ['sm', 'md', 'lg'], description: 'Button size preset' },
      weight: {
        type: 'enum',
        options: ['thin', 'light', 'normal', 'medium', 'semibold', 'bold', 'extrabold', 'black'],
        description: 'Font weight for the button label',
      },
      textColor: {
        type: 'enum',
        options: VIEW_MORE_BUTTON_TEXT_COLOR_PRESETS,
        description: 'Text color utility classes applied to the CTA (includes hover & dark variants)',
      },
      backgroundColor: {
        type: 'enum',
        options: VIEW_MORE_BUTTON_BACKGROUND_COLOR_PRESETS,
        description: 'Background utility classes applied to the CTA (includes hover & dark variants)',
      },
    },
    metadata: {
      componentPath: 'apps/frontend/src/components/common/ViewMoreButton.tsx',
      propsInterface: 'ViewMoreButtonProps',
      usedIn: ['FeaturedProducts', 'NewsSection', 'ProductsByCategory', 'Custom Sections'],
      notes: 'Centralized component for consistent "View More" styling. Replaces inline Link components.',
    },
  },
  {
    componentKey: 'navigation.main_menu',
    displayName: 'Main Menu Appearance',
    description: 'Controls MainMenu background colors and spacing scale for desktop and mobile navigation.',
    componentType: ComponentStructureType.ATOMIC,
    category: ComponentCategory.LAYOUT,
    position: 20,
    isEnabled: true,
    defaultConfig: DEFAULT_MAIN_MENU_CONFIG,
    configSchema: {
      backgroundColor: {
        type: 'object',
        properties: {
          light: { type: 'string', description: 'Hex, rgb, or Tailwind-compatible color for light mode background' },
          dark: { type: 'string', description: 'Hex, rgb, or Tailwind-compatible color for dark mode background' },
        },
      },
      itemSize: { type: 'enum', options: ['compact', 'comfortable', 'spacious'] },
    },
    metadata: {
      componentPath: 'apps/frontend/src/components/menu/MenuNavigation.tsx',
      notes: 'Referenced by the storefront header to control navigation spacing and colors.',
    },
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
