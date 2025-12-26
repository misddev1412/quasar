export const ADMIN_LOGIN_BRANDING_KEY = 'admin.branding.login';
export const ADMIN_SIDEBAR_BRANDING_KEY = 'admin.branding.sidebar';

export type AdminLoginBrandingConfig = {
  logoUrl?: string;
  logoText?: string;
  showLogoText?: boolean;
  width?: number;
  height?: number;
  platformTitle?: string;
  backgroundImageUrl?: string;
  faviconUrl?: string;
};

export type AdminSidebarBrandingConfig = AdminLoginBrandingConfig & {
  brandName?: string;
  subtitle?: string;
};

export const DEFAULT_ADMIN_LOGIN_BRANDING: AdminLoginBrandingConfig = Object.freeze({
  logoUrl: undefined,
  logoText: 'Q',
  showLogoText: true,
  width: 48,
  height: 48,
  platformTitle: 'Quasar Admin Platform',
  backgroundImageUrl: undefined,
  faviconUrl: '/favicon.ico',
});

export const DEFAULT_ADMIN_SIDEBAR_BRANDING: AdminSidebarBrandingConfig = Object.freeze({
  logoUrl: undefined,
  logoText: 'Q',
  brandName: 'Quasar',
  subtitle: 'Admin Dashboard',
  showLogoText: true,
  width: 36,
  height: 36,
  faviconUrl: '/favicon.ico',
});
