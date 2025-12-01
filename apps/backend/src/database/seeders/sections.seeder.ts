import { Injectable } from '@nestjs/common';
import { DataSource } from 'typeorm';
import { SeederModule } from './seeder.module';
import { SectionEntity } from '../../modules/sections/entities/section.entity';
import { SectionTranslationEntity } from '../../modules/sections/entities/section-translation.entity';
import { SectionType } from '@shared/enums/section.enums';

@Injectable()
export class SectionsSeeder implements SeederModule {
  constructor(private readonly dataSource: DataSource) {}

  async seed(): Promise<void> {
    const sectionRepository = this.dataSource.getRepository(SectionEntity);
    const translationRepository = this.dataSource.getRepository(SectionTranslationEntity);

    const sections: Array<{ section: Partial<SectionEntity>; translations: Array<Partial<SectionTranslationEntity>> }> = [
      {
        section: {
          page: 'home',
          type: SectionType.HERO_SLIDER,
          position: 0,
          isEnabled: true,
          config: {
            autoplay: true,
            interval: 6000,
            slides: [
              {
                id: 'hero-default-1',
                title: 'Build immersive storefronts',
                subtitle: 'Composable experiences tailored to every launch',
                imageUrl: 'https://images.unsplash.com/photo-1498050108023-c5249f4df085?auto=format&fit=crop&w=1600&q=80',
                ctaLabel: 'Explore sections',
                ctaUrl: '#sections',
              },
              {
                id: 'hero-default-2',
                title: 'Localized content in minutes',
                subtitle: 'Multi-region storytelling, single source of truth',
                imageUrl: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&w=1600&q=80',
                ctaLabel: 'See use cases',
                ctaUrl: '/about',
              },
            ],
          },
        },
        translations: [
          {
            locale: 'en',
            title: 'Everything you need to launch fast',
            subtitle: 'Composable storefront sections, ready for localization',
            description: 'Pick a layout, adjust the copy, connect your data sources and go live. Sections stay in sync across languages and campaigns.',
            heroDescription: 'Launch-ready hero storytelling tailored to each region without rebuilding layouts.',
          },
          {
            locale: 'vi',
            title: 'Khởi chạy trải nghiệm số trong vài giờ',
            subtitle: 'Các phân đoạn trang chủ linh hoạt, hỗ trợ đa ngôn ngữ',
            description: 'Tùy biến bố cục, cập nhật nội dung và đồng bộ dữ liệu sản phẩm chỉ với vài bước đơn giản.',
            heroDescription: 'Tùy biến thông điệp hero theo từng thị trường mà không cần chỉnh sửa mã nguồn.',
          },
        ],
      },
      {
        section: {
          page: 'home',
          type: SectionType.FEATURED_PRODUCTS,
          position: 1,
          isEnabled: true,
          config: {
            productIds: ['SKU-1001', 'SKU-1002', 'SKU-1003', 'SKU-1004'],
            displayStyle: 'grid',
            itemsPerRow: 4,
          },
        },
        translations: [
          {
            locale: 'en',
            title: 'Featured products',
            subtitle: 'Hand-curated assortments to get started quickly',
            description: 'Surface the hero products powering your launch, seasonal drops, or always-on campaigns.',
            heroDescription: null,
          },
          {
            locale: 'vi',
            title: 'Sản phẩm nổi bật',
            subtitle: 'Bộ sưu tập chọn lọc cho chiến dịch của bạn',
            description: 'Giới thiệu nhanh các sản phẩm chủ lực, chương trình ưu đãi hoặc bộ sưu tập theo mùa.',
            heroDescription: null,
          },
        ],
      },
      {
        section: {
          page: 'home',
          type: SectionType.PRODUCTS_BY_CATEGORY,
          position: 2,
          isEnabled: true,
          config: {
            displayStyle: 'grid',
            rows: [
              {
                id: 'home-products-latest',
                strategy: 'latest',
                productIds: [],
                limit: 6,
              },
              {
                id: 'home-products-featured',
                strategy: 'featured',
                productIds: [],
                limit: 6,
              },
              {
                id: 'home-products-custom',
                strategy: 'custom',
                productIds: [],
                limit: 6,
              },
            ],
          },
        },
        translations: [
          {
            locale: 'en',
            title: 'Explore by category',
            subtitle: 'Automate category-led storytelling',
            description: 'Map dynamic collections from your commerce backend, filter by inventory rules, and highlight rich media storytelling.',
            heroDescription: null,
          },
          {
            locale: 'vi',
            title: 'Khám phá theo danh mục',
            subtitle: 'Tự động hóa nội dung theo danh mục',
            description: 'Đồng bộ danh mục từ hệ thống bán hàng, áp dụng bộ lọc hàng tồn và hiển thị nội dung đa phương tiện sống động.',
            heroDescription: null,
          },
        ],
      },
      {
        section: {
          page: 'home',
          type: SectionType.NEWS,
          position: 3,
          isEnabled: true,
          config: {
            limit: 3,
            categories: ['press', 'product'],
          },
        },
        translations: [
          {
            locale: 'en',
            title: 'Latest news & updates',
            subtitle: 'Keep audiences in the loop with product highlights',
            description: 'Share milestones, changelog entries, or editorial pieces and drive traffic to your newsroom.',
            heroDescription: null,
          },
          {
            locale: 'vi',
            title: 'Tin tức và cập nhật mới nhất',
            subtitle: 'Thông báo sản phẩm và câu chuyện thương hiệu',
            description: 'Cập nhật tin tức, câu chuyện sản phẩm và thông cáo báo chí đến khách hàng.',
            heroDescription: null,
          },
        ],
      },
      {
        section: {
          page: 'home',
          type: SectionType.CUSTOM_HTML,
          position: 4,
          isEnabled: true,
          config: {
            html: '<div class="rounded-3xl bg-gradient-to-r from-violet-600 via-indigo-600 to-sky-500 p-10 text-white shadow-xl">\n  <div class="max-w-3xl">\n    <p class="text-sm uppercase tracking-[0.3em] text-white/70">LAUNCH PLAYBOOK</p>\n    <h2 class="mt-4 text-3xl font-semibold">Blend marketing, merchandising, and localization without code debt.</h2>\n    <p class="mt-4 text-white/80 text-base">Compose sections as JSON, tune them in the admin, and deploy instantly across devices and locales.</p>\n    <a href="/contact" class="mt-6 inline-flex rounded-lg bg-white px-4 py-2 text-sm font-semibold text-indigo-600">Book a walkthrough</a>\n  </div>\n</div>',
          },
        },
        translations: [
          {
            locale: 'en',
            title: 'Composable launch playbook',
            description: 'Pair sections with experiments, feature flags, and analytics events to continually optimize.',
            heroDescription: null,
          },
          {
            locale: 'vi',
            title: 'Tối ưu chiến dịch nhanh chóng',
            description: 'Kết hợp phân đoạn, thử nghiệm A/B và tracking để tối ưu hóa từng chiến dịch.',
            heroDescription: null,
          },
        ],
      },
      {
        section: {
          page: 'home',
          type: SectionType.CTA,
          position: 5,
          isEnabled: true,
          config: {
            layout: 'full-width',
            style: 'center',
            background: 'gradient',
            accentColor: '#f97316',
            backgroundImage: 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&w=1800&q=80',
            overlayOpacity: 0.65,
          },
        },
        translations: [
          {
            locale: 'en',
            title: 'Launch bold retail storytelling',
            subtitle: 'Ship CTA-driven banners without rewriting layouts',
            description: 'Highlight product drops, choreograph campaigns, and drive traffic to the next best action from one reusable block.',
            heroDescription: null,
            configOverride: {
              primaryCta: {
                label: 'Plan a launch',
                href: '/contact',
              },
              secondaryCta: {
                label: 'Browse docs',
                href: '/docs',
              },
            },
          },
          {
            locale: 'vi',
            title: 'Tăng tốc chiến dịch với CTA nổi bật',
            subtitle: 'Kích hoạt banner thu hút chỉ trong vài phút',
            description: 'Kể câu chuyện thương hiệu và dẫn dắt khách hàng đến hành động tiếp theo với một khối CTA linh hoạt.',
            heroDescription: null,
            configOverride: {
              primaryCta: {
                label: 'Trao đổi với đội ngũ',
                href: '/contact',
              },
              secondaryCta: {
                label: 'Xem tài liệu',
                href: '/docs',
              },
            },
          },
        ],
      },
      {
        section: {
          page: 'product',
          type: SectionType.HERO_SLIDER,
          position: 0,
          isEnabled: true,
          config: {
            autoplay: true,
            interval: 7000,
            layout: 'container',
            slides: [
              {
                id: 'product-hero-1',
                title: 'Built for merchandising teams',
                subtitle: 'Curate product stories with localized messaging',
                imageUrl: 'https://images.unsplash.com/photo-1498050108023-c5249f4df085?auto=format&fit=crop&w=1600&q=80',
                ctaLabel: 'Browse catalog',
                ctaUrl: '/products',
              },
              {
                id: 'product-hero-2',
                title: 'Launch seasonal assortments quickly',
                subtitle: 'Coordinate pricing, bundles, and merchandising rules',
                imageUrl: 'https://images.unsplash.com/photo-1472851294608-062f824d29cc?auto=format&fit=crop&w=1600&q=80',
                ctaLabel: 'See featured products',
                ctaUrl: '#featured',
              },
            ],
          },
        },
        translations: [
          {
            locale: 'en',
            title: 'Merchandising excellence',
            subtitle: 'Keep buyers inspired with dynamic, localized hero content',
            description: 'Highlight hero assortments, call out bundle offers, and drive shoppers to browse the entire catalog.',
            heroDescription: 'Hero storytelling tailored for the product listing page.',
          },
          {
            locale: 'vi',
            title: 'Trải nghiệm sản phẩm nổi bật',
            subtitle: 'Tùy biến hero theo từng chiến dịch sản phẩm',
            description: 'Giới thiệu bộ sưu tập, gói ưu đãi và dẫn người dùng khám phá toàn bộ danh mục.',
            heroDescription: 'Hero linh hoạt cho trang danh sách sản phẩm.',
          },
        ],
      },
      {
        section: {
          page: 'product',
          type: SectionType.CTA,
          position: 1,
          isEnabled: true,
          config: {
            layout: 'container',
            style: 'split',
            background: 'image',
            backgroundImage: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=1500&q=80',
            overlayOpacity: 0.5,
            accentColor: '#2563eb',
            primaryCta: {
              label: 'View all categories',
              href: '/categories',
            },
            secondaryCta: {
              label: 'Talk to sales',
              href: '/contact',
            },
          },
        },
        translations: [
          {
            locale: 'en',
            title: 'Need curated recommendations?',
            subtitle: 'Let our team build the right merchandising mix',
            description: 'Blend product discovery modules, editorial content, and bundles that complement every PDP.',
            heroDescription: null,
          },
          {
            locale: 'vi',
            title: 'Cần gợi ý danh mục phù hợp?',
            subtitle: 'Đội ngũ của chúng tôi sẽ giúp bạn tối ưu danh mục sản phẩm',
            description: 'Kết hợp module khám phá sản phẩm, câu chuyện thương hiệu và gói ưu đãi phù hợp cho mọi trang chi tiết.',
            heroDescription: null,
          },
        ],
      },
      {
        section: {
          page: 'product_detail',
          type: SectionType.FEATURED_PRODUCTS,
          position: 0,
          isEnabled: true,
          config: {
            productIds: ['SKU-2001', 'SKU-2002', 'SKU-2003'],
            displayStyle: 'grid',
            itemsPerRow: 3,
          },
        },
        translations: [
          {
            locale: 'en',
            title: 'Complete the look',
            subtitle: 'Pairs well with your current selection',
            description: 'Show complementary items, bundle-ready accessories, or seasonal add-ons that enhance the product detail page.',
            heroDescription: null,
          },
          {
            locale: 'vi',
            title: 'Hoàn thiện trải nghiệm',
            subtitle: 'Kết hợp hoàn hảo với sản phẩm bạn đang xem',
            description: 'Gợi ý phụ kiện đi kèm, combo ưu đãi và sản phẩm bổ trợ ngay trên trang chi tiết.',
            heroDescription: null,
          },
        ],
      },
      {
        section: {
          page: 'product_detail',
          type: SectionType.CUSTOM_HTML,
          position: 1,
          isEnabled: true,
          config: {
            html: '<section class="rounded-3xl border border-gray-200 bg-white/90 dark:bg-gray-900/40 p-8 shadow-lg">\n  <div class="grid gap-6 md:grid-cols-2 items-center">\n    <div>\n      <p class="text-sm font-semibold uppercase tracking-[0.3em] text-indigo-500 mb-2">Why shoppers love this collection</p>\n      <h2 class="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-4">Crafted with premium materials & verified supply chain partners</h2>\n      <p class="text-gray-600 dark:text-gray-300">Use this slot to highlight sustainability claims, warranty information, fit guides, or brand storytelling specific to the PDP.</p>\n    </div>\n    <div class="bg-indigo-50 dark:bg-indigo-900/40 rounded-2xl p-6">\n      <ul class="space-y-3 text-gray-700 dark:text-gray-200 text-sm">\n        <li class="flex items-start gap-3"><span class="text-indigo-500 mt-1">✓</span> Responsive layout that adapts across desktop and mobile PDPs</li>\n        <li class="flex items-start gap-3"><span class="text-indigo-500 mt-1">✓</span> Localized messaging through translation overrides per locale</li>\n        <li class="flex items-start gap-3"><span class="text-indigo-500 mt-1">✓</span> Drop rich media, icons, and supporting copy using HTML blocks</li>\n      </ul>\n    </div>\n  </div>\n</section>',
          },
        },
        translations: [
          {
            locale: 'en',
            title: 'Quality signals customers trust',
            description: 'Reassure shoppers with PDP-specific storytelling, returns messaging, or detailed product specs.',
            heroDescription: null,
          },
          {
            locale: 'vi',
            title: 'Thông tin làm khách hàng yên tâm',
            description: 'Nhấn mạnh chính sách bảo hành, vật liệu cao cấp và câu chuyện thương hiệu ngay tại trang sản phẩm.',
            heroDescription: null,
          },
        ],
      },
    ];

    let createdCount = 0;

    for (const entry of sections) {
      const existingSection = await sectionRepository.findOne({
        where: {
          page: entry.section.page,
          type: entry.section.type,
        },
      });

      if (existingSection) {
        console.log(
          `Skipping section seeding for page='${entry.section.page}' type='${entry.section.type}' (already exists)`,
        );
        continue;
      }

      const createdSection = await sectionRepository.save(sectionRepository.create(entry.section));
      const translations = entry.translations.map((translation) =>
        translationRepository.create({
          sectionId: createdSection.id,
          locale: translation.locale!,
          title: translation.title,
          subtitle: translation.subtitle,
          description: translation.description,
          configOverride: translation.configOverride || null,
        }),
      );
      await translationRepository.save(translations);
      createdCount += 1;
    }

    console.log(`Seeded ${createdCount} sections with translations.`);
  }
}
