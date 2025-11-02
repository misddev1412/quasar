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

export const adminPageSeoTitles: AdminPageSeoConfig[] = [
  // Main Dashboard
  {
    path: '/',
    titles: {
      en: 'Dashboard | Quasar Admin',
      vi: 'Bảng Điều Khiển | Quasar Admin'
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
      en: 'Admin Login | Quasar',
      vi: 'Đăng Nhập Admin | Quasar'
    },
    description: {
      en: 'Sign in to admin dashboard',
      vi: 'Đăng nhập vào bảng điều khiển quản trị'
    }
  },
  {
    path: '/auth/forgot-password',
    titles: {
      en: 'Forgot Password | Quasar Admin',
      vi: 'Quên Mật Khẩu | Quasar Admin'
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
      en: 'Users Management | Quasar Admin',
      vi: 'Quản Lý Người Dùng | Quasar Admin'
    },
    description: {
      en: 'Manage system users and accounts',
      vi: 'Quản lý người dùng và tài khoản hệ thống'
    }
  },
  {
    path: '/users/create',
    titles: {
      en: 'Create New User | Quasar Admin',
      vi: 'Tạo Người Dùng Mới | Quasar Admin'
    },
    description: {
      en: 'Add a new user to the system',
      vi: 'Thêm người dùng mới vào hệ thống'
    }
  },
  {
    path: '/users/:id',
    titles: {
      en: 'Edit User | Quasar Admin',
      vi: 'Chỉnh Sửa Người Dùng | Quasar Admin'
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
      en: 'Roles Management | Quasar Admin',
      vi: 'Quản Lý Vai Trò | Quasar Admin'
    },
    description: {
      en: 'Manage user roles and permissions',
      vi: 'Quản lý vai trò và quyền hạn người dùng'
    }
  },
  {
    path: '/roles/create',
    titles: {
      en: 'Create New Role | Quasar Admin',
      vi: 'Tạo Vai Trò Mới | Quasar Admin'
    },
    description: {
      en: 'Define a new role with permissions',
      vi: 'Định nghĩa vai trò mới với quyền hạn'
    }
  },
  {
    path: '/roles/:id',
    titles: {
      en: 'Edit Role | Quasar Admin',
      vi: 'Chỉnh Sửa Vai Trò | Quasar Admin'
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
      en: 'Permissions Management | Quasar Admin',
      vi: 'Quản Lý Quyền Hạn | Quasar Admin'
    },
    description: {
      en: 'Manage system permissions and access control',
      vi: 'Quản lý quyền hạn hệ thống và kiểm soát truy cập'
    }
  },
  {
    path: '/permissions/create',
    titles: {
      en: 'Create New Permission | Quasar Admin',
      vi: 'Tạo Quyền Hạn Mới | Quasar Admin'
    },
    description: {
      en: 'Define a new system permission',
      vi: 'Định nghĩa quyền hạn hệ thống mới'
    }
  },
  {
    path: '/permissions/:id',
    titles: {
      en: 'Edit Permission | Quasar Admin',
      vi: 'Chỉnh Sửa Quyền Hạn | Quasar Admin'
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
      en: 'My Profile | Quasar Admin',
      vi: 'Hồ Sơ Của Tôi | Quasar Admin'
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
      en: 'SEO Management | Quasar Admin',
      vi: 'Quản Lý SEO | Quasar Admin'
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
      en: 'System Settings | Quasar Admin',
      vi: 'Cài Đặt Hệ Thống | Quasar Admin'
    },
    description: {
      en: 'Configure system settings and preferences',
      vi: 'Cấu hình cài đặt hệ thống và sở thích'
    }
  },
  {
    path: '/settings/visibility',
    titles: {
      en: 'Visibility Settings | Quasar Admin',
      vi: 'Cài Đặt Hiển Thị | Quasar Admin'
    },
    description: {
      en: 'Manage content visibility settings',
      vi: 'Quản lý cài đặt hiển thị nội dung'
    }
  },
  {
    path: '/settings/floating-icons',
    titles: {
      en: 'Floating Icons Settings | Quasar Admin',
      vi: 'Cài Đặt Biểu Tượng Nổi | Quasar Admin'
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
      en: 'Storage Configuration | Quasar Admin',
      vi: 'Cấu Hình Lưu Trữ | Quasar Admin'
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
      en: 'Brand Assets | Quasar Admin',
      vi: 'Tài Sản Thương Hiệu | Quasar Admin'
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
      en: 'Analytics Configuration | Quasar Admin',
      vi: 'Cấu Hình Analytics | Quasar Admin'
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
      en: 'Mail Templates | Quasar Admin',
      vi: 'Mẫu Thư | Quasar Admin'
    },
    description: {
      en: 'Manage email templates and notifications',
      vi: 'Quản lý mẫu email và thông báo'
    }
  },
  {
    path: '/mail-templates/create',
    titles: {
      en: 'Create Mail Template | Quasar Admin',
      vi: 'Tạo Mẫu Thư | Quasar Admin'
    },
    description: {
      en: 'Create a new email template',
      vi: 'Tạo mẫu email mới'
    }
  },
  {
    path: '/mail-templates/:id',
    titles: {
      en: 'Edit Mail Template | Quasar Admin',
      vi: 'Chỉnh Sửa Mẫu Thư | Quasar Admin'
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
      en: 'Posts Management | Quasar Admin',
      vi: 'Quản Lý Bài Viết | Quasar Admin'
    },
    description: {
      en: 'Manage blog posts and articles',
      vi: 'Quản lý bài viết blog và bài báo'
    }
  },
  {
    path: '/posts/create',
    titles: {
      en: 'Create New Post | Quasar Admin',
      vi: 'Tạo Bài Viết Mới | Quasar Admin'
    },
    description: {
      en: 'Write and publish a new post',
      vi: 'Viết và xuất bản bài viết mới'
    }
  },
  {
    path: '/posts/:id',
    titles: {
      en: 'Edit Post | Quasar Admin',
      vi: 'Chỉnh Sửa Bài Viết | Quasar Admin'
    },
    description: {
      en: 'Update post content and settings',
      vi: 'Cập nhật nội dung và cài đặt bài viết'
    }
  },
  {
    path: '/posts/categories',
    titles: {
      en: 'Post Categories | Quasar Admin',
      vi: 'Danh Mục Bài Viết | Quasar Admin'
    },
    description: {
      en: 'Manage post categories',
      vi: 'Quản lý danh mục bài viết'
    }
  },
  {
    path: '/posts/tags',
    titles: {
      en: 'Post Tags | Quasar Admin',
      vi: 'Thẻ Bài Viết | Quasar Admin'
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
      en: 'Site Content | Quasar Admin',
      vi: 'Nội Dung Trang | Quasar Admin'
    },
    description: {
      en: 'Manage website content and pages',
      vi: 'Quản lý nội dung và trang web'
    }
  },
  {
    path: '/site-content/create',
    titles: {
      en: 'Create Content | Quasar Admin',
      vi: 'Tạo Nội Dung | Quasar Admin'
    },
    description: {
      en: 'Create new website content',
      vi: 'Tạo nội dung web mới'
    }
  },
  {
    path: '/site-content/:id/edit',
    titles: {
      en: 'Edit Content | Quasar Admin',
      vi: 'Chỉnh Sửa Nội Dung | Quasar Admin'
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
      en: 'Languages | Quasar Admin',
      vi: 'Ngôn Ngữ | Quasar Admin'
    },
    description: {
      en: 'Manage website languages and translations',
      vi: 'Quản lý ngôn ngữ và bản dịch web'
    }
  },
  {
    path: '/languages/create',
    titles: {
      en: 'Add Language | Quasar Admin',
      vi: 'Thêm Ngôn Ngữ | Quasar Admin'
    },
    description: {
      en: 'Add a new language to the system',
      vi: 'Thêm ngôn ngữ mới vào hệ thống'
    }
  },
  {
    path: '/languages/:id/edit',
    titles: {
      en: 'Edit Language | Quasar Admin',
      vi: 'Chỉnh Sửa Ngôn Ngữ | Quasar Admin'
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
      en: 'Firebase Configuration | Quasar Admin',
      vi: 'Cấu Hình Firebase | Quasar Admin'
    },
    description: {
      en: 'Manage Firebase service configurations',
      vi: 'Quản lý cấu hình dịch vụ Firebase'
    }
  },
  {
    path: '/firebase-configs/create',
    titles: {
      en: 'Create Firebase Config | Quasar Admin',
      vi: 'Tạo Cấu Hình Firebase | Quasar Admin'
    },
    description: {
      en: 'Add new Firebase configuration',
      vi: 'Thêm cấu hình Firebase mới'
    }
  },
  {
    path: '/firebase-configs/:id',
    titles: {
      en: 'Edit Firebase Config | Quasar Admin',
      vi: 'Chỉnh Sửa Cấu Hình Firebase | Quasar Admin'
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
      en: 'Notifications | Quasar Admin',
      vi: 'Thông Báo | Quasar Admin'
    },
    description: {
      en: 'Manage system notifications',
      vi: 'Quản lý thông báo hệ thống'
    }
  },
  {
    path: '/notifications/preferences',
    titles: {
      en: 'Notification Preferences | Quasar Admin',
      vi: 'Sở Thích Thông Báo | Quasar Admin'
    },
    description: {
      en: 'Configure notification settings',
      vi: 'Cấu hình cài đặt thông báo'
    }
  },

  // Product Management
  {
    path: '/products',
    titles: {
      en: 'Products Management | Quasar Admin',
      vi: 'Quản Lý Sản Phẩm | Quasar Admin'
    },
    description: {
      en: 'Manage products, inventory, and pricing',
      vi: 'Quản lý sản phẩm, tồn kho và giá cả'
    }
  },
  {
    path: '/products/create',
    titles: {
      en: 'Create New Product | Quasar Admin',
      vi: 'Tạo Sản Phẩm Mới | Quasar Admin'
    },
    description: {
      en: 'Add a new product to catalog',
      vi: 'Thêm sản phẩm mới vào danh mục'
    }
  },
  {
    path: '/products/:id/edit',
    titles: {
      en: 'Edit Product | Quasar Admin',
      vi: 'Chỉnh Sửa Sản Phẩm | Quasar Admin'
    },
    description: {
      en: 'Update product information and pricing',
      vi: 'Cập nhật thông tin và giá sản phẩm'
    }
  },
  {
    path: '/products/categories',
    titles: {
      en: 'Product Categories | Quasar Admin',
      vi: 'Danh Mục Sản Phẩm | Quasar Admin'
    },
    description: {
      en: 'Manage product categories',
      vi: 'Quản lý danh mục sản phẩm'
    }
  },
  {
    path: '/products/categories/create',
    titles: {
      en: 'Create Product Category | Quasar Admin',
      vi: 'Tạo Danh Mục Sản Phẩm | Quasar Admin'
    },
    description: {
      en: 'Add a new product category',
      vi: 'Thêm danh mục sản phẩm mới'
    }
  },
  {
    path: '/products/categories/:id/edit',
    titles: {
      en: 'Edit Product Category | Quasar Admin',
      vi: 'Chỉnh Sửa Danh Mục Sản Phẩm | Quasar Admin'
    },
    description: {
      en: 'Update product category settings',
      vi: 'Cập nhật cài đặt danh mục sản phẩm'
    }
  },
  {
    path: '/products/attributes',
    titles: {
      en: 'Product Attributes | Quasar Admin',
      vi: 'Thuộc Tính Sản Phẩm | Quasar Admin'
    },
    description: {
      en: 'Manage product attributes and specifications',
      vi: 'Quản lý thuộc tính và thông số kỹ thuật sản phẩm'
    }
  },
  {
    path: '/products/brands',
    titles: {
      en: 'Product Brands | Quasar Admin',
      vi: 'Thương Hiệu Sản Phẩm | Quasar Admin'
    },
    description: {
      en: 'Manage product brands',
      vi: 'Quản lý thương hiệu sản phẩm'
    }
  },
  {
    path: '/products/suppliers',
    titles: {
      en: 'Product Suppliers | Quasar Admin',
      vi: 'Nhà Cung Cấp Sản Phẩm | Quasar Admin'
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
      en: 'Warehouses Management | Quasar Admin',
      vi: 'Quản Lý Kho Hàng | Quasar Admin'
    },
    description: {
      en: 'Manage warehouse locations and inventory',
      vi: 'Quản lý địa điểm kho hàng và tồn kho'
    }
  },
  {
    path: '/warehouses/create',
    titles: {
      en: 'Create Warehouse | Quasar Admin',
      vi: 'Tạo Kho Hàng | Quasar Admin'
    },
    description: {
      en: 'Add a new warehouse location',
      vi: 'Thêm địa điểm kho hàng mới'
    }
  },
  {
    path: '/warehouses/:id/edit',
    titles: {
      en: 'Edit Warehouse | Quasar Admin',
      vi: 'Chỉnh Sửa Kho Hàng | Quasar Admin'
    },
    description: {
      en: 'Update warehouse information',
      vi: 'Cập nhật thông tin kho hàng'
    }
  },
  {
    path: '/warehouses/locations',
    titles: {
      en: 'Warehouse Locations | Quasar Admin',
      vi: 'Địa Điểm Kho Hàng | Quasar Admin'
    },
    description: {
      en: 'Manage warehouse storage locations',
      vi: 'Quản lý địa điểm lưu trữ kho hàng'
    }
  },
  {
    path: '/warehouses/locations/create',
    titles: {
      en: 'Create Warehouse Location | Quasar Admin',
      vi: 'Tạo Địa Điểm Kho Hàng | Quasar Admin'
    },
    description: {
      en: 'Add a new storage location',
      vi: 'Thêm địa điểm lưu trữ mới'
    }
  },
  {
    path: '/warehouses/locations/:id/edit',
    titles: {
      en: 'Edit Warehouse Location | Quasar Admin',
      vi: 'Chỉnh Sửa Địa Điểm Kho Hàng | Quasar Admin'
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
      en: 'Payment Methods | Quasar Admin',
      vi: 'Phương Thức Thanh Toán | Quasar Admin'
    },
    description: {
      en: 'Configure payment processing methods',
      vi: 'Cấu hình phương thức xử lý thanh toán'
    }
  },

  // Delivery Methods
  {
    path: '/delivery-methods',
    titles: {
      en: 'Delivery Methods | Quasar Admin',
      vi: 'Phương Thức Giao Hàng | Quasar Admin'
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
      en: 'Support Clients | Quasar Admin',
      vi: 'Khách Hàng Hỗ Trợ | Quasar Admin'
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
      en: 'Section Management | Quasar Admin',
      vi: 'Quản Lý Phần | Quasar Admin'
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
      en: 'Menu Management | Quasar Admin',
      vi: 'Quản Lý Menu | Quasar Admin'
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
      en: 'Orders Management | Quasar Admin',
      vi: 'Quản Lý Đơn Hàng | Quasar Admin'
    },
    description: {
      en: 'Manage customer orders and fulfillment',
      vi: 'Quản lý đơn hàng và thực hiện của khách hàng'
    }
  },
  {
    path: '/orders/new',
    titles: {
      en: 'Create New Order | Quasar Admin',
      vi: 'Tạo Đơn Hàng Mới | Quasar Admin'
    },
    description: {
      en: 'Create a new customer order',
      vi: 'Tạo đơn hàng khách hàng mới'
    }
  },
  {
    path: '/orders/:id',
    titles: {
      en: 'Order Details | Quasar Admin',
      vi: 'Chi Tiết Đơn Hàng | Quasar Admin'
    },
    description: {
      en: 'View and manage order details',
      vi: 'Xem và quản lý chi tiết đơn hàng'
    }
  },
  {
    path: '/orders/:id/edit',
    titles: {
      en: 'Edit Order | Quasar Admin',
      vi: 'Chỉnh Sửa Đơn Hàng | Quasar Admin'
    },
    description: {
      en: 'Update order information',
      vi: 'Cập nhật thông tin đơn hàng'
    }
  },
  {
    path: '/orders/fulfillments',
    titles: {
      en: 'Order Fulfillments | Quasar Admin',
      vi: 'Thực Hiện Đơn Hàng | Quasar Admin'
    },
    description: {
      en: 'Manage order fulfillment and shipping',
      vi: 'Quản lý thực hiện và vận chuyển đơn hàng'
    }
  },
  {
    path: '/orders/fulfillments/new',
    titles: {
      en: 'Create Order Fulfillment | Quasar Admin',
      vi: 'Tạo Thực Hiện Đơn Hàng | Quasar Admin'
    },
    description: {
      en: 'Create new order fulfillment',
      vi: 'Tạo thực hiện đơn hàng mới'
    }
  },
  {
    path: '/orders/fulfillments/:id',
    titles: {
      en: 'Fulfillment Details | Quasar Admin',
      vi: 'Chi Tiết Thực Hiện | Quasar Admin'
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
      en: 'Customers Management | Quasar Admin',
      vi: 'Quản Lý Khách Hàng | Quasar Admin'
    },
    description: {
      en: 'Manage customer accounts and data',
      vi: 'Quản lý tài khoản và dữ liệu khách hàng'
    }
  },
  {
    path: '/customers/create',
    titles: {
      en: 'Create New Customer | Quasar Admin',
      vi: 'Tạo Khách Hàng Mới | Quasar Admin'
    },
    description: {
      en: 'Add a new customer account',
      vi: 'Thêm tài khoản khách hàng mới'
    }
  },
  {
    path: '/customers/:id',
    titles: {
      en: 'Customer Details | Quasar Admin',
      vi: 'Chi Tiết Khách Hàng | Quasar Admin'
    },
    description: {
      en: 'View customer information and history',
      vi: 'Xem thông tin và lịch sử khách hàng'
    }
  },
  {
    path: '/customers/:id/edit',
    titles: {
      en: 'Edit Customer | Quasar Admin',
      vi: 'Chỉnh Sửa Khách Hàng | Quasar Admin'
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
      en: 'Loyalty Management | Quasar Admin',
      vi: 'Quản Lý Khách Hàng Thân Thiết | Quasar Admin'
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
      en: 'Help Center | Quasar Admin',
      vi: 'Trung Tâm Trợ Giúp | Quasar Admin'
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
      en: 'Date Input Test | Quasar Admin',
      vi: 'Kiểm Tra Input Ngày | Quasar Admin'
    },
    description: {
      en: 'Test date input component functionality',
      vi: 'Kiểm tra chức năng component input ngày'
    }
  },
  {
    path: '/test/phone-input',
    titles: {
      en: 'Phone Input Test | Quasar Admin',
      vi: 'Kiểm Tra Input SĐT | Quasar Admin'
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
      en: 'Create Loyalty Reward | Quasar Admin',
      vi: 'Tạo Phần Thưởng Khách Hàng Thân Thiết | Quasar Admin'
    },
    description: {
      en: 'Create a new loyalty reward program',
      vi: 'Tạo chương trình phần thưởng khách hàng thân thiết mới'
    }
  },
  {
    path: '/loyalty/tiers/create',
    titles: {
      en: 'Create Loyalty Tier | Quasar Admin',
      vi: 'Tạo Hạng Khách Hàng Thân Thiết | Quasar Admin'
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
      en: 'Sections Management | Quasar Admin',
      vi: 'Quản Lý Phần | Quasar Admin'
    },
    description: {
      en: 'Manage website sections and content blocks',
      vi: 'Quản lý các phần và khối nội dung web'
    }
  },
  {
    path: '/menus',
    titles: {
      en: 'Menu Management | Quasar Admin',
      vi: 'Quản Lý Menu | Quasar Admin'
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
      en: 'Date Input Test | Quasar Admin',
      vi: 'Kiểm Tra Input Ngày | Quasar Admin'
    },
    description: {
      en: 'Test date input component functionality',
      vi: 'Kiểm tra chức năng component input ngày'
    }
  },
  {
    path: '/test/phone-input',
    titles: {
      en: 'Phone Input Test | Quasar Admin',
      vi: 'Kiểm Tra Input SĐT | Quasar Admin'
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
      en: 'Create Loyalty Reward | Quasar Admin',
      vi: 'Tạo Phần Thưởng Khách Hàng Thân Thiết | Quasar Admin'
    },
    description: {
      en: 'Create a new loyalty reward program',
      vi: 'Tạo chương trình phần thưởng khách hàng thân thiết mới'
    }
  },
  {
    path: '/loyalty/tiers/create',
    titles: {
      en: 'Create Loyalty Tier | Quasar Admin',
      vi: 'Tạo Hạng Khách Hàng Thân Thiết | Quasar Admin'
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
      en: 'Section Editor | Quasar Admin',
      vi: 'Trình Chỉnh Sửa Phần | Quasar Admin'
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
      en: 'Menu Group Editor | Quasar Admin',
      vi: 'Trình Chỉnh Sửa Nhóm Menu | Quasar Admin'
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
      en: 'Page Not Found | Quasar Admin',
      vi: 'Không Tìm Thấy Trang | Quasar Admin'
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
      en: 'Create New Order | Quasar Admin',
      vi: 'Tạo Đơn Hàng Mới | Quasar Admin'
    },
    description: {
      en: 'Create a new customer order with products and billing',
      vi: 'Tạo đơn hàng khách hàng mới với sản phẩm và thanh toán'
    }
  },
  {
    path: '/orders/fulfillments',
    titles: {
      en: 'Order Fulfillments | Quasar Admin',
      vi: 'Thực Hiện Đơn Hàng | Quasar Admin'
    },
    description: {
      en: 'Manage order fulfillment and shipping operations',
      vi: 'Quản lý thực hiện và vận chuyển đơn hàng'
    }
  },
  {
    path: '/orders/fulfillments/new',
    titles: {
      en: 'Create Order Fulfillment | Quasar Admin',
      vi: 'Tạo Thực Hiện Đơn Hàng | Quasar Admin'
    },
    description: {
      en: 'Create new order fulfillment with tracking details',
      vi: 'Tạo thực hiện đơn hàng mới với chi tiết theo dõi'
    }
  },
  {
    path: '/customers/detail',
    titles: {
      en: 'Customer Details | Quasar Admin',
      vi: 'Chi Tiết Khách Hàng | Quasar Admin'
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
      en: 'Page Not Found | Quasar Admin',
      vi: 'Không Tìm Thấy Trang | Quasar Admin'
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
export function getMetaTitleForPath(path: string, locale: 'en' | 'vi' = 'en'): string {
  const config = getSeoConfigForPath(path, locale);
  return config ? config.titles[locale] : 'Quasar Admin';
}

/**
 * Get meta description for a specific path and locale
 */
export function getMetaDescriptionForPath(path: string, locale: 'en' | 'vi' = 'en'): string {
  const config = getSeoConfigForPath(path, locale);
  return config?.description?.[locale] || 'Admin dashboard for managing your application';
}