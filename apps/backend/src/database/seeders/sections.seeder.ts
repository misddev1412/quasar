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

    const existing = await sectionRepository.count();
    if (existing > 0) {
      console.log('Sections already seeded, skipping');
      return;
    }

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
    ];

    for (const entry of sections) {
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
    }

    console.log(`Seeded ${sections.length} homepage sections with translations.`);
  }
}
