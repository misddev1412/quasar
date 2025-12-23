export const ADMIN_LOGIN_BRANDING_KEY = 'admin.branding.login';
export const ADMIN_SIDEBAR_BRANDING_KEY = 'admin.branding.sidebar';

export type AdminLoginBrandingConfig = {
  logoUrl?: string;
  logoText?: string;
  showLogoText?: boolean;
  width?: number;
  height?: number;
  platformTitle?: string;
};

export type AdminSidebarBrandingConfig = AdminLoginBrandingConfig & {
  brandName?: string;
  subtitle?: string;
};

export const DEFAULT_ADMIN_LOGIN_BRANDING: AdminLoginBrandingConfig = Object.freeze({
  logoUrl: '/assets/images/logo.png',
  logoText: 'Q',
  showLogoText: true,
  width: 48,
  height: 48,
  platformTitle: 'Quasar Admin Platform',
});

export const DEFAULT_ADMIN_SIDEBAR_BRANDING: AdminSidebarBrandingConfig = Object.freeze({
  logoUrl: '/assets/images/logo.png',
  logoText: 'Q',
  brandName: 'Quasar',
  subtitle: 'Admin Dashboard',
  showLogoText: true,
  width: 36,
  height: 36,
});
