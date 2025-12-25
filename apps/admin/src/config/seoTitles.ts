/**
 * SEO Meta Titles Configuration for Admin Pages
 * This file contains meta titles for all admin pages in both English and Vietnamese
 */

export interface AdminPageSeoConfig {
  path: string;
  titles: {
    en: string;
    vi: string;
  };
  description?: {
    en: string;
    vi: string;
  };
}

const PLATFORM_TITLE_PLACEHOLDER = '{{platformTitle}}';
const PLATFORM_TITLE_PATTERN = /{{\s*platformTitle\s*}}/i;
export const DEFAULT_PLATFORM_TITLE = 'Quasar Admin';

const replacePlatformPlaceholder = (value: string, platformTitle?: string) => {
  const brand = platformTitle?.trim() || DEFAULT_PLATFORM_TITLE;
  if (!value) {
    return brand;
  }
  if (PLATFORM_TITLE_PATTERN.test(value)) {
    return value.replace(/{{\s*platformTitle\s*}}/gi, brand);
  }
  if (value.toLowerCase().includes(brand.toLowerCase())) {
    return value;
  }
  return `${value} | ${brand}`;
};

export const adminPageSeoTitles: AdminPageSeoConfig[] = [
  // Main Dashboard
  {
    path: '/',
    titles: {
      en: 'Dashboard | {{platformTitle}}',
      vi: 'Bảng Điều Khiển | {{platformTitle}}'
    },
    description: {
      en: 'Admin dashboard overview - Manage your application with ease',
      vi: 'Tổng quan bảng điều khiển quản trị - Quản lý ứng dụng của bạn một cách dễ dàng'
    }
  },

  // Authentication Pages
  {
    path: '/auth/login',
    titles: {
      en: 'Admin Login | {{platformTitle}}',
      vi: 'Đăng Nhập Admin | {{platformTitle}}'
    },
    description: {
      en: 'Sign in to admin dashboard',
      vi: 'Đăng nhập vào bảng điều khiển quản trị'
    }
  },
  {
    path: '/auth/forgot-password',
    titles: {
      en: 'Forgot Password | {{platformTitle}}',
      vi: 'Quên Mật Khẩu | {{platformTitle}}'
    },
    description: {
      en: 'Reset your admin password',
      vi: 'Đặt lại mật khẩu quản trị của bạn'
    }
  },

  // User Management
  {
    path: '/users',
    titles: {
      en: 'Users Management | {{platformTitle}}',
      vi: 'Quản Lý Người Dùng | {{platformTitle}}'
    },
    description: {
      en: 'Manage system users and accounts',
      vi: 'Quản lý người dùng và tài khoản hệ thống'
    }
  },
  {
    path: '/users/dashboard',
    titles: {
      en: 'User Dashboard | {{platformTitle}}',
      vi: 'Bảng Điều Khiển Người Dùng | {{platformTitle}}'
    },
    description: {
      en: 'Monitor user growth, activity, and segmentation insights',
      vi: 'Theo dõi tăng trưởng, hoạt động và phân khúc người dùng'
    }
  },
  {
    path: '/users/create',
    titles: {
      en: 'Create New User | {{platformTitle}}',
      vi: 'Tạo Người Dùng Mới | {{platformTitle}}'
    },
    description: {
      en: 'Add a new user to the system',
      vi: 'Thêm người dùng mới vào hệ thống'
    }
  },
  {
    path: '/users/:id',
    titles: {
      en: 'Edit User | {{platformTitle}}',
      vi: 'Chỉnh Sửa Người Dùng | {{platformTitle}}'
    },
    description: {
      en: 'Update user information and settings',
      vi: 'Cập nhật thông tin và cài đặt người dùng'
    }
  },

  // Role Management
  {
    path: '/roles',
    titles: {
      en: 'Roles Management | {{platformTitle}}',
      vi: 'Quản Lý Vai Trò | {{platformTitle}}'
    },
    description: {
      en: 'Manage user roles and permissions',
      vi: 'Quản lý vai trò và quyền hạn người dùng'
    }
  },
  {
    path: '/roles/create',
    titles: {
      en: 'Create New Role | {{platformTitle}}',
      vi: 'Tạo Vai Trò Mới | {{platformTitle}}'
    },
    description: {
      en: 'Define a new role with permissions',
      vi: 'Định nghĩa vai trò mới với quyền hạn'
    }
  },
  {
    path: '/roles/:id',
    titles: {
      en: 'Edit Role | {{platformTitle}}',
      vi: 'Chỉnh Sửa Vai Trò | {{platformTitle}}'
    },
    description: {
      en: 'Update role permissions and settings',
      vi: 'Cập nhật quyền hạn và cài đặt vai trò'
    }
  },

  // Permission Management
  {
    path: '/permissions',
    titles: {
      en: 'Permissions Management | {{platformTitle}}',
      vi: 'Quản Lý Quyền Hạn | {{platformTitle}}'
    },
    description: {
      en: 'Manage system permissions and access control',
      vi: 'Quản lý quyền hạn hệ thống và kiểm soát truy cập'
    }
  },
  {
    path: '/permissions/create',
    titles: {
      en: 'Create New Permission | {{platformTitle}}',
      vi: 'Tạo Quyền Hạn Mới | {{platformTitle}}'
    },
    description: {
      en: 'Define a new system permission',
      vi: 'Định nghĩa quyền hạn hệ thống mới'
    }
  },
  {
    path: '/permissions/:id',
    titles: {
      en: 'Edit Permission | {{platformTitle}}',
      vi: 'Chỉnh Sửa Quyền Hạn | {{platformTitle}}'
    },
    description: {
      en: 'Update permission settings',
      vi: 'Cập nhật cài đặt quyền hạn'
    }
  },

  // Profile Management
  {
    path: '/profile',
    titles: {
      en: 'My Profile | {{platformTitle}}',
      vi: 'Hồ Sơ Của Tôi | {{platformTitle}}'
    },
    description: {
      en: 'Manage your admin profile and preferences',
      vi: 'Quản lý hồ sơ và sở thích quản trị của bạn'
    }
  },

  // SEO Management
  {
    path: '/seo',
    titles: {
      en: 'SEO Management | {{platformTitle}}',
      vi: 'Quản Lý SEO | {{platformTitle}}'
    },
    description: {
      en: 'Manage SEO settings and meta tags',
      vi: 'Quản lý cài đặt SEO và thẻ meta'
    }
  },

  // Settings
  {
    path: '/settings',
    titles: {
      en: 'System Settings | {{platformTitle}}',
      vi: 'Cài Đặt Hệ Thống | {{platformTitle}}'
    },
    description: {
      en: 'Configure system settings and preferences',
      vi: 'Cấu hình cài đặt hệ thống và sở thích'
    }
  },
  {
    path: '/settings/visibility',
    titles: {
      en: 'Visibility Settings | {{platformTitle}}',
      vi: 'Cài Đặt Hiển Thị | {{platformTitle}}'
    },
    description: {
      en: 'Manage content visibility settings',
      vi: 'Quản lý cài đặt hiển thị nội dung'
    }
  },
  {
    path: '/settings/floating-icons',
    titles: {
      en: 'Floating Icons Settings | {{platformTitle}}',
      vi: 'Cài Đặt Biểu Tượng Nổi | {{platformTitle}}'
    },
    description: {
      en: 'Configure floating interface elements',
      vi: 'Cấu hình các yếu tố giao diện nổi'
    }
  },

  // Storage Configuration
  {
    path: '/storage',
    titles: {
      en: 'Storage Configuration | {{platformTitle}}',
      vi: 'Cấu Hình Lưu Trữ | {{platformTitle}}'
    },
    description: {
      en: 'Configure file storage and media settings',
      vi: 'Cấu hình lưu trữ tệp và cài đặt phương tiện'
    }
  },

  // Brand Assets
  {
    path: '/brand-assets',
    titles: {
      en: 'Brand Assets | {{platformTitle}}',
      vi: 'Tài Sản Thương Hiệu | {{platformTitle}}'
    },
    description: {
      en: 'Manage logos, favicons, and brand assets',
      vi: 'Quản lý logo, favicon và tài sản thương hiệu'
    }
  },

  // Analytics Configuration
  {
    path: '/analytics',
    titles: {
      en: 'Analytics Configuration | {{platformTitle}}',
      vi: 'Cấu Hình Analytics | {{platformTitle}}'
    },
    description: {
      en: 'Configure Google Analytics and tracking',
      vi: 'Cấu hình Google Analytics và theo dõi'
    }
  },

  // Mail Templates
  {
    path: '/mail-templates',
    titles: {
      en: 'Mail Templates | {{platformTitle}}',
      vi: 'Mẫu Thư | {{platformTitle}}'
    },
    description: {
      en: 'Manage email templates and notifications',
      vi: 'Quản lý mẫu email và thông báo'
    }
  },
  {
    path: '/mail-templates/create',
    titles: {
      en: 'Create Mail Template | {{platformTitle}}',
      vi: 'Tạo Mẫu Thư | {{platformTitle}}'
    },
    description: {
      en: 'Create a new email template',
      vi: 'Tạo mẫu email mới'
    }
  },
  {
    path: '/mail-templates/:id',
    titles: {
      en: 'Edit Mail Template | {{platformTitle}}',
      vi: 'Chỉnh Sửa Mẫu Thư | {{platformTitle}}'
    },
    description: {
      en: 'Update email template content',
      vi: 'Cập nhật nội dung mẫu email'
    }
  },

  // Posts Management
  {
    path: '/posts',
    titles: {
      en: 'Posts Management | {{platformTitle}}',
      vi: 'Quản Lý Bài Viết | {{platformTitle}}'
    },
    description: {
      en: 'Manage blog posts and articles',
      vi: 'Quản lý bài viết blog và bài báo'
    }
  },
  {
    path: '/posts/create',
    titles: {
      en: 'Create New Post | {{platformTitle}}',
      vi: 'Tạo Bài Viết Mới | {{platformTitle}}'
    },
    description: {
      en: 'Write and publish a new post',
      vi: 'Viết và xuất bản bài viết mới'
    }
  },
  {
    path: '/posts/:id',
    titles: {
      en: 'Edit Post | {{platformTitle}}',
      vi: 'Chỉnh Sửa Bài Viết | {{platformTitle}}'
    },
    description: {
      en: 'Update post content and settings',
      vi: 'Cập nhật nội dung và cài đặt bài viết'
    }
  },
  {
    path: '/posts/categories',
    titles: {
      en: 'Post Categories | {{platformTitle}}',
      vi: 'Danh Mục Bài Viết | {{platformTitle}}'
    },
    description: {
      en: 'Manage post categories',
      vi: 'Quản lý danh mục bài viết'
    }
  },
  {
    path: '/posts/tags',
    titles: {
      en: 'Post Tags | {{platformTitle}}',
      vi: 'Thẻ Bài Viết | {{platformTitle}}'
    },
    description: {
      en: 'Manage post tags',
      vi: 'Quản lý thẻ bài viết'
    }
  },

  // Site Content Management
  {
    path: '/site-content',
    titles: {
      en: 'Site Content | {{platformTitle}}',
      vi: 'Nội Dung Trang | {{platformTitle}}'
    },
    description: {
      en: 'Manage website content and pages',
      vi: 'Quản lý nội dung và trang web'
    }
  },
  {
    path: '/site-content/create',
    titles: {
      en: 'Create Content | {{platformTitle}}',
      vi: 'Tạo Nội Dung | {{platformTitle}}'
    },
    description: {
      en: 'Create new website content',
      vi: 'Tạo nội dung web mới'
    }
  },
  {
    path: '/site-content/:id/edit',
    titles: {
      en: 'Edit Content | {{platformTitle}}',
      vi: 'Chỉnh Sửa Nội Dung | {{platformTitle}}'
    },
    description: {
      en: 'Update website content',
      vi: 'Cập nhật nội dung web'
    }
  },

  // Languages Management
  {
    path: '/languages',
    titles: {
      en: 'Languages | {{platformTitle}}',
      vi: 'Ngôn Ngữ | {{platformTitle}}'
    },
    description: {
      en: 'Manage website languages and translations',
      vi: 'Quản lý ngôn ngữ và bản dịch web'
    }
  },
  {
    path: '/languages/create',
    titles: {
      en: 'Add Language | {{platformTitle}}',
      vi: 'Thêm Ngôn Ngữ | {{platformTitle}}'
    },
    description: {
      en: 'Add a new language to the system',
      vi: 'Thêm ngôn ngữ mới vào hệ thống'
    }
  },
  {
    path: '/languages/:id/edit',
    titles: {
      en: 'Edit Language | {{platformTitle}}',
      vi: 'Chỉnh Sửa Ngôn Ngữ | {{platformTitle}}'
    },
    description: {
      en: 'Update language settings',
      vi: 'Cập nhật cài đặt ngôn ngữ'
    }
  },

  // Firebase Configuration
  {
    path: '/firebase-configs',
    titles: {
      en: 'Firebase Configuration | {{platformTitle}}',
      vi: 'Cấu Hình Firebase | {{platformTitle}}'
    },
    description: {
      en: 'Manage Firebase service configurations',
      vi: 'Quản lý cấu hình dịch vụ Firebase'
    }
  },
  {
    path: '/firebase-configs/create',
    titles: {
      en: 'Create Firebase Config | {{platformTitle}}',
      vi: 'Tạo Cấu Hình Firebase | {{platformTitle}}'
    },
    description: {
      en: 'Add new Firebase configuration',
      vi: 'Thêm cấu hình Firebase mới'
    }
  },
  {
    path: '/firebase-configs/:id',
    titles: {
      en: 'Edit Firebase Config | {{platformTitle}}',
      vi: 'Chỉnh Sửa Cấu Hình Firebase | {{platformTitle}}'
    },
    description: {
      en: 'Update Firebase configuration',
      vi: 'Cập nhật cấu hình Firebase'
    }
  },

  // Notifications
  {
    path: '/notifications',
    titles: {
      en: 'Notifications | {{platformTitle}}',
      vi: 'Thông Báo | {{platformTitle}}'
    },
    description: {
      en: 'Manage system notifications',
      vi: 'Quản lý thông báo hệ thống'
    }
  },
  {
    path: '/notifications/preferences',
    titles: {
      en: 'Notification Preferences | {{platformTitle}}',
      vi: 'Sở Thích Thông Báo | {{platformTitle}}'
    },
    description: {
      en: 'Configure notification settings',
      vi: 'Cấu hình cài đặt thông báo'
    }
  },
  {
    path: '/notifications/event-flows',
    titles: {
      en: 'Notification Event Flows | {{platformTitle}}',
      vi: 'Luồng Thông Báo Theo Sự Kiện | {{platformTitle}}'
    },
    description: {
      en: 'Set up templates, recipients, CC, and channels for every notification event',
      vi: 'Thiết lập mẫu, người nhận và kênh gửi cho từng sự kiện thông báo'
    }
  },

  // Product Management
  {
    path: '/products',
    titles: {
      en: 'Products Management | {{platformTitle}}',
      vi: 'Quản Lý Sản Phẩm | {{platformTitle}}'
    },
    description: {
      en: 'Manage products, inventory, and pricing',
      vi: 'Quản lý sản phẩm, tồn kho và giá cả'
    }
  },
  {
    path: '/products/create',
    titles: {
      en: 'Create New Product | {{platformTitle}}',
      vi: 'Tạo Sản Phẩm Mới | {{platformTitle}}'
    },
    description: {
      en: 'Add a new product to catalog',
      vi: 'Thêm sản phẩm mới vào danh mục'
    }
  },
  {
    path: '/products/:id/edit',
    titles: {
      en: 'Edit Product | {{platformTitle}}',
      vi: 'Chỉnh Sửa Sản Phẩm | {{platformTitle}}'
    },
    description: {
      en: 'Update product information and pricing',
      vi: 'Cập nhật thông tin và giá sản phẩm'
    }
  },
  {
    path: '/products/categories',
    titles: {
      en: 'Product Categories | {{platformTitle}}',
      vi: 'Danh Mục Sản Phẩm | {{platformTitle}}'
    },
    description: {
      en: 'Manage product categories',
      vi: 'Quản lý danh mục sản phẩm'
    }
  },
  {
    path: '/products/categories/create',
    titles: {
      en: 'Create Product Category | {{platformTitle}}',
      vi: 'Tạo Danh Mục Sản Phẩm | {{platformTitle}}'
    },
    description: {
      en: 'Add a new product category',
      vi: 'Thêm danh mục sản phẩm mới'
    }
  },
  {
    path: '/products/categories/:id/edit',
    titles: {
      en: 'Edit Product Category | {{platformTitle}}',
      vi: 'Chỉnh Sửa Danh Mục Sản Phẩm | {{platformTitle}}'
    },
    description: {
      en: 'Update product category settings',
      vi: 'Cập nhật cài đặt danh mục sản phẩm'
    }
  },
  {
    path: '/products/attributes',
    titles: {
      en: 'Product Attributes | {{platformTitle}}',
      vi: 'Thuộc Tính Sản Phẩm | {{platformTitle}}'
    },
    description: {
      en: 'Manage product attributes and specifications',
      vi: 'Quản lý thuộc tính và thông số kỹ thuật sản phẩm'
    }
  },
  {
    path: '/products/brands',
    titles: {
      en: 'Product Brands | {{platformTitle}}',
      vi: 'Thương Hiệu Sản Phẩm | {{platformTitle}}'
    },
    description: {
      en: 'Manage product brands',
      vi: 'Quản lý thương hiệu sản phẩm'
    }
  },
  {
    path: '/products/suppliers',
    titles: {
      en: 'Product Suppliers | {{platformTitle}}',
      vi: 'Nhà Cung Cấp Sản Phẩm | {{platformTitle}}'
    },
    description: {
      en: 'Manage product suppliers and vendors',
      vi: 'Quản lý nhà cung cấp và nhà bán lẻ sản phẩm'
    }
  },

  // Warehouse Management
  {
    path: '/warehouses',
    titles: {
      en: 'Warehouses Management | {{platformTitle}}',
      vi: 'Quản Lý Kho Hàng | {{platformTitle}}'
    },
    description: {
      en: 'Manage warehouse locations and inventory',
      vi: 'Quản lý địa điểm kho hàng và tồn kho'
    }
  },
  {
    path: '/warehouses/create',
    titles: {
      en: 'Create Warehouse | {{platformTitle}}',
      vi: 'Tạo Kho Hàng | {{platformTitle}}'
    },
    description: {
      en: 'Add a new warehouse location',
      vi: 'Thêm địa điểm kho hàng mới'
    }
  },
  {
    path: '/warehouses/:id/edit',
    titles: {
      en: 'Edit Warehouse | {{platformTitle}}',
      vi: 'Chỉnh Sửa Kho Hàng | {{platformTitle}}'
    },
    description: {
      en: 'Update warehouse information',
      vi: 'Cập nhật thông tin kho hàng'
    }
  },
  {
    path: '/warehouses/locations',
    titles: {
      en: 'Warehouse Locations | {{platformTitle}}',
      vi: 'Địa Điểm Kho Hàng | {{platformTitle}}'
    },
    description: {
      en: 'Manage warehouse storage locations',
      vi: 'Quản lý địa điểm lưu trữ kho hàng'
    }
  },
  {
    path: '/warehouses/locations/create',
    titles: {
      en: 'Create Warehouse Location | {{platformTitle}}',
      vi: 'Tạo Địa Điểm Kho Hàng | {{platformTitle}}'
    },
    description: {
      en: 'Add a new storage location',
      vi: 'Thêm địa điểm lưu trữ mới'
    }
  },
  {
    path: '/warehouses/locations/:id/edit',
    titles: {
      en: 'Edit Warehouse Location | {{platformTitle}}',
      vi: 'Chỉnh Sửa Địa Điểm Kho Hàng | {{platformTitle}}'
    },
    description: {
      en: 'Update storage location details',
      vi: 'Cập nhật chi tiết địa điểm lưu trữ'
    }
  },

  // Payment Methods
  {
    path: '/payment-methods',
    titles: {
      en: 'Payment Methods | {{platformTitle}}',
      vi: 'Phương Thức Thanh Toán | {{platformTitle}}'
    },
    description: {
      en: 'Configure payment processing methods',
      vi: 'Cấu hình phương thức xử lý thanh toán'
    }
  },
  {
    path: '/transactions',
    titles: {
      en: 'Transactions | {{platformTitle}}',
      vi: 'Giao Dịch | {{platformTitle}}'
    },
    description: {
      en: 'Monitor and manage customer financial transactions',
      vi: 'Theo dõi và quản lý giao dịch tài chính của khách hàng'
    }
  },

  // Delivery Methods
  {
    path: '/delivery-methods',
    titles: {
      en: 'Delivery Methods | {{platformTitle}}',
      vi: 'Phương Thức Giao Hàng | {{platformTitle}}'
    },
    description: {
      en: 'Manage shipping and delivery options',
      vi: 'Quản lý tùy chọn vận chuyển và giao hàng'
    }
  },

  // Support Clients
  {
    path: '/support-clients',
    titles: {
      en: 'Support Clients | {{platformTitle}}',
      vi: 'Khách Hàng Hỗ Trợ | {{platformTitle}}'
    },
    description: {
      en: 'Manage client support accounts',
      vi: 'Quản lý tài khoản hỗ trợ khách hàng'
    }
  },

  // Sections Management
  {
    path: '/sections/:page',
    titles: {
      en: 'Section Management | {{platformTitle}}',
      vi: 'Quản Lý Phần | {{platformTitle}}'
    },
    description: {
      en: 'Manage website sections and content blocks',
      vi: 'Quản lý các phần và khối nội dung web'
    }
  },

  // Menu Management
  {
    path: '/menus/:group',
    titles: {
      en: 'Menu Management | {{platformTitle}}',
      vi: 'Quản Lý Menu | {{platformTitle}}'
    },
    description: {
      en: 'Configure navigation menus',
      vi: 'Cấu hình menu điều hướng'
    }
  },

  // Order Management
  {
    path: '/orders',
    titles: {
      en: 'Orders Management | {{platformTitle}}',
      vi: 'Quản Lý Đơn Hàng | {{platformTitle}}'
    },
    description: {
      en: 'Manage customer orders and fulfillment',
      vi: 'Quản lý đơn hàng và thực hiện của khách hàng'
    }
  },
  {
    path: '/orders/new',
    titles: {
      en: 'Create New Order | {{platformTitle}}',
      vi: 'Tạo Đơn Hàng Mới | {{platformTitle}}'
    },
    description: {
      en: 'Create a new customer order',
      vi: 'Tạo đơn hàng khách hàng mới'
    }
  },
  {
    path: '/orders/:id',
    titles: {
      en: 'Order Details | {{platformTitle}}',
      vi: 'Chi Tiết Đơn Hàng | {{platformTitle}}'
    },
    description: {
      en: 'View and manage order details',
      vi: 'Xem và quản lý chi tiết đơn hàng'
    }
  },
  {
    path: '/orders/:id/edit',
    titles: {
      en: 'Edit Order | {{platformTitle}}',
      vi: 'Chỉnh Sửa Đơn Hàng | {{platformTitle}}'
    },
    description: {
      en: 'Update order information',
      vi: 'Cập nhật thông tin đơn hàng'
    }
  },
  {
    path: '/orders/fulfillments',
    titles: {
      en: 'Order Fulfillments | {{platformTitle}}',
      vi: 'Thực Hiện Đơn Hàng | {{platformTitle}}'
    },
    description: {
      en: 'Manage order fulfillment and shipping',
      vi: 'Quản lý thực hiện và vận chuyển đơn hàng'
    }
  },
  {
    path: '/orders/fulfillments/new',
    titles: {
      en: 'Create Order Fulfillment | {{platformTitle}}',
      vi: 'Tạo Thực Hiện Đơn Hàng | {{platformTitle}}'
    },
    description: {
      en: 'Create new order fulfillment',
      vi: 'Tạo thực hiện đơn hàng mới'
    }
  },
  {
    path: '/orders/fulfillments/:id',
    titles: {
      en: 'Fulfillment Details | {{platformTitle}}',
      vi: 'Chi Tiết Thực Hiện | {{platformTitle}}'
    },
    description: {
      en: 'View fulfillment details and tracking',
      vi: 'Xem chi tiết thực hiện và theo dõi'
    }
  },

  // Customer Management
  {
    path: '/customers',
    titles: {
      en: 'Customers Management | {{platformTitle}}',
      vi: 'Quản Lý Khách Hàng | {{platformTitle}}'
    },
    description: {
      en: 'Manage customer accounts and data',
      vi: 'Quản lý tài khoản và dữ liệu khách hàng'
    }
  },
  {
    path: '/customers/create',
    titles: {
      en: 'Create New Customer | {{platformTitle}}',
      vi: 'Tạo Khách Hàng Mới | {{platformTitle}}'
    },
    description: {
      en: 'Add a new customer account',
      vi: 'Thêm tài khoản khách hàng mới'
    }
  },
  {
    path: '/customers/:id',
    titles: {
      en: 'Customer Details | {{platformTitle}}',
      vi: 'Chi Tiết Khách Hàng | {{platformTitle}}'
    },
    description: {
      en: 'View customer information and history',
      vi: 'Xem thông tin và lịch sử khách hàng'
    }
  },
  {
    path: '/customers/:id/edit',
    titles: {
      en: 'Edit Customer | {{platformTitle}}',
      vi: 'Chỉnh Sửa Khách Hàng | {{platformTitle}}'
    },
    description: {
      en: 'Update customer information',
      vi: 'Cập nhật thông tin khách hàng'
    }
  },

  // Loyalty Management
  {
    path: '/loyalty',
    titles: {
      en: 'Loyalty Management | {{platformTitle}}',
      vi: 'Quản Lý Khách Hàng Thân Thiết | {{platformTitle}}'
    },
    description: {
      en: 'Manage loyalty programs and rewards',
      vi: 'Quản lý chương trình khách hàng thân thiết và phần thưởng'
    }
  },

  // Help Page
  {
    path: '/help',
    titles: {
      en: 'Help Center | {{platformTitle}}',
      vi: 'Trung Tâm Trợ Giúp | {{platformTitle}}'
    },
    description: {
      en: 'Get help and documentation',
      vi: 'Nhận trợ giúp và tài liệu'
    }
  },

  // Test Pages
  {
    path: '/test/date-input',
    titles: {
      en: 'Date Input Test | {{platformTitle}}',
      vi: 'Kiểm Tra Input Ngày | {{platformTitle}}'
    },
    description: {
      en: 'Test date input component functionality',
      vi: 'Kiểm tra chức năng component input ngày'
    }
  },
  {
    path: '/test/phone-input',
    titles: {
      en: 'Phone Input Test | {{platformTitle}}',
      vi: 'Kiểm Tra Input SĐT | {{platformTitle}}'
    },
    description: {
      en: 'Test phone input component functionality',
      vi: 'Kiểm tra chức năng component input số điện thoại'
    }
  },

  // Additional Loyalty Pages (if they exist)
  {
    path: '/loyalty/rewards/create',
    titles: {
      en: 'Create Loyalty Reward | {{platformTitle}}',
      vi: 'Tạo Phần Thưởng Khách Hàng Thân Thiết | {{platformTitle}}'
    },
    description: {
      en: 'Create a new loyalty reward program',
      vi: 'Tạo chương trình phần thưởng khách hàng thân thiết mới'
    }
  },
  {
    path: '/loyalty/tiers/create',
    titles: {
      en: 'Create Loyalty Tier | {{platformTitle}}',
      vi: 'Tạo Hạng Khách Hàng Thân Thiết | {{platformTitle}}'
    },
    description: {
      en: 'Create a new customer loyalty tier',
      vi: 'Tạo hạng khách hàng thân thiết mới'
    }
  },

  // Additional System Pages
  {
    path: '/sections',
    titles: {
      en: 'Sections Management | {{platformTitle}}',
      vi: 'Quản Lý Phần | {{platformTitle}}'
    },
    description: {
      en: 'Manage website sections and content blocks',
      vi: 'Quản lý các phần và khối nội dung web'
    }
  },
  {
    path: '/component-configs',
    titles: {
      en: 'Component Library | {{platformTitle}}',
      vi: 'Thư Viện Component | {{platformTitle}}',
    },
    description: {
      en: 'Control storefront component defaults, schema, and nesting rules.',
      vi: 'Quản lý cấu hình mặc định, schema và quan hệ cha-con của component storefront.',
    },
  },
  {
    path: '/component-configs/create',
    titles: {
      en: 'Create Component | {{platformTitle}}',
      vi: 'Tạo Component | {{platformTitle}}',
    },
    description: {
      en: 'Add a new building block with default content, schema, and placement metadata.',
      vi: 'Tạo component mới với nội dung mặc định, schema và thông tin vị trí.',
    },
  },
  {
    path: '/component-configs/:id/edit',
    titles: {
      en: 'Edit Component | {{platformTitle}}',
      vi: 'Chỉnh Sửa Component | {{platformTitle}}',
    },
    description: {
      en: 'Update component defaults, schema, and allowed relationships on a dedicated page.',
      vi: 'Chỉnh sửa cấu hình component, schema và quan hệ cho phép trên trang riêng.',
    },
  },
  {
    path: '/menus',
    titles: {
      en: 'Menu Management | {{platformTitle}}',
      vi: 'Quản Lý Menu | {{platformTitle}}'
    },
    description: {
      en: 'Configure navigation menus and menu items',
      vi: 'Cấu hình menu điều hướng và các mục menu'
    }
  },

  // Developer and Testing Pages
  {
    path: '/test/date-input',
    titles: {
      en: 'Date Input Test | {{platformTitle}}',
      vi: 'Kiểm Tra Input Ngày | {{platformTitle}}'
    },
    description: {
      en: 'Test date input component functionality',
      vi: 'Kiểm tra chức năng component input ngày'
    }
  },
  {
    path: '/test/phone-input',
    titles: {
      en: 'Phone Input Test | {{platformTitle}}',
      vi: 'Kiểm Tra Input SĐT | {{platformTitle}}'
    },
    description: {
      en: 'Test phone input component functionality',
      vi: 'Kiểm tra chức năng component input số điện thoại'
    }
  },

  // Additional Loyalty Pages
  {
    path: '/loyalty/rewards/create',
    titles: {
      en: 'Create Loyalty Reward | {{platformTitle}}',
      vi: 'Tạo Phần Thưởng Khách Hàng Thân Thiết | {{platformTitle}}'
    },
    description: {
      en: 'Create a new loyalty reward program',
      vi: 'Tạo chương trình phần thưởng khách hàng thân thiết mới'
    }
  },
  {
    path: '/loyalty/tiers/create',
    titles: {
      en: 'Create Loyalty Tier | {{platformTitle}}',
      vi: 'Tạo Hạng Khách Hàng Thân Thiết | {{platformTitle}}'
    },
    description: {
      en: 'Create a new customer loyalty tier',
      vi: 'Tạo hạng khách hàng thân thiết mới'
    }
  },

  // Wildcard route for dynamic sections
  {
    path: '/sections/:page',
    titles: {
      en: 'Section Editor | {{platformTitle}}',
      vi: 'Trình Chỉnh Sửa Phần | {{platformTitle}}'
    },
    description: {
      en: 'Edit website section content and settings',
      vi: 'Chỉnh sửa nội dung và cài đặt phần web'
    }
  },

  // Wildcard route for dynamic menu groups
  {
    path: '/menus/:group',
    titles: {
      en: 'Menu Group Editor | {{platformTitle}}',
      vi: 'Trình Chỉnh Sửa Nhóm Menu | {{platformTitle}}'
    },
    description: {
      en: 'Edit menu group items and configuration',
      vi: 'Chỉnh sửa các mục và cấu hình nhóm menu'
    }
  },

  // 404 Error Page
  {
    path: '/404',
    titles: {
      en: 'Page Not Found | {{platformTitle}}',
      vi: 'Không Tìm Thấy Trang | {{platformTitle}}'
    },
    description: {
      en: 'The page you are looking for does not exist',
      vi: 'Trang bạn đang tìm kiếm không tồn tại'
    }
  },

  // Specialized Functionality Pages
  {
    path: '/orders/new',
    titles: {
      en: 'Create New Order | {{platformTitle}}',
      vi: 'Tạo Đơn Hàng Mới | {{platformTitle}}'
    },
    description: {
      en: 'Create a new customer order with products and billing',
      vi: 'Tạo đơn hàng khách hàng mới với sản phẩm và thanh toán'
    }
  },
  {
    path: '/orders/fulfillments',
    titles: {
      en: 'Order Fulfillments | {{platformTitle}}',
      vi: 'Thực Hiện Đơn Hàng | {{platformTitle}}'
    },
    description: {
      en: 'Manage order fulfillment and shipping operations',
      vi: 'Quản lý thực hiện và vận chuyển đơn hàng'
    }
  },
  {
    path: '/orders/fulfillments/new',
    titles: {
      en: 'Create Order Fulfillment | {{platformTitle}}',
      vi: 'Tạo Thực Hiện Đơn Hàng | {{platformTitle}}'
    },
    description: {
      en: 'Create new order fulfillment with tracking details',
      vi: 'Tạo thực hiện đơn hàng mới với chi tiết theo dõi'
    }
  },
  {
    path: '/customers/detail',
    titles: {
      en: 'Customer Details | {{platformTitle}}',
      vi: 'Chi Tiết Khách Hàng | {{platformTitle}}'
    },
    description: {
      en: 'View detailed customer information and order history',
      vi: 'Xem thông tin chi tiết khách hàng và lịch sử đơn hàng'
    }
  },

  // Generic wildcard for other dynamic routes
  {
    path: '*',
    titles: {
      en: 'Page Not Found | {{platformTitle}}',
      vi: 'Không Tìm Thấy Trang | {{platformTitle}}'
    },
    description: {
      en: 'The page you are looking for does not exist',
      vi: 'Trang bạn đang tìm kiếm không tồn tại'
    }
  }
];

/**
 * Get SEO configuration for a specific path
 */
export function getSeoConfigForPath(path: string, locale: 'en' | 'vi' = 'en'): AdminPageSeoConfig | null {
  // Try to find exact match first
  let config = adminPageSeoTitles.find(item => item.path === path);

  if (!config) {
    // Try to match with parameterized routes
    config = adminPageSeoTitles.find(item => {
      const routeParts = item.path.split('/');
      const pathParts = path.split('/');

      if (routeParts.length !== pathParts.length) {
        return false;
      }

      return routeParts.every((part, index) => {
        return part.startsWith(':') || part === pathParts[index];
      });
    });
  }

  return config || null;
}

/**
 * Get meta title for a specific path and locale
 */
export function getMetaTitleForPath(
  path: string,
  locale: 'en' | 'vi' = 'en',
  platformTitle?: string,
): string {
  const config = getSeoConfigForPath(path, locale);
  const baseTitle = config ? config.titles[locale] : PLATFORM_TITLE_PLACEHOLDER;
  return replacePlatformPlaceholder(baseTitle, platformTitle);
}

/**
 * Get meta description for a specific path and locale
 */
export function getMetaDescriptionForPath(path: string, locale: 'en' | 'vi' = 'en'): string {
  const config = getSeoConfigForPath(path, locale);
  return config?.description?.[locale] || 'Admin dashboard for managing your application';
}
