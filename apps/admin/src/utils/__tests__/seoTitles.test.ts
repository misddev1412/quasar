import {
  getSeoConfigForPath,
  getMetaTitleForPath,
  getMetaDescriptionForPath,
  DEFAULT_PLATFORM_TITLE,
} from '../../config/seoTitles';

describe('SEO Titles Configuration', () => {
  describe('getSeoConfigForPath', () => {
    it('should return config for dashboard path', () => {
      const config = getSeoConfigForPath('/');
      expect(config).toBeTruthy();
      expect(config?.path).toBe('/');
      expect(config?.titles.en).toBe('Dashboard | {{platformTitle}}');
      expect(config?.titles.vi).toBe('Bảng Điều Khiển | {{platformTitle}}');
    });

    it('should return config for users management path', () => {
      const config = getSeoConfigForPath('/users');
      expect(config).toBeTruthy();
      expect(config?.path).toBe('/users');
      expect(config?.titles.en).toBe('Users Management | {{platformTitle}}');
      expect(config?.titles.vi).toBe('Quản Lý Người Dùng | {{platformTitle}}');
    });

    it('should return config for user dashboard path', () => {
      const config = getSeoConfigForPath('/users/dashboard');
      expect(config).toBeTruthy();
      expect(config?.path).toBe('/users/dashboard');
      expect(config?.titles.en).toBe('User Dashboard | {{platformTitle}}');
    });

    it('should handle parameterized routes', () => {
      const config = getSeoConfigForPath('/users/123');
      expect(config).toBeTruthy();
      expect(config?.path).toBe('/users/:id');
      expect(config?.titles.en).toBe('Edit User | {{platformTitle}}');
    });

    it('should return null for unknown paths', () => {
      const config = getSeoConfigForPath('/unknown/path');
      expect(config).toBeNull();
    });
  });

  describe('getMetaTitleForPath', () => {
    it('should return English title by default', () => {
      const title = getMetaTitleForPath('/products');
      expect(title).toBe(`Products Management | ${DEFAULT_PLATFORM_TITLE}`);
    });

    it('should return Vietnamese title when locale is vi', () => {
      const title = getMetaTitleForPath('/products', 'vi');
      expect(title).toBe(`Quản Lý Sản Phẩm | ${DEFAULT_PLATFORM_TITLE}`);
    });

    it('should return fallback title for unknown paths', () => {
      const title = getMetaTitleForPath('/unknown/path');
      expect(title).toBe(DEFAULT_PLATFORM_TITLE);
    });
  });

  describe('getMetaDescriptionForPath', () => {
    it('should return English description by default', () => {
      const description = getMetaDescriptionForPath('/orders');
      expect(description).toBe('Manage customer orders and fulfillment');
    });

    it('should return Vietnamese description when locale is vi', () => {
      const description = getMetaDescriptionForPath('/orders', 'vi');
      expect(description).toBe('Quản lý đơn hàng và thực hiện của khách hàng');
    });

    it('should return fallback description for unknown paths', () => {
      const description = getMetaDescriptionForPath('/unknown/path');
      expect(description).toBe('Admin dashboard for managing your application');
    });
  });
});
