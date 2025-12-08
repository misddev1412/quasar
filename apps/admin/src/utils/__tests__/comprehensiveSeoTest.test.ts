import { getSeoConfigForPath, getMetaTitleForPath, getMetaDescriptionForPath } from '../../config/seoTitles';

describe('Comprehensive SEO Titles Configuration', () => {

  // Dashboard and Authentication
  describe('Core Pages', () => {
    it('should handle dashboard page', () => {
      const config = getSeoConfigForPath('/');
      expect(config?.titles.en).toBe('Dashboard | Quasar Admin');
      expect(config?.titles.vi).toBe('Bảng Điều Khiển | Quasar Admin');
    });

    it('should handle authentication pages', () => {
      const loginConfig = getSeoConfigForPath('/auth/login');
      expect(loginConfig?.titles.en).toBe('Admin Login | Quasar');
      expect(loginConfig?.titles.vi).toBe('Đăng Nhập Admin | Quasar');

      const forgotConfig = getSeoConfigForPath('/auth/forgot-password');
      expect(forgotConfig?.titles.en).toBe('Forgot Password | Quasar Admin');
      expect(forgotConfig?.titles.vi).toBe('Quên Mật Khẩu | Quasar Admin');
    });
  });

  // User Management
  describe('User Management', () => {
    it('should handle user management pages', () => {
      const usersConfig = getSeoConfigForPath('/users');
      expect(usersConfig?.titles.en).toBe('Users Management | Quasar Admin');
      expect(usersConfig?.titles.vi).toBe('Quản Lý Người Dùng | Quasar Admin');

      const createUserConfig = getSeoConfigForPath('/users/create');
      expect(createUserConfig?.titles.en).toBe('Create New User | Quasar Admin');
      expect(createUserConfig?.titles.vi).toBe('Tạo Người Dùng Mới | Quasar Admin');

      const editUserConfig = getSeoConfigForPath('/users/123');
      expect(editUserConfig?.titles.en).toBe('Edit User | Quasar Admin');
      expect(editUserConfig?.titles.vi).toBe('Chỉnh Sửa Người Dùng | Quasar Admin');
    });

    it('should handle role management', () => {
      const rolesConfig = getSeoConfigForPath('/roles');
      expect(rolesConfig?.titles.en).toBe('Roles Management | Quasar Admin');
      expect(rolesConfig?.titles.vi).toBe('Quản Lý Vai Trò | Quasar Admin');

      const createRoleConfig = getSeoConfigForPath('/roles/create');
      expect(createRoleConfig?.titles.en).toBe('Create New Role | Quasar Admin');
      expect(createRoleConfig?.titles.vi).toBe('Tạo Vai Trò Mới | Quasar Admin');
    });

    it('should handle permission management', () => {
      const permissionsConfig = getSeoConfigForPath('/permissions');
      expect(permissionsConfig?.titles.en).toBe('Permissions Management | Quasar Admin');
      expect(permissionsConfig?.titles.vi).toBe('Quản Lý Quyền Hạn | Quasar Admin');
    });
  });

  // Product Management
  describe('Product Management', () => {
    it('should handle product pages', () => {
      const productsConfig = getSeoConfigForPath('/products');
      expect(productsConfig?.titles.en).toBe('Products Management | Quasar Admin');
      expect(productsConfig?.titles.vi).toBe('Quản Lý Sản Phẩm | Quasar Admin');

      const createProductConfig = getSeoConfigForPath('/products/create');
      expect(createProductConfig?.titles.en).toBe('Create New Product | Quasar Admin');
      expect(createProductConfig?.titles.vi).toBe('Tạo Sản Phẩm Mới | Quasar Admin');

      const editProductConfig = getSeoConfigForPath('/products/123/edit');
      expect(editProductConfig?.titles.en).toBe('Edit Product | Quasar Admin');
      expect(editProductConfig?.titles.vi).toBe('Chỉnh Sửa Sản Phẩm | Quasar Admin');
    });

    it('should handle product categories', () => {
      const categoriesConfig = getSeoConfigForPath('/products/categories');
      expect(categoriesConfig?.titles.en).toBe('Product Categories | Quasar Admin');
      expect(categoriesConfig?.titles.vi).toBe('Danh Mục Sản Phẩm | Quasar Admin');

      const createCategoryConfig = getSeoConfigForPath('/products/categories/create');
      expect(createCategoryConfig?.titles.en).toBe('Create Product Category | Quasar Admin');
      expect(createCategoryConfig?.titles.vi).toBe('Tạo Danh Mục Sản Phẩm | Quasar Admin');

      const editCategoryConfig = getSeoConfigForPath('/products/categories/123/edit');
      expect(editCategoryConfig?.titles.en).toBe('Edit Product Category | Quasar Admin');
      expect(editCategoryConfig?.titles.vi).toBe('Chỉnh Sửa Danh Mục Sản Phẩm | Quasar Admin');
    });

    it('should handle product attributes and brands', () => {
      const attributesConfig = getSeoConfigForPath('/products/attributes');
      expect(attributesConfig?.titles.en).toBe('Product Attributes | Quasar Admin');
      expect(attributesConfig?.titles.vi).toBe('Thuộc Tính Sản Phẩm | Quasar Admin');

      const brandsConfig = getSeoConfigForPath('/products/brands');
      expect(brandsConfig?.titles.en).toBe('Product Brands | Quasar Admin');
      expect(brandsConfig?.titles.vi).toBe('Thương Hiệu Sản Phẩm | Quasar Admin');

      const suppliersConfig = getSeoConfigForPath('/products/suppliers');
      expect(suppliersConfig?.titles.en).toBe('Product Suppliers | Quasar Admin');
      expect(suppliersConfig?.titles.vi).toBe('Nhà Cung Cấp Sản Phẩm | Quasar Admin');
    });
  });

  // Order Management
  describe('Order Management', () => {
    it('should handle order pages', () => {
      const ordersConfig = getSeoConfigForPath('/orders');
      expect(ordersConfig?.titles.en).toBe('Orders Management | Quasar Admin');
      expect(ordersConfig?.titles.vi).toBe('Quản Lý Đơn Hàng | Quasar Admin');

      const createOrderConfig = getSeoConfigForPath('/orders/new');
      expect(createOrderConfig?.titles.en).toBe('Create New Order | Quasar Admin');
      expect(createOrderConfig?.titles.vi).toBe('Tạo Đơn Hàng Mới | Quasar Admin');

      const orderDetailsConfig = getSeoConfigForPath('/orders/123');
      expect(orderDetailsConfig?.titles.en).toBe('Order Details | Quasar Admin');
      expect(orderDetailsConfig?.titles.vi).toBe('Chi Tiết Đơn Hàng | Quasar Admin');
    });

    it('should handle order fulfillments', () => {
      const fulfillmentsConfig = getSeoConfigForPath('/orders/fulfillments');
      expect(fulfillmentsConfig?.titles.en).toBe('Order Fulfillments | Quasar Admin');
      expect(fulfillmentsConfig?.titles.vi).toBe('Thực Hiện Đơn Hàng | Quasar Admin');

      const createFulfillmentConfig = getSeoConfigForPath('/orders/fulfillments/new');
      expect(createFulfillmentConfig?.titles.en).toBe('Create Order Fulfillment | Quasar Admin');
      expect(createFulfillmentConfig?.titles.vi).toBe('Tạo Thực Hiện Đơn Hàng | Quasar Admin');

      const fulfillmentDetailsConfig = getSeoConfigForPath('/orders/fulfillments/123');
      expect(fulfillmentDetailsConfig?.titles.en).toBe('Fulfillment Details | Quasar Admin');
      expect(fulfillmentDetailsConfig?.titles.vi).toBe('Chi Tiết Thực Hiện | Quasar Admin');
    });
  });

  // Customer Management
  describe('Customer Management', () => {
    it('should handle customer pages', () => {
      const customersConfig = getSeoConfigForPath('/customers');
      expect(customersConfig?.titles.en).toBe('Customers Management | Quasar Admin');
      expect(customersConfig?.titles.vi).toBe('Quản Lý Khách Hàng | Quasar Admin');

      const createCustomerConfig = getSeoConfigForPath('/customers/create');
      expect(createCustomerConfig?.titles.en).toBe('Create New Customer | Quasar Admin');
      expect(createCustomerConfig?.titles.vi).toBe('Tạo Khách Hàng Mới | Quasar Admin');

      const customerDetailsConfig = getSeoConfigForPath('/customers/123');
      expect(customerDetailsConfig?.titles.en).toBe('Customer Details | Quasar Admin');
      expect(customerDetailsConfig?.titles.vi).toBe('Chi Tiết Khách Hàng | Quasar Admin');
    });
  });

  // Content Management
  describe('Content Management', () => {
    it('should handle posts and content', () => {
      const postsConfig = getSeoConfigForPath('/posts');
      expect(postsConfig?.titles.en).toBe('Posts Management | Quasar Admin');
      expect(postsConfig?.titles.vi).toBe('Quản Lý Bài Viết | Quasar Admin');

      const createPostConfig = getSeoConfigForPath('/posts/create');
      expect(createPostConfig?.titles.en).toBe('Create New Post | Quasar Admin');
      expect(createPostConfig?.titles.vi).toBe('Tạo Bài Viết Mới | Quasar Admin');

      const editPostConfig = getSeoConfigForPath('/posts/123');
      expect(editPostConfig?.titles.en).toBe('Edit Post | Quasar Admin');
      expect(editPostConfig?.titles.vi).toBe('Chỉnh Sửa Bài Viết | Quasar Admin');
    });

    it('should handle mail templates', () => {
      const mailTemplatesConfig = getSeoConfigForPath('/mail-templates');
      expect(mailTemplatesConfig?.titles.en).toBe('Mail Templates | Quasar Admin');
      expect(mailTemplatesConfig?.titles.vi).toBe('Mẫu Thư | Quasar Admin');

      const createTemplateConfig = getSeoConfigForPath('/mail-templates/create');
      expect(createTemplateConfig?.titles.en).toBe('Create Mail Template | Quasar Admin');
      expect(createTemplateConfig?.titles.vi).toBe('Tạo Mẫu Thư | Quasar Admin');
    });
  });

  // System Settings
  describe('System Settings', () => {
    it('should handle settings pages', () => {
      const settingsConfig = getSeoConfigForPath('/settings');
      expect(settingsConfig?.titles.en).toBe('System Settings | Quasar Admin');
      expect(settingsConfig?.titles.vi).toBe('Cài Đặt Hệ Thống | Quasar Admin');

      const visibilityConfig = getSeoConfigForPath('/settings/visibility');
      expect(visibilityConfig?.titles.en).toBe('Visibility Settings | Quasar Admin');
      expect(visibilityConfig?.titles.vi).toBe('Cài Đặt Hiển Thị | Quasar Admin');

      const floatingIconsConfig = getSeoConfigForPath('/settings/floating-icons');
      expect(floatingIconsConfig?.titles.en).toBe('Floating Icons Settings | Quasar Admin');
      expect(floatingIconsConfig?.titles.vi).toBe('Cài Đặt Biểu Tượng Nổi | Quasar Admin');
    });

    it('should handle storage and analytics', () => {
      const storageConfig = getSeoConfigForPath('/storage');
      expect(storageConfig?.titles.en).toBe('Storage Configuration | Quasar Admin');
      expect(storageConfig?.titles.vi).toBe('Cấu Hình Lưu Trữ | Quasar Admin');

      const analyticsConfig = getSeoConfigForPath('/analytics');
      expect(analyticsConfig?.titles.en).toBe('Analytics Configuration | Quasar Admin');
      expect(analyticsConfig?.titles.vi).toBe('Cấu Hình Analytics | Quasar Admin');
    });
  });

  // Warehouse Management
  describe('Warehouse Management', () => {
    it('should handle warehouse pages', () => {
      const warehousesConfig = getSeoConfigForPath('/warehouses');
      expect(warehousesConfig?.titles.en).toBe('Warehouses Management | Quasar Admin');
      expect(warehousesConfig?.titles.vi).toBe('Quản Lý Kho Hàng | Quasar Admin');

      const createWarehouseConfig = getSeoConfigForPath('/warehouses/create');
      expect(createWarehouseConfig?.titles.en).toBe('Create Warehouse | Quasar Admin');
      expect(createWarehouseConfig?.titles.vi).toBe('Tạo Kho Hàng | Quasar Admin');

      const editWarehouseConfig = getSeoConfigForPath('/warehouses/123/edit');
      expect(editWarehouseConfig?.titles.en).toBe('Edit Warehouse | Quasar Admin');
      expect(editWarehouseConfig?.titles.vi).toBe('Chỉnh Sửa Kho Hàng | Quasar Admin');
    });

    it('should handle warehouse locations', () => {
      const locationsConfig = getSeoConfigForPath('/warehouses/locations');
      expect(locationsConfig?.titles.en).toBe('Warehouse Locations | Quasar Admin');
      expect(locationsConfig?.titles.vi).toBe('Địa Điểm Kho Hàng | Quasar Admin');

      const createLocationConfig = getSeoConfigForPath('/warehouses/locations/create');
      expect(createLocationConfig?.titles.en).toBe('Create Warehouse Location | Quasar Admin');
      expect(createLocationConfig?.titles.vi).toBe('Tạo Địa Điểm Kho Hàng | Quasar Admin');
    });
  });

  // Testing Pages
  describe('Testing and Development', () => {
    it('should handle test pages', () => {
      const dateInputTestConfig = getSeoConfigForPath('/test/date-input');
      expect(dateInputTestConfig?.titles.en).toBe('Date Input Test | Quasar Admin');
      expect(dateInputTestConfig?.titles.vi).toBe('Kiểm Tra Input Ngày | Quasar Admin');

      const phoneInputTestConfig = getSeoConfigForPath('/test/phone-input');
      expect(phoneInputTestConfig?.titles.en).toBe('Phone Input Test | Quasar Admin');
      expect(phoneInputTestConfig?.titles.vi).toBe('Kiểm Tra Input SĐT | Quasar Admin');
    });
  });

  // Utility Functions
  describe('Utility Functions', () => {
    it('should return appropriate titles for different locales', () => {
      expect(getMetaTitleForPath('/users', 'en')).toBe('Users Management | Quasar Admin');
      expect(getMetaTitleForPath('/users', 'vi')).toBe('Quản Lý Người Dùng | Quasar Admin');
      expect(getMetaTitleForPath('/users')).toBe('Users Management | Quasar Admin'); // default to English
    });

    it('should return appropriate descriptions for different locales', () => {
      expect(getMetaDescriptionForPath('/products', 'en')).toBe('Manage products, inventory, and pricing');
      expect(getMetaDescriptionForPath('/products', 'vi')).toBe('Quản lý sản phẩm, tồn kho và giá cả');
      expect(getMetaDescriptionForPath('/products')).toBe('Manage products, inventory, and pricing'); // default to English
    });

    it('should return fallback values for unknown paths', () => {
      expect(getMetaTitleForPath('/unknown/path')).toBe('Quasar Admin');
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
      expect(userEditConfig?.titles.en).toBe('Edit User | Quasar Admin');

      const productEditConfig = getSeoConfigForPath('/products/456/edit');
      expect(productEditConfig?.path).toBe('/products/:id/edit');
      expect(productEditConfig?.titles.en).toBe('Edit Product | Quasar Admin');

      const orderDetailsConfig = getSeoConfigForPath('/orders/789');
      expect(orderDetailsConfig?.path).toBe('/orders/:id');
      expect(orderDetailsConfig?.titles.en).toBe('Order Details | Quasar Admin');
    });
  });

  // Special Pages
  describe('Special Pages', () => {
    it('should handle help and support pages', () => {
      const helpConfig = getSeoConfigForPath('/help');
      expect(helpConfig?.titles.en).toBe('Help Center | Quasar Admin');
      expect(helpConfig?.titles.vi).toBe('Trung Tâm Trợ Giúp | Quasar Admin');
    });

    it('should handle 404 page', () => {
      const notFoundConfig = getSeoConfigForPath('/404');
      expect(notFoundConfig?.titles.en).toBe('Page Not Found | Quasar Admin');
      expect(notFoundConfig?.titles.vi).toBe('Không Tìm Thấy Trang | Quasar Admin');
    });

    it('should handle loyalty management', () => {
      const loyaltyConfig = getSeoConfigForPath('/loyalty');
      expect(loyaltyConfig?.titles.en).toBe('Loyalty Management | Quasar Admin');
      expect(loyaltyConfig?.titles.vi).toBe('Quản Lý Khách Hàng Thân Thiết | Quasar Admin');

      const loyaltyRewardConfig = getSeoConfigForPath('/loyalty/rewards/create');
      expect(loyaltyRewardConfig?.titles.en).toBe('Create Loyalty Reward | Quasar Admin');
      expect(loyaltyRewardConfig?.titles.vi).toBe('Tạo Phần Thưởng Khách Hàng Thân Thiết | Quasar Admin');
    });
  });
});