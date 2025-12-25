import {
  getSeoConfigForPath,
  getMetaTitleForPath,
  getMetaDescriptionForPath,
  DEFAULT_PLATFORM_TITLE,
} from '../../config/seoTitles';

describe('Comprehensive SEO Titles Configuration', () => {

  // Dashboard and Authentication
  describe('Core Pages', () => {
    it('should handle dashboard page', () => {
      const config = getSeoConfigForPath('/');
      expect(config?.titles.en).toBe('Dashboard | {{platformTitle}}');
      expect(config?.titles.vi).toBe('Bảng Điều Khiển | {{platformTitle}}');
    });

    it('should handle authentication pages', () => {
      const loginConfig = getSeoConfigForPath('/auth/login');
      expect(loginConfig?.titles.en).toBe('Admin Login | {{platformTitle}}');
      expect(loginConfig?.titles.vi).toBe('Đăng Nhập Admin | {{platformTitle}}');

      const forgotConfig = getSeoConfigForPath('/auth/forgot-password');
      expect(forgotConfig?.titles.en).toBe('Forgot Password | {{platformTitle}}');
      expect(forgotConfig?.titles.vi).toBe('Quên Mật Khẩu | {{platformTitle}}');
    });
  });

  // User Management
  describe('User Management', () => {
    it('should handle user management pages', () => {
      const usersConfig = getSeoConfigForPath('/users');
      expect(usersConfig?.titles.en).toBe('Users Management | {{platformTitle}}');
      expect(usersConfig?.titles.vi).toBe('Quản Lý Người Dùng | {{platformTitle}}');

      const createUserConfig = getSeoConfigForPath('/users/create');
      expect(createUserConfig?.titles.en).toBe('Create New User | {{platformTitle}}');
      expect(createUserConfig?.titles.vi).toBe('Tạo Người Dùng Mới | {{platformTitle}}');

      const editUserConfig = getSeoConfigForPath('/users/123');
      expect(editUserConfig?.titles.en).toBe('Edit User | {{platformTitle}}');
      expect(editUserConfig?.titles.vi).toBe('Chỉnh Sửa Người Dùng | {{platformTitle}}');
    });

    it('should handle role management', () => {
      const rolesConfig = getSeoConfigForPath('/roles');
      expect(rolesConfig?.titles.en).toBe('Roles Management | {{platformTitle}}');
      expect(rolesConfig?.titles.vi).toBe('Quản Lý Vai Trò | {{platformTitle}}');

      const createRoleConfig = getSeoConfigForPath('/roles/create');
      expect(createRoleConfig?.titles.en).toBe('Create New Role | {{platformTitle}}');
      expect(createRoleConfig?.titles.vi).toBe('Tạo Vai Trò Mới | {{platformTitle}}');
    });

    it('should handle permission management', () => {
      const permissionsConfig = getSeoConfigForPath('/permissions');
      expect(permissionsConfig?.titles.en).toBe('Permissions Management | {{platformTitle}}');
      expect(permissionsConfig?.titles.vi).toBe('Quản Lý Quyền Hạn | {{platformTitle}}');
    });
  });

  // Product Management
  describe('Product Management', () => {
    it('should handle product pages', () => {
      const productsConfig = getSeoConfigForPath('/products');
      expect(productsConfig?.titles.en).toBe('Products Management | {{platformTitle}}');
      expect(productsConfig?.titles.vi).toBe('Quản Lý Sản Phẩm | {{platformTitle}}');

      const createProductConfig = getSeoConfigForPath('/products/create');
      expect(createProductConfig?.titles.en).toBe('Create New Product | {{platformTitle}}');
      expect(createProductConfig?.titles.vi).toBe('Tạo Sản Phẩm Mới | {{platformTitle}}');

      const editProductConfig = getSeoConfigForPath('/products/123/edit');
      expect(editProductConfig?.titles.en).toBe('Edit Product | {{platformTitle}}');
      expect(editProductConfig?.titles.vi).toBe('Chỉnh Sửa Sản Phẩm | {{platformTitle}}');
    });

    it('should handle product categories', () => {
      const categoriesConfig = getSeoConfigForPath('/products/categories');
      expect(categoriesConfig?.titles.en).toBe('Product Categories | {{platformTitle}}');
      expect(categoriesConfig?.titles.vi).toBe('Danh Mục Sản Phẩm | {{platformTitle}}');

      const createCategoryConfig = getSeoConfigForPath('/products/categories/create');
      expect(createCategoryConfig?.titles.en).toBe('Create Product Category | {{platformTitle}}');
      expect(createCategoryConfig?.titles.vi).toBe('Tạo Danh Mục Sản Phẩm | {{platformTitle}}');

      const editCategoryConfig = getSeoConfigForPath('/products/categories/123/edit');
      expect(editCategoryConfig?.titles.en).toBe('Edit Product Category | {{platformTitle}}');
      expect(editCategoryConfig?.titles.vi).toBe('Chỉnh Sửa Danh Mục Sản Phẩm | {{platformTitle}}');
    });

    it('should handle product attributes and brands', () => {
      const attributesConfig = getSeoConfigForPath('/products/attributes');
      expect(attributesConfig?.titles.en).toBe('Product Attributes | {{platformTitle}}');
      expect(attributesConfig?.titles.vi).toBe('Thuộc Tính Sản Phẩm | {{platformTitle}}');

      const brandsConfig = getSeoConfigForPath('/products/brands');
      expect(brandsConfig?.titles.en).toBe('Product Brands | {{platformTitle}}');
      expect(brandsConfig?.titles.vi).toBe('Thương Hiệu Sản Phẩm | {{platformTitle}}');

      const suppliersConfig = getSeoConfigForPath('/products/suppliers');
      expect(suppliersConfig?.titles.en).toBe('Product Suppliers | {{platformTitle}}');
      expect(suppliersConfig?.titles.vi).toBe('Nhà Cung Cấp Sản Phẩm | {{platformTitle}}');
    });
  });

  // Order Management
  describe('Order Management', () => {
    it('should handle order pages', () => {
      const ordersConfig = getSeoConfigForPath('/orders');
      expect(ordersConfig?.titles.en).toBe('Orders Management | {{platformTitle}}');
      expect(ordersConfig?.titles.vi).toBe('Quản Lý Đơn Hàng | {{platformTitle}}');

      const createOrderConfig = getSeoConfigForPath('/orders/new');
      expect(createOrderConfig?.titles.en).toBe('Create New Order | {{platformTitle}}');
      expect(createOrderConfig?.titles.vi).toBe('Tạo Đơn Hàng Mới | {{platformTitle}}');

      const orderDetailsConfig = getSeoConfigForPath('/orders/123');
      expect(orderDetailsConfig?.titles.en).toBe('Order Details | {{platformTitle}}');
      expect(orderDetailsConfig?.titles.vi).toBe('Chi Tiết Đơn Hàng | {{platformTitle}}');
    });

    it('should handle order fulfillments', () => {
      const fulfillmentsConfig = getSeoConfigForPath('/orders/fulfillments');
      expect(fulfillmentsConfig?.titles.en).toBe('Order Fulfillments | {{platformTitle}}');
      expect(fulfillmentsConfig?.titles.vi).toBe('Thực Hiện Đơn Hàng | {{platformTitle}}');

      const createFulfillmentConfig = getSeoConfigForPath('/orders/fulfillments/new');
      expect(createFulfillmentConfig?.titles.en).toBe('Create Order Fulfillment | {{platformTitle}}');
      expect(createFulfillmentConfig?.titles.vi).toBe('Tạo Thực Hiện Đơn Hàng | {{platformTitle}}');

      const fulfillmentDetailsConfig = getSeoConfigForPath('/orders/fulfillments/123');
      expect(fulfillmentDetailsConfig?.titles.en).toBe('Fulfillment Details | {{platformTitle}}');
      expect(fulfillmentDetailsConfig?.titles.vi).toBe('Chi Tiết Thực Hiện | {{platformTitle}}');
    });
  });

  // Customer Management
  describe('Customer Management', () => {
    it('should handle customer pages', () => {
      const customersConfig = getSeoConfigForPath('/customers');
      expect(customersConfig?.titles.en).toBe('Customers Management | {{platformTitle}}');
      expect(customersConfig?.titles.vi).toBe('Quản Lý Khách Hàng | {{platformTitle}}');

      const createCustomerConfig = getSeoConfigForPath('/customers/create');
      expect(createCustomerConfig?.titles.en).toBe('Create New Customer | {{platformTitle}}');
      expect(createCustomerConfig?.titles.vi).toBe('Tạo Khách Hàng Mới | {{platformTitle}}');

      const customerDetailsConfig = getSeoConfigForPath('/customers/123');
      expect(customerDetailsConfig?.titles.en).toBe('Customer Details | {{platformTitle}}');
      expect(customerDetailsConfig?.titles.vi).toBe('Chi Tiết Khách Hàng | {{platformTitle}}');
    });
  });

  // Content Management
  describe('Content Management', () => {
    it('should handle posts and content', () => {
      const postsConfig = getSeoConfigForPath('/posts');
      expect(postsConfig?.titles.en).toBe('Posts Management | {{platformTitle}}');
      expect(postsConfig?.titles.vi).toBe('Quản Lý Bài Viết | {{platformTitle}}');

      const createPostConfig = getSeoConfigForPath('/posts/create');
      expect(createPostConfig?.titles.en).toBe('Create New Post | {{platformTitle}}');
      expect(createPostConfig?.titles.vi).toBe('Tạo Bài Viết Mới | {{platformTitle}}');

      const editPostConfig = getSeoConfigForPath('/posts/123');
      expect(editPostConfig?.titles.en).toBe('Edit Post | {{platformTitle}}');
      expect(editPostConfig?.titles.vi).toBe('Chỉnh Sửa Bài Viết | {{platformTitle}}');
    });

    it('should handle mail templates', () => {
      const mailTemplatesConfig = getSeoConfigForPath('/mail-templates');
      expect(mailTemplatesConfig?.titles.en).toBe('Mail Templates | {{platformTitle}}');
      expect(mailTemplatesConfig?.titles.vi).toBe('Mẫu Thư | {{platformTitle}}');

      const createTemplateConfig = getSeoConfigForPath('/mail-templates/create');
      expect(createTemplateConfig?.titles.en).toBe('Create Mail Template | {{platformTitle}}');
      expect(createTemplateConfig?.titles.vi).toBe('Tạo Mẫu Thư | {{platformTitle}}');
    });
  });

  // System Settings
  describe('System Settings', () => {
    it('should handle settings pages', () => {
      const settingsConfig = getSeoConfigForPath('/settings');
      expect(settingsConfig?.titles.en).toBe('System Settings | {{platformTitle}}');
      expect(settingsConfig?.titles.vi).toBe('Cài Đặt Hệ Thống | {{platformTitle}}');

      const visibilityConfig = getSeoConfigForPath('/settings/visibility');
      expect(visibilityConfig?.titles.en).toBe('Visibility Settings | {{platformTitle}}');
      expect(visibilityConfig?.titles.vi).toBe('Cài Đặt Hiển Thị | {{platformTitle}}');

      const floatingIconsConfig = getSeoConfigForPath('/settings/floating-icons');
      expect(floatingIconsConfig?.titles.en).toBe('Floating Icons Settings | {{platformTitle}}');
      expect(floatingIconsConfig?.titles.vi).toBe('Cài Đặt Biểu Tượng Nổi | {{platformTitle}}');
    });

    it('should handle storage and analytics', () => {
      const storageConfig = getSeoConfigForPath('/storage');
      expect(storageConfig?.titles.en).toBe('Storage Configuration | {{platformTitle}}');
      expect(storageConfig?.titles.vi).toBe('Cấu Hình Lưu Trữ | {{platformTitle}}');

      const analyticsConfig = getSeoConfigForPath('/analytics');
      expect(analyticsConfig?.titles.en).toBe('Analytics Configuration | {{platformTitle}}');
      expect(analyticsConfig?.titles.vi).toBe('Cấu Hình Analytics | {{platformTitle}}');
    });
  });

  // Warehouse Management
  describe('Warehouse Management', () => {
    it('should handle warehouse pages', () => {
      const warehousesConfig = getSeoConfigForPath('/warehouses');
      expect(warehousesConfig?.titles.en).toBe('Warehouses Management | {{platformTitle}}');
      expect(warehousesConfig?.titles.vi).toBe('Quản Lý Kho Hàng | {{platformTitle}}');

      const createWarehouseConfig = getSeoConfigForPath('/warehouses/create');
      expect(createWarehouseConfig?.titles.en).toBe('Create Warehouse | {{platformTitle}}');
      expect(createWarehouseConfig?.titles.vi).toBe('Tạo Kho Hàng | {{platformTitle}}');

      const editWarehouseConfig = getSeoConfigForPath('/warehouses/123/edit');
      expect(editWarehouseConfig?.titles.en).toBe('Edit Warehouse | {{platformTitle}}');
      expect(editWarehouseConfig?.titles.vi).toBe('Chỉnh Sửa Kho Hàng | {{platformTitle}}');
    });

    it('should handle warehouse locations', () => {
      const locationsConfig = getSeoConfigForPath('/warehouses/locations');
      expect(locationsConfig?.titles.en).toBe('Warehouse Locations | {{platformTitle}}');
      expect(locationsConfig?.titles.vi).toBe('Địa Điểm Kho Hàng | {{platformTitle}}');

      const createLocationConfig = getSeoConfigForPath('/warehouses/locations/create');
      expect(createLocationConfig?.titles.en).toBe('Create Warehouse Location | {{platformTitle}}');
      expect(createLocationConfig?.titles.vi).toBe('Tạo Địa Điểm Kho Hàng | {{platformTitle}}');
    });
  });

  // Testing Pages
  describe('Testing and Development', () => {
    it('should handle test pages', () => {
      const dateInputTestConfig = getSeoConfigForPath('/test/date-input');
      expect(dateInputTestConfig?.titles.en).toBe('Date Input Test | {{platformTitle}}');
      expect(dateInputTestConfig?.titles.vi).toBe('Kiểm Tra Input Ngày | {{platformTitle}}');

      const phoneInputTestConfig = getSeoConfigForPath('/test/phone-input');
      expect(phoneInputTestConfig?.titles.en).toBe('Phone Input Test | {{platformTitle}}');
      expect(phoneInputTestConfig?.titles.vi).toBe('Kiểm Tra Input SĐT | {{platformTitle}}');
    });
  });

  // Utility Functions
  describe('Utility Functions', () => {
    it('should return appropriate titles for different locales', () => {
      expect(getMetaTitleForPath('/users', 'en')).toBe(`Users Management | ${DEFAULT_PLATFORM_TITLE}`);
      expect(getMetaTitleForPath('/users', 'vi')).toBe(`Quản Lý Người Dùng | ${DEFAULT_PLATFORM_TITLE}`);
      expect(getMetaTitleForPath('/users')).toBe(`Users Management | ${DEFAULT_PLATFORM_TITLE}`); // default to English
    });

    it('should return appropriate descriptions for different locales', () => {
      expect(getMetaDescriptionForPath('/products', 'en')).toBe('Manage products, inventory, and pricing');
      expect(getMetaDescriptionForPath('/products', 'vi')).toBe('Quản lý sản phẩm, tồn kho và giá cả');
      expect(getMetaDescriptionForPath('/products')).toBe('Manage products, inventory, and pricing'); // default to English
    });

    it('should return fallback values for unknown paths', () => {
      expect(getMetaTitleForPath('/unknown/path')).toBe(DEFAULT_PLATFORM_TITLE);
      expect(getMetaDescriptionForPath('/unknown/path')).toBe('Admin dashboard for managing your application');
    });

    it('should handle null return for unknown configs', () => {
      expect(getSeoConfigForPath('/completely/unknown/path')).toBeNull();
    });
  });

  // Dynamic Routes
  describe('Dynamic Routes', () => {
    it('should handle parameterized routes correctly', () => {
      const userEditConfig = getSeoConfigForPath('/users/123');
      expect(userEditConfig?.path).toBe('/users/:id');
      expect(userEditConfig?.titles.en).toBe('Edit User | {{platformTitle}}');

      const productEditConfig = getSeoConfigForPath('/products/456/edit');
      expect(productEditConfig?.path).toBe('/products/:id/edit');
      expect(productEditConfig?.titles.en).toBe('Edit Product | {{platformTitle}}');

      const orderDetailsConfig = getSeoConfigForPath('/orders/789');
      expect(orderDetailsConfig?.path).toBe('/orders/:id');
      expect(orderDetailsConfig?.titles.en).toBe('Order Details | {{platformTitle}}');
    });
  });

  // Special Pages
  describe('Special Pages', () => {
    it('should handle help and support pages', () => {
      const helpConfig = getSeoConfigForPath('/help');
      expect(helpConfig?.titles.en).toBe('Help Center | {{platformTitle}}');
      expect(helpConfig?.titles.vi).toBe('Trung Tâm Trợ Giúp | {{platformTitle}}');
    });

    it('should handle 404 page', () => {
      const notFoundConfig = getSeoConfigForPath('/404');
      expect(notFoundConfig?.titles.en).toBe('Page Not Found | {{platformTitle}}');
      expect(notFoundConfig?.titles.vi).toBe('Không Tìm Thấy Trang | {{platformTitle}}');
    });

    it('should handle loyalty management', () => {
      const loyaltyConfig = getSeoConfigForPath('/loyalty');
      expect(loyaltyConfig?.titles.en).toBe('Loyalty Management | {{platformTitle}}');
      expect(loyaltyConfig?.titles.vi).toBe('Quản Lý Khách Hàng Thân Thiết | {{platformTitle}}');

      const loyaltyRewardConfig = getSeoConfigForPath('/loyalty/rewards/create');
      expect(loyaltyRewardConfig?.titles.en).toBe('Create Loyalty Reward | {{platformTitle}}');
      expect(loyaltyRewardConfig?.titles.vi).toBe('Tạo Phần Thưởng Khách Hàng Thân Thiết | {{platformTitle}}');
    });
  });
});
