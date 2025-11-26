import { Injectable } from '@nestjs/common';
import { DataSource } from 'typeorm';
import { SeederModule } from './seeder.module';
import { MenuEntity } from '../../modules/menus/entities/menu.entity';
import { MenuTranslationEntity } from '../../modules/menus/entities/menu-translation.entity';
import { MenuType, MenuTarget } from '@shared/enums/menu.enums';

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
  }
}
