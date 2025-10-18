import { Injectable } from '@nestjs/common';
import { DataSource } from 'typeorm';
import { SeederModule } from './seeder.module';
import { MenuEntity } from '../../modules/menus/entities/menu.entity';
import { MenuTranslationEntity } from '../../modules/menus/entities/menu-translation.entity';
import { MenuType, MenuTarget } from '@shared/enums/menu.enums';

@Injectable()
export class MenusSeeder implements SeederModule {
  constructor(private readonly dataSource: DataSource) {}

  async seed(): Promise<void> {
    const menuRepository = this.dataSource.getRepository(MenuEntity);
    const translationRepository = this.dataSource.getRepository(MenuTranslationEntity);

    const existing = await menuRepository.count();
    if (existing > 0) {
      console.log('Menus already seeded, skipping');
      return;
    }

    const menus: Array<{
      menu: Partial<MenuEntity>;
      translations: Array<Partial<MenuTranslationEntity>>
    }> = [
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

    // Create menus
    for (const menuData of menus) {
      const menu = menuRepository.create(menuData.menu);
      const savedMenu = await menuRepository.save(menu);

      // Create translations
      for (const translationData of menuData.translations) {
        const translation = translationRepository.create({
          ...translationData,
          menuId: savedMenu.id,
        });
        await translationRepository.save(translation);
      }
    }

    console.log(`✅ Created ${menus.length} menu items`);
  }
}