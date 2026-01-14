export const getPublicSiteName = (): string => {
  return process.env.NEXT_PUBLIC_SITE_NAME || 'Storefront';
};
