import { Injectable } from '@nestjs/common';
import { DataSource, FindOptionsWhere } from 'typeorm';
import { SeederModule } from './seeder.module';
import { MenuEntity } from '../../modules/menus/entities/menu.entity';
import { MenuTranslationEntity } from '../../modules/menus/entities/menu-translation.entity';
import { MenuType, MenuTarget, TopMenuTimeFormat } from '@shared/enums/menu.enums';

type MenuSeedData = {
  menu: Partial<MenuEntity>;
  translations: Array<Partial<MenuTranslationEntity>>;
  children?: MenuSeedData[];
};

@Injectable()
export class MenusSeeder implements SeederModule {
  constructor(private readonly dataSource: DataSource) {}

  async seed(): Promise<void> {
    const menuRepository = this.dataSource.getRepository(MenuEntity);
    const translationRepository = this.dataSource.getRepository(MenuTranslationEntity);

    const baseMenus: MenuSeedData[] = [
      {
        menu: {
          menuGroup: 'main',
          type: MenuType.LINK,
          url: '/',
          target: MenuTarget.SELF,
          position: 0,
          isEnabled: true,
          icon: 'home',
          config: {},
          isMegaMenu: false,
        },
        translations: [
          {
            locale: 'en',
            label: 'Home',
            description: 'Go to homepage',
          },
          {
            locale: 'vi',
            label: 'Trang chủ',
            description: 'Về trang chủ',
          },
        ],
      },
      {
        menu: {
          menuGroup: 'main',
          type: MenuType.FEATURED_PRODUCTS,
          target: MenuTarget.SELF,
          position: 1,
          isEnabled: true,
          icon: 'shopping-bag',
          config: {
            showCategories: true,
            maxItems: 8,
          },
          isMegaMenu: true,
          megaMenuColumns: 4,
        },
        translations: [
          {
            locale: 'en',
            label: 'Products',
            description: 'Browse our products',
          },
          {
            locale: 'vi',
            label: 'Sản phẩm',
            description: 'Xem sản phẩm của chúng tôi',
          },
        ],
      },
      {
        menu: {
          menuGroup: 'main',
          type: MenuType.CATEGORY,
          referenceId: 'electronics',
          target: MenuTarget.SELF,
          position: 2,
          isEnabled: true,
          icon: 'laptop',
          config: {
            showSubcategories: true,
            displayStyle: 'grid',
          },
          isMegaMenu: true,
          megaMenuColumns: 3,
        },
        translations: [
          {
            locale: 'en',
            label: 'Electronics',
            description: 'Latest electronics and gadgets',
          },
          {
            locale: 'vi',
            label: 'Điện tử',
            description: 'Thiết bị điện tử mới nhất',
          },
        ],
      },
      {
        menu: {
          menuGroup: 'main',
          type: MenuType.NEW_PRODUCTS,
          target: MenuTarget.SELF,
          position: 3,
          isEnabled: true,
          icon: 'sparkles',
          config: {
            maxItems: 12,
            showPrice: true,
            showImage: true,
          },
          isMegaMenu: false,
        },
        translations: [
          {
            locale: 'en',
            label: 'New Arrivals',
            description: 'Check out our latest products',
          },
          {
            locale: 'vi',
            label: 'Hàng mới về',
            description: 'Xem sản phẩm mới nhất của chúng tôi',
          },
        ],
      },
      {
        menu: {
          menuGroup: 'main',
          type: MenuType.SALE_PRODUCTS,
          target: MenuTarget.SELF,
          position: 4,
          isEnabled: true,
          icon: 'tag',
          textColor: '#ef4444',
          config: {
            discountThreshold: 10,
            showDiscount: true,
            maxItems: 8,
          },
          isMegaMenu: false,
        },
        translations: [
          {
            locale: 'en',
            label: 'Sale',
            description: 'Special offers and discounts',
          },
          {
            locale: 'vi',
            label: 'Khuyến mãi',
            description: 'Ưu đãi đặc biệt và giảm giá',
          },
        ],
      },
      {
        menu: {
          menuGroup: 'main',
          type: MenuType.BRAND,
          referenceId: 'featured-brands',
          target: MenuTarget.SELF,
          position: 5,
          isEnabled: true,
          icon: 'award',
          config: {
            showLogo: true,
            gridColumns: 4,
          },
          isMegaMenu: false,
        },
        translations: [
          {
            locale: 'en',
            label: 'Brands',
            description: 'Shop by brand',
          },
          {
            locale: 'vi',
            label: 'Thương hiệu',
            description: 'Mua sắm theo thương hiệu',
          },
        ],
      },
      {
        menu: {
          menuGroup: 'main',
          type: MenuType.LINK,
          url: '/about',
          target: MenuTarget.SELF,
          position: 6,
          isEnabled: true,
          icon: 'info',
          config: {},
          isMegaMenu: false,
        },
        translations: [
          {
            locale: 'en',
            label: 'About Us',
            description: 'Learn more about our company',
          },
          {
            locale: 'vi',
            label: 'Về chúng tôi',
            description: 'Tìm hiểu thêm về công ty',
          },
        ],
      },
      {
        menu: {
          menuGroup: 'main',
          type: MenuType.LINK,
          url: '/contact',
          target: MenuTarget.SELF,
          position: 7,
          isEnabled: true,
          icon: 'phone',
          config: {},
          isMegaMenu: false,
        },
        translations: [
          {
            locale: 'en',
            label: 'Contact',
            description: 'Get in touch with us',
          },
          {
            locale: 'vi',
            label: 'Liên hệ',
            description: 'Liên hệ với chúng tôi',
          },
        ],
      },
      {
        menu: {
          menuGroup: 'main',
          type: MenuType.LINK,
          url: '/support',
          target: MenuTarget.SELF,
          position: 8,
          isEnabled: true,
          icon: 'life-buoy',
          config: {
            highlight: true,
          },
          isMegaMenu: false,
        },
        translations: [
          {
            locale: 'en',
            label: 'Support',
            description: 'Help center resources',
          },
          {
            locale: 'vi',
            label: 'Hỗ trợ',
            description: 'Trung tâm hỗ trợ khách hàng',
          },
        ],
        children: [
          {
            menu: {
              menuGroup: 'main',
              type: MenuType.LINK,
              url: '/support/faq',
              target: MenuTarget.SELF,
              position: 0,
              isEnabled: true,
              icon: 'help-circle',
              config: {},
              isMegaMenu: false,
            },
            translations: [
              {
                locale: 'en',
                label: 'FAQ',
                description: 'Common customer questions',
              },
              {
                locale: 'vi',
                label: 'Câu hỏi thường gặp',
                description: 'Các câu hỏi phổ biến',
              },
            ],
          },
        ],
      },
      // Footer menu
      {
        menu: {
          menuGroup: 'footer',
          type: MenuType.LINK,
          url: '/',
          target: MenuTarget.SELF,
          position: 0,
          isEnabled: true,
          config: {},
          isMegaMenu: false,
        },
        translations: [
          {
            locale: 'en',
            label: 'Home',
          },
          {
            locale: 'vi',
            label: 'Trang chủ',
          },
        ],
      },
      {
        menu: {
          menuGroup: 'footer',
          type: MenuType.LINK,
          url: '/products',
          target: MenuTarget.SELF,
          position: 1,
          isEnabled: true,
          config: {},
          isMegaMenu: false,
        },
        translations: [
          {
            locale: 'en',
            label: 'All Products',
          },
          {
            locale: 'vi',
            label: 'Tất cả sản phẩm',
          },
        ],
      },
      {
        menu: {
          menuGroup: 'footer',
          type: MenuType.LINK,
          url: '/about',
          target: MenuTarget.SELF,
          position: 2,
          isEnabled: true,
          config: {},
          isMegaMenu: false,
        },
        translations: [
          {
            locale: 'en',
            label: 'About',
          },
          {
            locale: 'vi',
            label: 'Giới thiệu',
          },
        ],
      },
      {
        menu: {
          menuGroup: 'footer',
          type: MenuType.LINK,
          url: '/contact',
          target: MenuTarget.SELF,
          position: 3,
          isEnabled: true,
          config: {},
          isMegaMenu: false,
        },
        translations: [
          {
            locale: 'en',
            label: 'Contact',
          },
          {
            locale: 'vi',
            label: 'Liên hệ',
          },
        ],
      },
      {
        menu: {
          menuGroup: 'footer',
          type: MenuType.LINK,
          url: '/privacy',
          target: MenuTarget.SELF,
          position: 4,
          isEnabled: true,
          config: {},
          isMegaMenu: false,
        },
        translations: [
          {
            locale: 'en',
            label: 'Privacy Policy',
          },
          {
            locale: 'vi',
            label: 'Chính sách bảo mật',
          },
        ],
      },
      {
        menu: {
          menuGroup: 'footer',
          type: MenuType.LINK,
          url: '/terms',
          target: MenuTarget.SELF,
          position: 5,
          isEnabled: true,
          config: {},
          isMegaMenu: false,
        },
        translations: [
          {
            locale: 'en',
            label: 'Terms of Service',
          },
          {
            locale: 'vi',
            label: 'Điều khoản dịch vụ',
          },
        ],
      },
    ];

    const headerActionMenus: MenuSeedData[] = [
      {
        menu: {
          menuGroup: 'main',
          type: MenuType.SEARCH_BUTTON,
          target: MenuTarget.SELF,
          position: 90,
          isEnabled: true,
          icon: 'search',
          config: {},
          isMegaMenu: false,
        },
        translations: [
          {
            locale: 'en',
            label: 'Search',
            description: 'Open search overlay',
          },
          {
            locale: 'vi',
            label: 'Tìm kiếm',
            description: 'Mở khung tìm kiếm',
          },
        ],
      },
      {
        menu: {
          menuGroup: 'main',
          type: MenuType.LOCALE_SWITCHER,
          target: MenuTarget.SELF,
          position: 91,
          isEnabled: true,
          icon: 'globe',
          config: {},
          isMegaMenu: false,
        },
        translations: [
          {
            locale: 'en',
            label: 'Languages',
            description: 'Switch website language',
          },
          {
            locale: 'vi',
            label: 'Ngôn ngữ',
            description: 'Chuyển đổi ngôn ngữ trang',
          },
        ],
      },
      {
        menu: {
          menuGroup: 'main',
          type: MenuType.THEME_TOGGLE,
          target: MenuTarget.SELF,
          position: 92,
          isEnabled: true,
          icon: 'moon',
          config: {},
          isMegaMenu: false,
        },
        translations: [
          {
            locale: 'en',
            label: 'Theme',
            description: 'Toggle light or dark mode',
          },
          {
            locale: 'vi',
            label: 'Giao diện',
            description: 'Bật tắt chế độ sáng/tối',
          },
        ],
      },
      {
        menu: {
          menuGroup: 'main',
          type: MenuType.CART_BUTTON,
          target: MenuTarget.SELF,
          position: 93,
          isEnabled: true,
          icon: 'shopping-cart',
          config: {},
          isMegaMenu: false,
        },
        translations: [
          {
            locale: 'en',
            label: 'Cart',
            description: 'View shopping cart',
          },
          {
            locale: 'vi',
            label: 'Giỏ hàng',
            description: 'Xem giỏ hàng của bạn',
          },
        ],
      },
      {
        menu: {
          menuGroup: 'main',
          type: MenuType.USER_PROFILE,
          target: MenuTarget.SELF,
          position: 94,
          isEnabled: true,
          icon: 'user',
          config: {},
          isMegaMenu: false,
        },
        translations: [
          {
            locale: 'en',
            label: 'Profile',
            description: 'Access account options',
          },
          {
            locale: 'vi',
            label: 'Tài khoản',
            description: 'Truy cập tuỳ chọn tài khoản',
          },
        ],
      },
    ];

    const topMenuDefaults: MenuSeedData[] = [
      {
        menu: {
          menuGroup: 'top',
          type: MenuType.TOP_PHONE,
          target: MenuTarget.SELF,
          position: 0,
          isEnabled: true,
          icon: 'phone-call',
          textColor: '#fef9c3',
          backgroundColor: '#92400e',
          config: {
            topPhoneNumber: '(+84) 1900 636 648',
          },
          isMegaMenu: false,
        },
        translations: [
          {
            locale: 'en',
            label: 'Customer Hotline',
            description: 'Need help? Call our hotline.',
          },
          {
            locale: 'vi',
            label: 'Đường dây nóng',
            description: 'Cần hỗ trợ? Gọi cho chúng tôi.',
          },
        ],
      },
      {
        menu: {
          menuGroup: 'top',
          type: MenuType.TOP_EMAIL,
          target: MenuTarget.SELF,
          position: 1,
          isEnabled: true,
          icon: 'mail',
          textColor: '#dbeafe',
          backgroundColor: '#1e3a8a',
          config: {
            topEmailAddress: 'support@megastore.vn',
          },
          isMegaMenu: false,
        },
        translations: [
          {
            locale: 'en',
            label: 'Email Support',
            description: 'Drop us a message anytime.',
          },
          {
            locale: 'vi',
            label: 'Hỗ trợ email',
            description: 'Gửi email cho chúng tôi bất cứ lúc nào.',
          },
        ],
      },
      {
        menu: {
          menuGroup: 'top',
          type: MenuType.TOP_CURRENT_TIME,
          target: MenuTarget.SELF,
          position: 2,
          isEnabled: true,
          icon: 'clock-8',
          textColor: '#c7d2fe',
          backgroundColor: '#312e81',
          config: {
            topTimeFormat: TopMenuTimeFormat.HOURS_MINUTES_DAY_MONTH_YEAR,
          },
          isMegaMenu: false,
        },
        translations: [
          {
            locale: 'en',
            label: 'Local Time',
            description: 'Current Vietnam timezone',
          },
          {
            locale: 'vi',
            label: 'Giờ địa phương',
            description: 'Theo múi giờ Việt Nam',
          },
        ],
      },
      {
        menu: {
          menuGroup: 'top',
          type: MenuType.LINK,
          url: '/track-order',
          target: MenuTarget.SELF,
          position: 3,
          isEnabled: true,
          icon: 'package-search',
          textColor: '#0f172a',
          backgroundColor: '#facc15',
          config: {},
          isMegaMenu: false,
        },
        translations: [
          {
            locale: 'en',
            label: 'Track Order',
            description: 'Follow the status of your shipment',
          },
          {
            locale: 'vi',
            label: 'Theo dõi đơn hàng',
            description: 'Kiểm tra tình trạng giao hàng',
          },
        ],
      },
      {
        menu: {
          menuGroup: 'top',
          type: MenuType.CUSTOM_HTML,
          target: MenuTarget.SELF,
          position: 4,
          isEnabled: true,
          icon: 'badge-check',
          textColor: '#fefefe',
          backgroundColor: '#0ea5e9',
          config: {},
          isMegaMenu: false,
        },
        translations: [
          {
            locale: 'en',
            customHtml:
              '<strong>Free shipping</strong> on orders over <span class="font-semibold">$99</span>',
          },
          {
            locale: 'vi',
            customHtml:
              '<strong>Miễn phí giao hàng</strong> cho đơn từ <span class="font-semibold">2.000.000đ</span>',
          },
        ],
      },
    ];

    const subMenuDefaults: MenuSeedData[] = [
      {
        menu: {
          menuGroup: 'sub',
          type: MenuType.LINK,
          url: '/collections/featured',
          target: MenuTarget.SELF,
          position: 0,
          isEnabled: true,
          icon: 'sparkles',
          textColor: '#1d4ed8',
          config: {
            subMenuVariant: 'link',
            badge: {
              text: 'Hot',
              color: '#1d4ed8',
              backgroundColor: 'rgba(37, 99, 235, 0.15)',
            },
          },
          isMegaMenu: false,
        },
        translations: [
          {
            locale: 'en',
            label: 'Featured Picks',
            description: 'Curated items from our editors',
          },
          {
            locale: 'vi',
            label: 'Gợi ý nổi bật',
            description: 'Những sản phẩm được đề xuất',
          },
        ],
      },
      {
        menu: {
          menuGroup: 'sub',
          type: MenuType.LINK,
          url: '/flash-sale',
          target: MenuTarget.SELF,
          position: 1,
          isEnabled: true,
          icon: 'zap',
          textColor: '#ffffff',
          backgroundColor: '#dc2626',
          config: {
            subMenuVariant: 'button',
            buttonBorderRadius: '9999px',
            buttonAnimation: 'pulse',
          },
          isMegaMenu: false,
        },
        translations: [
          {
            locale: 'en',
            label: 'Flash Sale',
            description: 'Limited stock & time offers',
          },
          {
            locale: 'vi',
            label: 'Ưu đãi chớp nhoáng',
            description: 'Khuyến mãi giới hạn thời gian',
          },
        ],
      },
      {
        menu: {
          menuGroup: 'sub',
          type: MenuType.LINK,
          url: '/loyalty',
          target: MenuTarget.SELF,
          position: 2,
          isEnabled: true,
          icon: 'gift',
          textColor: '#7c3aed',
          config: {
            subMenuVariant: 'link',
            badge: {
              text: 'New',
              color: '#7c3aed',
              backgroundColor: 'rgba(124, 58, 237, 0.15)',
            },
          },
          isMegaMenu: false,
        },
        translations: [
          {
            locale: 'en',
            label: 'Rewards Club',
            description: 'Earn points for every order',
          },
          {
            locale: 'vi',
            label: 'Câu lạc bộ khách hàng',
            description: 'Tích điểm cho mỗi đơn hàng',
          },
        ],
      },
      {
        menu: {
          menuGroup: 'sub',
          type: MenuType.LINK,
          url: '/download-app',
          target: MenuTarget.SELF,
          position: 3,
          isEnabled: true,
          icon: 'smartphone',
          textColor: '#ffffff',
          backgroundColor: '#0f172a',
          config: {
            subMenuVariant: 'button',
            buttonBorderRadius: '12px',
            buttonAnimation: 'float',
          },
          isMegaMenu: false,
        },
        translations: [
          {
            locale: 'en',
            label: 'Get the App',
            description: 'Unlock exclusive in-app perks',
          },
          {
            locale: 'vi',
            label: 'Tải ứng dụng',
            description: 'Nhận ưu đãi chỉ có trên ứng dụng',
          },
        ],
      },
    ];

    const createMenuWithTranslations = async (
      menuData: MenuSeedData,
      parentId?: string,
    ): Promise<MenuEntity> => {
      const menu = menuRepository.create(
        parentId ? { ...menuData.menu, parentId } : menuData.menu,
      );
      const savedMenu = await menuRepository.save(menu);

      // Create translations
      for (const translationData of menuData.translations) {
        const translation = translationRepository.create({
          ...translationData,
          menuId: savedMenu.id,
        });
        await translationRepository.save(translation);
      }

      if (menuData.children) {
        for (const childMenu of menuData.children) {
          await createMenuWithTranslations(childMenu, savedMenu.id);
        }
      }

      return savedMenu;
    };

    const buildMenuLookupCriteria = (menuData: MenuSeedData): FindOptionsWhere<MenuEntity> => {
      const where: FindOptionsWhere<MenuEntity> = {
        menuGroup: menuData.menu.menuGroup as string,
      };

      if (menuData.menu.url) {
        where.url = menuData.menu.url;
      } else if (menuData.menu.referenceId) {
        where.referenceId = menuData.menu.referenceId;
      } else if (menuData.menu.type) {
        where.type = menuData.menu.type as MenuType;
        if (typeof menuData.menu.position === 'number') {
          where.position = menuData.menu.position;
        }
      }

      return where;
    };

    const existing = await menuRepository.count();
    if (existing === 0) {
      for (const menuData of baseMenus) {
        await createMenuWithTranslations(menuData);
      }
      console.log(`✅ Created ${baseMenus.length} base menu items`);
    } else {
      console.log('Menus already seeded, skipping base menu creation');
    }

    let createdActions = 0;
    for (const menuData of headerActionMenus) {
      const actionExists = await menuRepository.findOne({
        where: {
          menuGroup: menuData.menu.menuGroup,
          type: menuData.menu.type as MenuType,
        },
      });

      if (actionExists) {
        continue;
      }

      await createMenuWithTranslations(menuData);
      createdActions += 1;
    }

    if (createdActions > 0) {
      console.log(`✅ Created ${createdActions} header action menu items`);
    } else {
      console.log('✅ Header action menu items already exist, skipping');
    }

    let createdTopMenus = 0;
    for (const menuData of topMenuDefaults) {
      const where = buildMenuLookupCriteria(menuData);
      const existingTopMenu = await menuRepository.findOne({ where });
      if (existingTopMenu) {
        continue;
      }

      await createMenuWithTranslations(menuData);
      createdTopMenus += 1;
    }

    if (createdTopMenus > 0) {
      console.log(`✅ Created ${createdTopMenus} top menu items`);
    } else {
      console.log('✅ Top menu items already exist, skipping');
    }

    let createdSubMenus = 0;
    for (const menuData of subMenuDefaults) {
      const where = buildMenuLookupCriteria(menuData);
      const existingSubMenu = await menuRepository.findOne({ where });
      if (existingSubMenu) {
        continue;
      }

      await createMenuWithTranslations(menuData);
      createdSubMenus += 1;
    }

    if (createdSubMenus > 0) {
      console.log(`✅ Created ${createdSubMenus} default sub menu items`);
    } else {
      console.log('✅ Sub menu defaults already exist, skipping');
    }
  }
}
