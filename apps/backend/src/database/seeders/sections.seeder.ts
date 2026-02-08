import { Injectable } from '@nestjs/common';
import { DataSource } from 'typeorm';
import { SeederModule } from '@backend/database/seeders/seeder.module';
import { SectionEntity } from '@backend/modules/sections/entities/section.entity';
import { SectionTranslationEntity } from '@backend/modules/sections/entities/section-translation.entity';
import { SectionType } from '@shared/enums/section.enums';

@Injectable()
export class SectionsSeeder implements SeederModule {
  constructor(private readonly dataSource: DataSource) { }

  async seed(): Promise<void> {
    const sectionRepository = this.dataSource.getRepository(SectionEntity);
    const translationRepository = this.dataSource.getRepository(SectionTranslationEntity);

    const sections: Array<{ section: Partial<SectionEntity>; translations: Array<Partial<SectionTranslationEntity>> }> = [
      {
        section: {
          page: 'home',
          type: SectionType.SIDE_BANNERS,
          position: -1,
          isEnabled: true,
          config: {
            width: 140,
            height: 470,
            gap: 24,
            hideBelowBreakpoint: 'xl',
            cards: [
              {
                id: 'side-banner-left',
                slot: 'left',
                label: 'ƯU ĐÃI ĐẶC BIỆT',
                title: 'Ưu đãi thành viên mới',
                description: 'Nhận ngay voucher 15% cho đơn hàng đầu tiên cùng quà tặng giới hạn.',
                highlight: 'Giảm đến 40%',
                ctaLabel: 'Khám phá',
                ctaUrl: '/collections/new-arrivals',
                background: 'linear-gradient(180deg, #fb7185 0%, #f97316 50%, #fcd34d 100%)',
                textColor: '#ffffff',
                badgeBackground: 'rgba(255, 255, 255, 0.18)',
                badgeTextColor: '#ffffff',
                footerBackground: 'rgba(255,255,255,0.92)',
                footerTextColor: '#0f172a',
              },
              {
                id: 'side-banner-right',
                slot: 'right',
                label: 'FLASH SALE',
                title: 'Bộ sưu tập công nghệ',
                description: 'Sở hữu thiết bị mới nhất với ưu đãi độc quyền trong 48 giờ.',
                highlight: 'Chỉ 48h',
                ctaLabel: 'Mua ngay',
                ctaUrl: '/collections/tech',
                background: 'linear-gradient(180deg, #38bdf8 0%, #6366f1 50%, #0f172a 100%)',
                textColor: '#ffffff',
                badgeBackground: 'rgba(255, 255, 255, 0.18)',
                badgeTextColor: '#ffffff',
                footerBackground: 'rgba(15,23,42,0.9)',
                footerTextColor: '#f8fafc',
              },
            ],
          },
        },
        translations: [
          {
            locale: 'en',
            title: 'Framing the hero experience',
            subtitle: 'High-impact vertical banners hugging both sides of the hero area',
            description: 'Promote seasonal offers or flash sale spotlights with a dual-banner layout that stays out of the content flow on larger screens.',
          },
          {
            locale: 'vi',
            title: 'Bộ đôi banner hai bên',
            subtitle: 'Bắt mắt ngay dưới submenu với cùng kích thước 140×470px',
            description: 'Tận dụng khu vực hai bên để quảng bá khuyến mãi, flash sale hoặc chương trình khách hàng thân thiết trên màn hình lớn.',
          },
        ],
      },
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
          page: 'home',
          type: SectionType.BANNER,
          position: 6,
          isEnabled: true,
          config: {
            cardBorderRadius: '1.75rem',
            cardGap: '1.5rem',
            cardCount: 4,
            cards: [
              {
                id: 'banner-card-look-1',
                imageUrl: 'https://images.unsplash.com/photo-1498050108023-c5249f4df085?auto=format&fit=crop&w=1600&q=80',
                link: {
                  type: 'custom',
                  href: '/collections/editorial',
                  label: 'Shop editorial drop',
                  target: '_self',
                },
              },
              {
                id: 'banner-card-look-2',
                imageUrl: 'https://images.unsplash.com/photo-1472851294608-062f824d29cc?auto=format&fit=crop&w=1600&q=80',
                link: {
                  type: 'custom',
                  href: '/campaigns/lookbook',
                  label: 'View lookbook',
                  target: '_self',
                },
              },
              {
                id: 'banner-card-look-3',
                imageUrl: 'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?auto=format&fit=crop&w=1600&q=80',
                link: {
                  type: 'custom',
                  href: '/collections/accessories',
                  label: 'Explore essentials',
                  target: '_self',
                },
              },
              {
                id: 'banner-card-look-4',
                imageUrl: 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?auto=format&fit=crop&w=1600&q=80',
                link: {
                  type: 'custom',
                  href: '/stories/sustainable-stack',
                  label: 'Read the story',
                  target: '_self',
                },
              },
            ],
          },
        },
        translations: [
          {
            locale: 'en',
            title: 'Adaptive banner grid',
            subtitle: 'Drop-ready creatives in grid 2, 3, or 4 layouts',
            description: 'Use the banner grid section to choreograph hero imagery, editorial CTAs, or evergreen promos. Pick the link target, override the border radius, and mix grid presets without touching code.',
            heroDescription: null,
          },
          {
            locale: 'vi',
            title: 'Grid banner linh hoạt',
            subtitle: 'Hiển thị banner theo lưới 2, 3 hoặc 4 cột',
            description: 'Tạo các banner nổi bật với liên kết tuỳ chọn, bo góc theo brand và bố cục đa dạng để kể câu chuyện sản phẩm trực quan ngay trong admin.',
            heroDescription: null,
          },
        ],
      },
      {
        section: {
          page: 'home',
          type: SectionType.FEATURES,
          position: 7,
          isEnabled: true,
          config: {
            layout: 'grid',
            columns: 3,
            highlight: {
              eyebrow: 'Why shop with us',
              title: 'Everything shoppers need in one cart',
              accentColor: '#0ea5e9',
            },
            items: [
              {
                id: 'usp-express-shipping',
                icon: '🚚',
                title: 'Express nationwide shipping',
                description: 'Orders leave Ho Chi Minh City and Hanoi fulfillment hubs within 24 hours with live tracking updates.',
                supporting: 'Free shipping over ₫499K',
              },
              {
                id: 'usp-try-first',
                icon: '🧵',
                title: 'Premium fabrics & sizing help',
                description: 'Verified suppliers and on–page fit guides keep returns low and confidence high.',
                supporting: 'Sourced from regional ateliers',
              },
              {
                id: 'usp-payments',
                icon: '💳',
                title: 'Flexible checkout',
                description: 'Support for COD, BNPL partners, and corporate invoicing for bulk purchases in one flow.',
                supporting: 'Secured via PCI-DSS gateway',
              },
            ],
          },
        },
        translations: [
          {
            locale: 'en',
            title: 'Reasons buyers convert faster',
            subtitle: 'Merchandising-ready modules highlight trust signals on the homepage',
            description: 'Use the features section to surface fulfillment benefits, checkout perks, or brand differentiators for your storefront.',
            heroDescription: null,
          },
          {
            locale: 'vi',
            title: 'Lý do khách hàng chọn mua',
            subtitle: 'Nhấn mạnh dịch vụ giao hàng, đổi trả và thanh toán ngay trên trang chủ',
            description: 'Giới thiệu các điểm mạnh như giao nhanh, hỗ trợ kích cỡ và phương thức thanh toán linh hoạt để tăng tỷ lệ chuyển đổi.',
            heroDescription: null,
          },
        ],
      },
      {
        section: {
          page: 'home',
          type: SectionType.TESTIMONIALS,
          position: 8,
          isEnabled: true,
          config: {
            layout: 'slider',
            columns: 2,
            autoplay: true,
            interval: 9000,
            testimonials: [
              {
                id: 'testimonial-huyen',
                quote: 'The Pre-Fall collection arrived in under two days and every piece matched the lookbook perfectly.',
                customerName: 'Tran Thu Huyen',
                customerTitle: 'Fashion editor, Lifestyle Magazine',
                avatarUrl: 'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&w=600&q=80',
                rating: 5,
                orderValue: '₫18,900,000',
              },
              {
                id: 'testimonial-hung',
                quote: 'Mix-and-match bundles plus COD made it easy to outfit our team for the campaign roadshow.',
                customerName: 'Nguyen Minh Hung',
                customerTitle: 'Brand manager, North Star Studio',
                avatarUrl: 'https://images.unsplash.com/photo-1544723795-3fb6469f5b39?auto=format&fit=crop&w=600&q=80',
                rating: 5,
                orderValue: '₫42,300,000',
              },
              {
                id: 'testimonial-anh',
                quote: 'We synced inventory alerts with our CRM and never worry about overselling hero items anymore.',
                customerName: 'Le Hoai Anh',
                customerTitle: 'Founder, KOVA Boutique',
                avatarUrl: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=600&q=80',
                rating: 4.5,
                orderValue: '₫27,500,000',
              },
            ],
          },
        },
        translations: [
          {
            locale: 'en',
            title: 'Loved by modern retail teams',
            subtitle: 'Customer stories keep consideration high',
            description: 'Showcase quotes from stylists, VIP shoppers, or wholesale partners to validate your assortment.',
            heroDescription: null,
          },
          {
            locale: 'vi',
            title: 'Được tin dùng bởi các đội ngũ bán hàng hiện đại',
            subtitle: 'Chia sẻ cảm nhận thật để tăng độ tin cậy',
            description: 'Trưng bày lời khen của khách VIP, doanh nghiệp hoặc fashion editor để tạo niềm tin ngay tại trang chủ.',
            heroDescription: null,
          },
        ],
      },
      {
        section: {
          page: 'home',
          type: SectionType.VIDEO,
          position: 9,
          isEnabled: true,
          config: {
            type: 'embed',
            autoplay: false,
            videos: [
              {
                id: 'atelier-film',
                type: 'embed',
                title: 'Behind the atelier',
                description: 'Meet the pattern team and see how each garment is finished by hand.',
                embedUrl: 'https://www.youtube.com/embed/mNFVvHxkNNM?rel=0&showinfo=0',
                posterImage: 'https://images.unsplash.com/photo-1475180098004-ca77a66827be?auto=format&fit=crop&w=1600&q=80',
                caption: 'Shot in Saigon with our lead makers',
              },
              {
                id: 'showroom-lookbook',
                type: 'embed',
                title: 'Showroom lookbook',
                description: 'Stylists walk through the best-selling looks for the season.',
                embedUrl: 'https://www.youtube.com/embed/ysz5S6PUM-U',
                posterImage: 'https://images.unsplash.com/photo-1445205170230-053b83016050?auto=format&fit=crop&w=1600&q=80',
                caption: 'Captured during the VIP preview event',
              },
              {
                id: 'material-story',
                type: 'embed',
                title: 'Material story',
                description: 'Explore how we source silk, leather, and artisan trims across Vietnam.',
                embedUrl: 'https://www.youtube.com/embed/oUFJJNQGwhk',
                posterImage: 'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?auto=format&fit=crop&w=1600&q=80',
                caption: 'Field recordings from Hanoi and Da Lat partners',
              },
            ],
            cta: {
              label: 'Shop the collection',
              href: '/collections/pre-fall',
            },
          },
        },
        translations: [
          {
            locale: 'en',
            title: 'Crafted with intention',
            subtitle: 'A short film highlighting our materials and makers',
            description: 'Use the video section to blend editorial storytelling with direct shoppability.',
            heroDescription: null,
          },
          {
            locale: 'vi',
            title: 'Từng chi tiết đều được chăm chút',
            subtitle: 'Video kể về hành trình chọn chất liệu và may đo thủ công',
            description: 'Kết hợp nội dung truyền cảm hứng với nút mua hàng để giữ chân khách lâu hơn.',
            heroDescription: null,
          },
        ],
      },
      {
        section: {
          page: 'home',
          type: SectionType.STATS,
          position: 10,
          isEnabled: true,
          config: {
            layout: 'counter',
            columns: 4,
            background: 'surface',
            stats: [
              {
                id: 'stat-orders',
                label: 'Orders shipped',
                value: 58000,
                suffix: '+',
                description: 'Tracked deliveries since 2018',
              },
              {
                id: 'stat-cities',
                label: 'Cities served',
                value: 63,
                suffix: ' provinces',
                description: 'Nationwide coverage with partner couriers',
              },
              {
                id: 'stat-repeat',
                label: 'Repeat customers',
                value: 68,
                suffix: '%',
                description: 'Average returning buyers every quarter',
              },
              {
                id: 'stat-rating',
                label: 'Average rating',
                value: 4.9,
                suffix: '/5',
                description: 'Based on 3,200+ authentic reviews',
              },
            ],
          },
        },
        translations: [
          {
            locale: 'en',
            title: 'Proof of performance',
            subtitle: 'Commerce metrics buyers understand',
            description: 'Highlight fulfillment scale, loyalty, or satisfaction data to reduce purchase hesitation.',
            heroDescription: null,
          },
          {
            locale: 'vi',
            title: 'Những con số tạo dựng niềm tin',
            subtitle: 'Cho khách thấy quy mô và chất lượng phục vụ',
            description: 'Trình bày số đơn hàng, phạm vi giao, tỷ lệ quay lại và điểm đánh giá để tăng uy tín.',
            heroDescription: null,
          },
        ],
      },
      {
        section: {
          page: 'home',
          type: SectionType.GALLERY,
          position: 11,
          isEnabled: true,
          config: {
            layout: 'masonry',
            columns: 3,
            gutter: '1.25rem',
            images: [
              {
                id: 'gallery-lookbook-1',
                imageUrl: 'https://images.unsplash.com/photo-1475180098004-ca77a66827be?auto=format&fit=crop&w=1200&q=80',
                label: 'Weekend essentials',
                link: {
                  label: 'Shop look',
                  href: '/collections/weekend',
                },
              },
              {
                id: 'gallery-lookbook-2',
                imageUrl: 'https://images.unsplash.com/photo-1503341455253-b2e723bb3dbb?auto=format&fit=crop&w=1200&q=80',
                label: 'Tailored classics',
                link: {
                  label: 'Discover suits',
                  href: '/collections/tailoring',
                },
              },
              {
                id: 'gallery-lookbook-3',
                imageUrl: 'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?auto=format&fit=crop&w=1200&q=80',
                label: 'Accessories edit',
                link: {
                  label: 'View drop',
                  href: '/collections/accessories',
                },
              },
            ],
          },
        },
        translations: [
          {
            locale: 'en',
            title: 'Lookbook highlights',
            subtitle: 'Merchandising visuals linked to live inventory',
            description: 'Curate seasonal moodboards and deep link to specific collections or PDPs.',
            heroDescription: null,
          },
          {
            locale: 'vi',
            title: 'Lookbook nổi bật',
            subtitle: 'Hình ảnh truyền cảm hứng gắn với kho hàng trực tiếp',
            description: 'Tạo moodboard theo mùa và dẫn thẳng đến bộ sưu tập hoặc sản phẩm cụ thể.',
            heroDescription: null,
          },
        ],
      },
      {
        section: {
          page: 'home',
          type: SectionType.CONTACT_FORM,
          position: 12,
          isEnabled: true,
          config: {
            fields: ['name', 'email', 'phone', 'company', 'message'],
            submitLabel: 'Book a styling session',
            successMessage: 'Thank you! Our concierge team will reach out within one business day.',
            supportChannels: {
              phone: '1900 636 000',
              email: 'care@quasar-commerce.app',
              chat: 'Live via Zalo OA @quasar-store',
            },
            perks: [
              'Dedicated wholesale pricing for teams',
              'On-site fitting events in HCMC & Hanoi',
              'Priority production slots for co-branded drops',
            ],
          },
        },
        translations: [
          {
            locale: 'en',
            title: 'Need tailored support?',
            subtitle: 'Connect with our sales concierge for styling or bulk orders',
            description: 'Capture high-intent leads from the homepage with a flexible contact form.',
            heroDescription: null,
          },
          {
            locale: 'vi',
            title: 'Cần tư vấn riêng?',
            subtitle: 'Nhận hỗ trợ từ đội ngũ concierge cho đơn số lượng lớn hoặc đặt lịch thử đồ',
            description: 'Thu thập khách hàng tiềm năng ngay trên trang chủ bằng form liên hệ linh hoạt.',
            heroDescription: null,
          },
        ],
      },
      {
        section: {
          page: 'home',
          type: SectionType.WHY_CHOOSE_US,
          position: 13,
          isEnabled: true,
          config: {
            layout: 'grid',
            columns: 5,
            gap: '1.25rem',
            cardPadding: '2rem 1.5rem',
            uppercaseTitles: true,
            descriptionClamp: 3,
            hexagonSize: '12rem',
            hexagonBorderWidth: 6,
            items: [
              {
                id: 'why-experience',
                title: '30+ Năm Kinh Nghiệm',
                description: 'Với hơn 30 năm kinh nghiệm trong ngành, chúng tôi tự hào mang đến dịch vụ chuyên nghiệp và đáng tin cậy.',
                icon: 'history',
                accentColor: '#00A0DC',
                gradientFrom: '#017399',
                gradientTo: '#00A0DC',
                iconColor: '#00A0DC',
                backgroundLight: '#FFFFFF',
                backgroundDark: '#0F172A',
              },
              {
                id: 'why-fast-delivery',
                title: 'Bàn Giao Xe Nhanh Nhất',
                description: 'Quy trình bàn giao xe được tối ưu giúp bạn nhận xe nhanh chóng với thủ tục đơn giản.',
                icon: 'timer',
                accentColor: '#00A0DC',
                gradientFrom: '#0C8AB4',
                gradientTo: '#34C8FF',
                iconColor: '#34C8FF',
                backgroundLight: '#FFFFFF',
                backgroundDark: '#111827',
              },
              {
                id: 'why-on-site-warranty',
                title: 'Bảo Hành Tận Nơi',
                description: 'Đội ngũ kỹ thuật túc trực 24/7 để hỗ trợ bảo hành tại chỗ, giúp xe luôn vận hành ổn định.',
                icon: 'wrench',
                accentColor: '#00A0DC',
                gradientFrom: '#0284C7',
                gradientTo: '#38BDF8',
                iconColor: '#38BDF8',
                backgroundLight: '#FFFFFF',
                backgroundDark: '#0B1120',
              },
              {
                id: 'why-competitive-price',
                title: 'Giá Cả Cạnh Tranh',
                description: 'Cam kết mang đến mức giá tốt nhất thị trường cùng nhiều ưu đãi hấp dẫn dành cho doanh nghiệp.',
                icon: 'piggy-bank',
                accentColor: '#00A0DC',
                gradientFrom: '#0EA5E9',
                gradientTo: '#14B8A6',
                iconColor: '#0EA5E9',
                backgroundLight: '#FFFFFF',
                backgroundDark: '#06111F',
              },
              {
                id: 'why-japan-engine',
                title: 'Động Cơ Nhật Bản',
                description: 'Sử dụng động cơ Nhật Bản chất lượng cao, đảm bảo độ bền và hiệu suất vượt trội.',
                icon: 'gauge',
                accentColor: '#00A0DC',
                gradientFrom: '#0F8EC7',
                gradientTo: '#00D4FF',
                iconColor: '#00D4FF',
                backgroundLight: '#FFFFFF',
                backgroundDark: '#050F1A',
              },
            ],
          },
        },
        translations: [
          {
            locale: 'en',
            title: 'Why buyers trust our fleet',
            subtitle: 'Proof points for every delivery promise',
            description: 'Highlight experience, fulfillment speed, on-site warranty, and technical quality to give shoppers confidence.',
            heroDescription: null,
          },
          {
            locale: 'vi',
            title: 'Vì sao khách hàng chọn chúng tôi',
            subtitle: 'Cam kết dịch vụ rõ ràng cho từng đơn hàng',
            description: 'Nhấn mạnh kinh nghiệm, tốc độ bàn giao, bảo hành tận nơi và chất lượng động cơ để tạo niềm tin ngay trên trang chủ.',
            heroDescription: null,
          },
        ],
      },
      {
        section: {
          page: 'home',
          type: SectionType.INTRODUCTION,
          position: 14,
          isEnabled: true,
          config: {
            stats: [
              { id: 'exp', value: '30+', label: 'Năm kinh nghiệm' },
              { id: 'customers', value: '1000+', label: 'Khách hàng' },
              { id: 'delay', value: '24/7', label: 'Hỗ trợ kỹ thuật' },
              { id: 'satisfaction', value: '100%', label: 'Khách hàng hài lòng' },
            ],
            ctaLabel: 'Tìm hiểu thêm',
            ctaUrl: '/about',
          },
        },
        translations: [
          {
            locale: 'en',
            title: 'INTRODUCTION TO QUASAR',
            description: '<p>Quasar is a leading provider of comprehensive e-commerce solutions, dedicated to empowering businesses with cutting-edge technology and exceptional service.</p><p><br></p><p>We are a pioneer in the digital commerce industry, offering scalable and resilient platforms for modern retail. As a trusted partner to global brands, we provide an ecosystem of tools for store management, analytics, and omnichannel growth. Our platform is built on modern architecture ensuring high performance, security, and seamless operation. With a global expert team, Quasar is committed to innovation and dedicated support, driving the sustainable development of your business.</p>',
          },
          {
            locale: 'vi',
            title: 'GIỚI THIỆU VỀ QUASAR',
            description: '<p>Quasar là đơn vị tiên phong cung cấp các giải pháp thương mại điện tử toàn diện, cam kết mang đến công nghệ tiên tiến và dịch vụ xuất sắc cho doanh nghiệp.</p><p><br></p><p>Chúng tôi cung cấp nền tảng linh hoạt và mạnh mẽ giúp doanh nghiệp bán lẻ hiện đại quản lý cửa hàng, phân tích dữ liệu và phát triển đa kênh hiệu quả. Là đối tác tin cậy của nhiều thương hiệu toàn cầu, hệ thống của chúng tôi đảm bảo hiệu suất cao, bảo mật và vận hành tối ưu. Với đội ngũ chuyên gia tận tâm, Quasar cam kết chất lượng vượt trội, đồng hành cùng sự phát triển bền vững của doanh nghiệp bạn.</p>',
          },
        ],
      },
      // PRODUCT DETAIL PAGE SECTIONS
      {
        section: {
          page: 'product_detail',
          type: SectionType.PRODUCT_DETAILS,
          position: 0,
          isEnabled: true,
          config: {
            showDescription: true,
            showSpecifications: true,
            policies: [
              {
                id: 'pdp-policy-shipping',
                icon: 'truck',
                title: 'Free Shipping',
                description: 'Free shipping for orders over 500k.',
              },
              {
                id: 'pdp-policy-return',
                icon: 'refresh-cw',
                title: 'Easy Return',
                description: 'Support 30 days return policy.',
              },
              {
                id: 'pdp-policy-warranty',
                icon: 'shield-check',
                title: 'Official Warranty',
                description: 'Includes 1 year warranty.',
              },
            ],
          },
        },
        translations: [
          {
            locale: 'en',
            title: 'Product Details',
            description: 'Main product information including description, specifications and policy highlights.',
          },
          {
            locale: 'vi',
            title: 'Chi tiết sản phẩm',
            description: 'Thông tin chính bao gồm mô tả, thông số kỹ thuật và các chính sách nổi bật.',
          },
        ],
      },
      {
        section: {
          page: 'product_detail',
          type: SectionType.VIDEO,
          position: 1,
          isEnabled: true,
          config: {
            type: 'embed',
            autoplay: false,
            videos: [
              {
                id: 'pdp-video-demo',
                type: 'embed',
                title: 'Product Demo',
                description: 'See the product in action.',
                embedUrl: 'https://www.youtube.com/embed/mNFVvHxkNNM?rel=0&showinfo=0',
                posterImage: 'https://images.unsplash.com/photo-1475180098004-ca77a66827be?auto=format&fit=crop&w=1600&q=80',
              },
            ],
          },
        },
        translations: [
          {
            locale: 'en',
            title: 'Product Video',
            description: 'Watch our product demonstration video.',
          },
          {
            locale: 'vi',
            title: 'Video sản phẩm',
            description: 'Xem video giới thiệu chi tiết về sản phẩm.',
          },
        ],
      },
      {
        section: {
          page: 'product_detail',
          type: SectionType.TESTIMONIALS,
          position: 2,
          isEnabled: true,
          config: {
            layout: 'slider',
            columns: 2,
            autoplay: true,
            testimonials: [
              {
                id: 'pdp-review-1',
                quote: 'The quality exceeded my expectations. formatting is great.',
                customerName: 'Minh Anh',
                rating: 5,
              },
              {
                id: 'pdp-review-2',
                quote: 'Very fast delivery and good customer service.',
                customerName: 'Tuan Hung',
                rating: 4.5,
              },
            ],
          },
        },
        translations: [
          {
            locale: 'en',
            title: 'Customer Reviews',
            description: 'See what other customers are saying.',
          },
          {
            locale: 'vi',
            title: 'Đánh giá từ khách hàng',
            description: 'Xem cảm nhận của khách hàng đã mua sản phẩm.',
          },
        ],
      },
      {
        section: {
          page: 'home',
          type: SectionType.BRAND_SHOWCASE,
          position: 14,
          isEnabled: true,
          config: {
            layout: 'grid',
            strategy: 'newest',
            limit: 8,
            columns: 4,
            logoShape: 'rounded',
            backgroundStyle: 'surface',
          },
        },
        translations: [
          {
            locale: 'en',
            title: 'Brands that launch with us',
            subtitle: 'Flagship partners & private labels',
            description: 'Spotlight the manufacturers, designers, and partner labels powering every collection. Pulls the latest active brands automatically.',
            heroDescription: null,
          },
          {
            locale: 'vi',
            title: 'Đối tác thương hiệu đồng hành',
            subtitle: 'Từ nhà thiết kế địa phương đến nhãn hàng độc quyền',
            description: 'Hiển thị các thương hiệu nổi bật đang hợp tác cùng cửa hàng. Khu vực này tự động lấy danh sách thương hiệu đang hoạt động.',
            heroDescription: null,
          },
        ],
      },
      {
        section: {
          page: 'news',
          type: SectionType.HERO_SLIDER,
          position: 0,
          isEnabled: true,
          config: {
            autoplay: true,
            interval: 7000,
            layout: 'container',
            slides: [
              {
                id: 'news-hero-1',
                title: 'Stories that shape the roadmap',
                subtitle: 'Highlights, announcements, and press coverage',
                imageUrl: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&w=1600&q=80',
                ctaLabel: 'Explore newsroom',
                ctaUrl: '/news',
              },
              {
                id: 'news-hero-2',
                title: 'Launch updates & editorials',
                subtitle: 'Stay current on the latest developments',
                imageUrl: 'https://images.unsplash.com/photo-1498050108023-c5249f4df085?auto=format&fit=crop&w=1600&q=80',
                ctaLabel: 'Read updates',
                ctaUrl: '/news',
              },
            ],
          },
        },
        translations: [
          {
            locale: 'en',
            title: 'Newsroom',
            subtitle: 'Company updates, insights, and highlights',
            description: 'Stay in the loop with curated updates, press stories, and product announcements.',
            heroDescription: 'Bring your newsroom to life with a configurable hero section.',
          },
          {
            locale: 'vi',
            title: 'Tin tức & cập nhật',
            subtitle: 'Thông báo mới nhất từ đội ngũ',
            description: 'Tổng hợp thông tin, bài viết nổi bật và cập nhật sản phẩm quan trọng.',
            heroDescription: 'Trình bày điểm nhấn của trang tin với hero linh hoạt.',
          },
        ],
      },
      {
        section: {
          page: 'news',
          type: SectionType.NEWS,
          position: 1,
          isEnabled: true,
          config: {
            rows: [
              {
                id: 'news-latest-list',
                title: 'Tin mới nhất',
                strategy: 'latest',
                limit: 5,
                columns: 1,
                card: {
                  layout: 'horizontal',
                  badgeTone: 'primary',
                  ctaText: 'Đọc thêm',
                  showCategory: true,
                  showPublishDate: true,
                  showExcerpt: true,
                  showReadMore: true,
                },
              },
              {
                id: 'news-featured',
                title: 'Tin nổi bật',
                strategy: 'featured',
                limit: 4,
                columns: 2,
                card: {
                  layout: 'grid',
                  badgeTone: 'emphasis',
                  ctaText: 'Xem chi tiết',
                  showCategory: true,
                  showPublishDate: true,
                  showExcerpt: true,
                  showReadMore: true,
                },
              },
              {
                id: 'news-grid',
                title: 'Tin tổng hợp',
                strategy: 'latest',
                limit: 6,
                columns: 3,
                card: {
                  layout: 'grid',
                  badgeTone: 'neutral',
                  ctaText: 'Xem thêm',
                  showCategory: true,
                  showPublishDate: true,
                  showExcerpt: false,
                  showReadMore: true,
                },
              },
            ],
          },
        },
        translations: [
          {
            locale: 'en',
            title: 'News layout mix',
            subtitle: 'Latest, featured, and grid stories',
            description: 'Combine multiple newsroom layouts in one configurable section.',
            heroDescription: null,
          },
          {
            locale: 'vi',
            title: 'Tổng hợp nội dung tin tức',
            subtitle: 'Tin mới, nổi bật và dạng lưới',
            description: 'Kết hợp nhiều bố cục hiển thị tin tức trong một section.',
            heroDescription: null,
          },
        ],
      },
      {
        section: {
          page: 'news',
          type: SectionType.CUSTOM_HTML,
          position: 2,
          isEnabled: true,
          config: {
            html: '<section class="rounded-3xl bg-gradient-to-r from-slate-900 via-indigo-900 to-slate-900 p-10 text-white">\n  <div class="mx-auto max-w-3xl text-center">\n    <p class="text-sm uppercase tracking-[0.3em] text-indigo-200">Newsletter</p>\n    <h3 class="mt-3 text-3xl font-semibold">Nhận bản tin mới nhất</h3>\n    <p class="mt-4 text-white/70">Cập nhật tin tức, sự kiện và thông báo mới nhất mỗi tuần.</p>\n    <form class="mt-6 flex flex-col gap-3 sm:flex-row">\n      <input type="email" placeholder="Email của bạn" class="flex-1 rounded-full px-4 py-3 text-sm text-slate-900" />\n      <button type="button" class="rounded-full bg-white px-6 py-3 text-sm font-semibold text-slate-900">Đăng ký</button>\n    </form>\n  </div>\n</section>',
          },
        },
        translations: [
          {
            locale: 'en',
            title: 'Subscribe for weekly updates',
            description: 'Get the latest headlines and product news delivered to your inbox.',
            heroDescription: null,
          },
          {
            locale: 'vi',
            title: 'Đăng ký nhận bản tin',
            description: 'Nhận thông báo mới nhất về sự kiện và sản phẩm mỗi tuần.',
            heroDescription: null,
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
          page: 'product',
          type: SectionType.PRODUCT_LIST,
          position: 2,
          isEnabled: true,
          config: {
            showSidebar: true,
            stickySidebar: true,
            pageSize: 12,
            gridColumns: 3,
            showSort: true,
            showHeader: true,
          },
        },
        translations: [
          {
            locale: 'en',
            title: 'All products',
            subtitle: 'Browse the full catalog with filters and sorting',
            description: 'Use filters to narrow down by brand, category, and price.',
            heroDescription: null,
          },
          {
            locale: 'vi',
            title: 'Tất cả sản phẩm',
            subtitle: 'Duyệt danh mục với bộ lọc và sắp xếp',
            description: 'Áp dụng bộ lọc theo thương hiệu, danh mục và giá để tìm nhanh hơn.',
            heroDescription: null,
          },
        ],
      },
      {
        section: {
          page: 'product_detail',
          type: SectionType.CUSTOM_HTML,
          position: 3,
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
      {
        section: {
          page: 'home',
          type: SectionType.SERVICE_LIST,
          position: 14,
          isEnabled: true,
          config: {
            serviceIds: [], // Defaults to showing all services
            showHeader: true,
          },
        },
        translations: [
          {
            locale: 'en',
            title: 'Our Services',
            subtitle: 'Professional solutions for your business',
            description: 'Explore our comprehensive range of services designed to meet your needs.',
          },
          {
            locale: 'vi',
            title: 'Dịch vụ của chúng tôi',
            subtitle: 'Giải pháp chuyên nghiệp cho doanh nghiệp',
            description: 'Khám phá các dịch vụ đa dạng được thiết kế riêng cho nhu cầu của bạn.',
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

  }
}
