import common from '@admin/i18n/locales/vi/common.json';
import products from '@admin/i18n/locales/vi/products.json';
import orders from '@admin/i18n/locales/vi/orders.json';
import users from '@admin/i18n/locales/vi/users.json';
import customers from '@admin/i18n/locales/vi/customers.json';
import categories from '@admin/i18n/locales/vi/categories.json';
import inventory from '@admin/i18n/locales/vi/inventory.json';
import shipping from '@admin/i18n/locales/vi/shipping.json';
import payment from '@admin/i18n/locales/vi/payment.json';
import settings from '@admin/i18n/locales/vi/settings.json';
import content from '@admin/i18n/locales/vi/content.json';
import auth from '@admin/i18n/locales/vi/auth.json';
import navigation from '@admin/i18n/locales/vi/navigation.json';
import form from '@admin/i18n/locales/vi/form.json';
import notifications from '@admin/i18n/locales/vi/notifications.json';
import misc from '@admin/i18n/locales/vi/misc.json';
import mail_providers from '@admin/i18n/locales/vi/mail_providers.json';
import sections from '@admin/i18n/locales/vi/sections.json';
import menus from '@admin/i18n/locales/vi/menus.json';
import posts from '@admin/i18n/locales/vi/posts.json';
import componentConfigs from '@admin/i18n/locales/vi/component_configs.json';
import permissions from '@admin/i18n/locales/vi/permissions.json';
import services from '@admin/i18n/locales/vi/services.json';
import product_bundles from '@admin/i18n/locales/vi/product_bundles.json';
import ai from '@admin/i18n/locales/vi/ai.json';
import admin from '@admin/i18n/locales/vi/admin.json';
import mail_logs from '@admin/i18n/locales/vi/mail_logs.json';
import delivery_methods from '@admin/i18n/locales/vi/delivery_methods.json';
import openai_configs from '@admin/i18n/locales/vi/openai_configs.json';
import profile from '@admin/i18n/locales/vi/profile.json';
import brands from '@admin/i18n/locales/vi/brands.json';


export default {
  ...common,
  ...products,
  ...orders,
  ...users,
  ...customers,
  ...categories,
  ...inventory,
  ...shipping,
  ...payment,
  ...settings,
  ...content,
  ...auth,
  ...navigation,
  ...form,
  ...notifications,
  ...misc,
  ...mail_providers,
  ...sections,
  ...menus,
  ...posts,
  ...componentConfigs,
  ...permissions,
  ...services,
  ...product_bundles,
  ...ai,
  "ai.config_missing_message": "Vui lòng cấu hình OpenAI trong bảng quản trị để sử dụng tính năng này.",
  "ai.include_product_links": "Chèn liên kết sản phẩm tự động",
  "ai.include_images": "Tự động tạo hình ảnh minh họa",
  "ai.length": "Độ dài văn bản",
  "ai.length_short": "Ngắn (~100-200 từ)",
  "ai.length_medium": "Vừa (~300-500 từ)",
  "ai.length_long": "Dài (~600-800 từ)",
  "ai.length_very_long": "Rất dài (>1000 từ)",
  "posts.general": "Chung",
  ...admin,
  ...mail_logs,
  ...delivery_methods,
  ...openai_configs,
  ...profile,
  ...brands,
};
