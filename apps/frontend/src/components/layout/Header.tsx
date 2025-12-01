'use client';

import React, { useEffect, useMemo, useRef, useState } from 'react';
import clsx from 'clsx';
import { createPortal } from 'react-dom';
import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';
import { useLocalePath } from '../../lib/routing';
import {
  Navbar,
  NavbarBrand,
  NavbarContent,
  NavbarItem,
  NavbarMenuToggle,
  NavbarMenu,
  Button,
  Dropdown,
  DropdownTrigger,
  DropdownMenu,
  DropdownItem,
  Avatar,
  Badge,
} from '@heroui/react';
import { useAuth } from '../../contexts/AuthContext';
import { useTranslations } from 'next-intl';
import SearchInput from '../common/SearchInput';
import Input from '../common/Input';
import ThemeToggle from '../common/ThemeToggle';
import LanguageSwitcher from '../common/LanguageSwitcher';
import NotificationDropdown from '../notifications/NotificationDropdown';
import { useSettings } from '../../hooks/useSettings';
import { CartIcon, CartDropdownIcon, ShoppingCart, useCart } from '../ecommerce/CartProvider';
import Container from '../common/Container';
import { useMenu } from '../../hooks/useMenu';
import { CategoryService } from '../../services/category.service';
import MenuNavigation, { NavigationItem, NavigationItemRenderer } from '../menu/MenuNavigation';
import MegaMenu, { MegaMenuSection } from '../menu/MegaMenu';
import TopMenuBar from './TopMenuBar';
import SubMenuBar from './SubMenuBar';
import { MenuType } from '@shared/enums/menu.enums';

// Icons as components for better maintainability
const Icons = {
  Bell: () => (
    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
      />
    </svg>
  ),
  Heart: () => (
    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
      />
    </svg>
  ),
  Cart: () => (
    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z"
      />
    </svg>
  ),
  User: () => (
    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
      />
    </svg>
  ),
  UserCircle: () => (
    <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M5.121 17.804A13.937 13.937 0 0112 16c2.5 0 4.847.655 6.879 1.804M15 10a3 3 0 11-6 0 3 3 0 016 0zm6 2a9 9 0 11-18 0 9 9 0 0118 0z"
      />
    </svg>
  ),
  // User menu icons
  Account: () => (
    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
      />
    </svg>
  ),
  Profile: () => (
    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 001.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
      />
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
      />
    </svg>
  ),
  Orders: () => (
    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"
      />
    </svg>
  ),
  Wishlist: () => (
    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
      />
    </svg>
  ),
  Notifications: () => (
    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
      />
    </svg>
  ),
  Settings: () => (
    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 001.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
      />
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
      />
    </svg>
  ),
  Logout: () => (
    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
      />
    </svg>
  ),
  Search: () => (
    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
      />
    </svg>
  ),
  Close: () => (
    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
    </svg>
  ),
};

// Navigation configuration - will be used with t() function

// User menu items configuration - will be used with t() function

// Logo Component
const Logo: React.FC<{ currentLocale: string }> = ({ currentLocale }) => {
  const t = useTranslations();
  const { getSiteLogo, getSetting, getSettingAsBoolean } = useSettings();
  const siteLogo = getSiteLogo();
  const siteName = getSetting('site.name');
  const showText = getSettingAsBoolean('site.logo_show_text', true); // Default to true for backward compatibility
  const logoText = getSetting('site.logo_text');
  const displayText = logoText || siteName;
  const logoAltText = getSetting('site.logo_alt') || siteName;

  return (
    <Link href="/" className="flex items-center gap-2 group">
      {siteLogo ? (
        <img
          src={siteLogo}
          alt={logoAltText}
          className="w-9 h-9 object-contain"
          onError={(e) => {
            // Fallback to default logo if image fails to load
            e.currentTarget.style.display = 'none';
            e.currentTarget.parentElement
              ?.querySelector('.default-logo')
              ?.classList.remove('hidden');
          }}
        />
      ) : null}
      <div
        className={`w-9 h-9 bg-gradient-to-br from-blue-500 to-blue-600 dark:from-blue-600 dark:to-blue-700 rounded-xl flex items-center justify-center shadow-md group-hover:shadow-lg transition-shadow ${
          siteLogo ? 'hidden default-logo' : ''
        }`}
      >
        <span className="text-white font-bold text-lg">Q</span>
      </div>
      {showText && (
        <p className="font-bold text-xl bg-gradient-to-r from-gray-800 to-gray-600 dark:from-gray-100 dark:to-gray-300 bg-clip-text text-transparent m-0">
          {displayText}
        </p>
      )}
    </Link>
  );
};

// Icon Button with Badge Component
const IconButtonWithBadge: React.FC<{
  icon: React.ReactNode;
  badge?: string | number;
  badgeColor?: 'primary' | 'secondary' | 'danger' | 'success' | 'warning';
  label: string;
  onClick: () => void;
}> = ({ icon, badge, badgeColor = 'primary', label, onClick }) => {
  const getBadgeClasses = (color: string) => {
    const colorClasses: Record<string, string> = {
      primary: 'bg-blue-500 text-white border-2 border-white dark:border-gray-900',
      secondary: 'bg-purple-500 text-white border-2 border-white dark:border-gray-900',
      danger: 'bg-red-500 text-white border-2 border-white dark:border-gray-900',
      success: 'bg-green-500 text-white border-2 border-white dark:border-gray-900',
      warning: 'bg-yellow-500 text-white border-2 border-white dark:border-gray-900',
    };
    return colorClasses[color] || colorClasses.primary;
  };

  if (badge) {
    return (
      <div className="relative inline-flex">
        <Button
          isIconOnly
          variant="light"
          aria-label={label}
          onPress={onClick}
          className="hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors text-gray-700 dark:text-gray-300"
        >
          {icon}
        </Button>
        <span
          className={`
          absolute -top-1 -right-1
          min-w-[20px] h-[20px]
          rounded-full
          flex items-center justify-center
          text-[11px] font-semibold
          px-1
          ${getBadgeClasses(badgeColor || 'primary')}
          shadow-sm
        `}
        >
          {badge}
        </span>
      </div>
    );
  }

  return (
    <Button
      isIconOnly
      variant="light"
      aria-label={label}
      onPress={onClick}
      className="hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors text-gray-700 dark:text-gray-300"
    >
      {icon}
    </Button>
  );
};

// Helper function to convert menu items to navigation items
const convertToNavigationItems = (items: any[]): NavigationItem[] => {
  return items.map(item => ({
    id: item.id,
    type: item.type,
    name: item.name,
    href: item.href,
    target: item.target,
    icon: item.icon,
    description: item.description,
    isMegaMenu: item.isMegaMenu,
    megaMenuColumns: item.megaMenuColumns,
    image: item.image,
    badge: item.badge,
    featured: item.featured,
    config: item.config,
    borderColor: item.borderColor,
    borderWidth: item.borderWidth,
    children: item.children ? convertToNavigationItems(item.children) : [],
  }));
};

// User Menu Component
const UserMenu: React.FC<{
  user: any;
  router: any;
  currentLocale: string;
  onLogout: () => void;
}> = ({ user, router, currentLocale, onLogout }) => {
  const t = useTranslations();

  const userMenuItems = [
    {
      key: 'account',
      label: t('layout.header.user.account'),
      href: '/profile',
      icon: <Icons.Account />,
    },
    {
      key: 'edit-profile',
      label: t('layout.header.user.profile'),
      href: '/profile',
      icon: <Icons.Profile />,
    },
    {
      key: 'orders',
      label: t('layout.header.user.orders'),
      href: '/orders',
      icon: <Icons.Orders />,
    },
    {
      key: 'wishlist',
      label: t('layout.header.user.wishlist'),
      href: '/wishlist',
      mobileOnly: true,
      icon: <Icons.Wishlist />,
    },
    {
      key: 'notifications',
      label: t('layout.header.user.notifications'),
      href: '/notifications',
      mobileOnly: true,
      icon: <Icons.Notifications />,
    },
    {
      key: 'settings',
      label: t('layout.header.user.settings'),
      href: '/settings',
      icon: <Icons.Settings />,
    },
    {
      key: 'logout',
      label: t('layout.header.user.logout'),
      action: 'logout',
      danger: true,
      icon: <Icons.Logout />,
    },
  ];

  return (
    <Dropdown placement="bottom-end">
      <DropdownTrigger>
        <Avatar
          as="button"
          className="transition-transform hover:scale-105 cursor-pointer"
          size="sm"
          src={user?.avatar}
          name={user?.name || user?.email}
          showFallback
          fallback={<Icons.User />}
        />
      </DropdownTrigger>
      <DropdownMenu aria-label="User menu actions" variant="flat">
        <DropdownItem
          key="profile-header"
          className="h-16 gap-2 py-3"
          textValue="Profile"
          isReadOnly
        >
          <div className="flex flex-col gap-0.5">
            <p className="font-medium text-xs text-gray-500">
              {t('layout.header.user.signedInAs')}
            </p>
            <p className="font-semibold text-sm truncate">{user?.name || user?.email}</p>
            <p className="text-xs text-gray-400 truncate">{user?.email}</p>
          </div>
        </DropdownItem>

        <DropdownItem key="divider" className="h-1 py-0 my-1" isReadOnly>
          <div className="border-t border-gray-200 dark:border-gray-700"></div>
        </DropdownItem>

        <>
          {userMenuItems
            .filter((item) => !item.mobileOnly)
            .map((item) => (
              <DropdownItem
                key={item.key}
                color={item.danger ? 'danger' : 'default'}
                className="min-h-[40px] py-3"
                startContent={item.icon}
                onPress={() => {
                  if (item.action === 'logout') {
                    onLogout();
                  } else if (item.href) {
                    router.push(item.href);
                  }
                }}
              >
                {item.label}
              </DropdownItem>
            ))}
        </>
      </DropdownMenu>
    </Dropdown>
  );
};

// Main Header Component
const Header: React.FC = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isAdvancedOpen, setIsAdvancedOpen] = useState(false);
  const [categoryFilter, setCategoryFilter] = useState('');
  const [categorySearch, setCategorySearch] = useState('');
  const [isCategoryDropdownOpen, setIsCategoryDropdownOpen] = useState(false);
  const [minPriceFilter, setMinPriceFilter] = useState('');
  const [maxPriceFilter, setMaxPriceFilter] = useState('');
  const [mounted, setMounted] = useState(false);
  const [isStickyVisible, setIsStickyVisible] = useState(false);
  const { user, isAuthenticated, logout } = useAuth();
  const { summary, openCart } = useCart(); // Add cart hook
  const { navigationItems } = useMenu('main');
  const t = useTranslations();
  const tCart = useTranslations('ecommerce.cart');
  const router = useRouter();
  const pathname = usePathname();
  const { currentLocale } = useLocalePath();
  const searchInputRef = useRef<HTMLInputElement>(null);
  const advancedSectionId = 'header-advanced-search-panel';

  const [categories, setCategories] = useState<Array<{ id: string; name: string; translations?: Array<{ locale: string; name?: string }> }>>([]);
  const [isLoadingCategories, setIsLoadingCategories] = useState(false);

  useEffect(() => {
    let isMounted = true;
    setIsLoadingCategories(true);

    CategoryService.getCategories()
      .then((fetched) => {
        if (!isMounted) return;
        const categoryList = Array.isArray(fetched) ? fetched : [];
        setCategories(
          categoryList.map((category) => ({
            id: String(category.id),
            name: category.name,
            translations: category.translations?.map((translation) => ({
              locale: translation.locale,
              name: translation.name,
            })),
          }))
        );
      })
      .catch(() => {
        if (!isMounted) return;
        setCategories([]);
      })
      .finally(() => {
        if (!isMounted) return;
        setIsLoadingCategories(false);
      });

    return () => {
      isMounted = false;
    };
  }, []);

  const normalizedCategories = useMemo(() => {
    const seen = new Set<string>();

    return categories
      .map((category) => {
        const translation = category.translations?.find((entry) => entry.locale === currentLocale);
        const fallbackTranslation = category.translations?.find((entry) => entry.name);
        const name = translation?.name || fallbackTranslation?.name || category.name || category.id;

        return {
          id: category.id,
          name,
        };
      })
      .filter((category) => {
        if (!category.id || !category.name) {
          return false;
        }

        if (seen.has(category.id)) {
          return false;
        }

        seen.add(category.id);
        return true;
      });
  }, [categories, currentLocale]);

  const filteredCategories = useMemo(() => {
    if (!categorySearch) {
      return normalizedCategories;
    }

    const normalizedSearch = categorySearch.toLowerCase();
    return normalizedCategories.filter((category) =>
      category.name.toLowerCase().includes(normalizedSearch)
    );
  }, [normalizedCategories, categorySearch]);

  const navigationItemsConverted = convertToNavigationItems(navigationItems);

  const cartLabel =
    summary.totalItems > 0
      ? tCart('aria_labels.cart_button', { count: summary.totalItems })
      : tCart('aria_labels.cart_button_empty');

  const handleLogout = () => {
    logout();
    router.push('/');
  };


  const navigationRenderers: Partial<Record<MenuType, NavigationItemRenderer>> = {
    [MenuType.SEARCH_BUTTON]: ({ context, closeMobileMenu }) =>
      context === 'desktop' ? (
        <Button
          isIconOnly
          variant="light"
          aria-label={t('layout.header.search.open')}
          className="hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
          onPress={() => setIsSearchOpen(true)}
        >
          <Icons.Search />
        </Button>
      ) : (
        <button
          className="w-full text-base text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 flex items-center gap-3 py-2 transition-colors rounded-lg px-2 hover:bg-gray-50 dark:hover:bg-gray-800"
          onClick={() => {
            setIsSearchOpen(true);
            closeMobileMenu?.();
          }}
        >
          <span className="text-gray-500 dark:text-gray-400">
            <Icons.Search />
          </span>
          <span>{t('layout.header.search.open')}</span>
        </button>
      ),
    [MenuType.LOCALE_SWITCHER]: ({ context }) => (
      <div className={context === 'desktop' ? 'flex items-center' : 'w-full px-2'}>
        <LanguageSwitcher />
      </div>
    ),
    [MenuType.THEME_TOGGLE]: ({ context }) => (
      <div
        className={
          context === 'desktop'
            ? 'flex items-center'
            : 'flex items-center justify-between gap-3 px-2 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 w-full'
        }
      >
        {context === 'mobile' && <span>Theme</span>}
        <ThemeToggle />
      </div>
    ),
    [MenuType.CART_BUTTON]: ({ context, closeMobileMenu }) =>
      context === 'desktop' ? (
        <CartDropdownIcon className="text-gray-700 dark:text-gray-300" />
      ) : (
        <button
          className="w-full text-base text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 flex items-center gap-3 py-2 transition-colors rounded-lg px-2 hover:bg-gray-50 dark:hover:bg-gray-800"
          onClick={() => {
            openCart();
            closeMobileMenu?.();
          }}
          aria-label={cartLabel}
        >
          <span className="text-gray-500 dark:text-gray-400">
            <Icons.Cart />
          </span>
          <span>{cartLabel}</span>
        </button>
      ),
    [MenuType.USER_PROFILE]: ({ context, closeMobileMenu }) => {
      if (isAuthenticated) {
        if (context === 'desktop') {
          return (
            <UserMenu
              user={user}
              router={router}
              currentLocale={currentLocale}
              onLogout={handleLogout}
            />
          );
        }

        return (
          <div className="flex flex-col gap-2 w-full">
            <button
              className="w-full text-base text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 flex items-center gap-3 py-2 transition-colors rounded-lg px-2 hover:bg-gray-50 dark:hover:bg-gray-800"
              onClick={() => {
                router.push('/profile');
                closeMobileMenu?.();
              }}
            >
              <Icons.User />
              <span>{t('layout.header.user.account')}</span>
            </button>
            <button
              className="w-full text-base text-red-600 hover:text-red-700 flex items-center gap-3 py-2 transition-colors rounded-lg px-2 hover:bg-red-50"
              onClick={() => {
                handleLogout();
                closeMobileMenu?.();
              }}
            >
              <Icons.Logout />
              <span>{t('layout.header.user.logout')}</span>
            </button>
          </div>
        );
      }

      if (context === 'desktop') {
        return (
          <Dropdown placement="bottom-end">
            <DropdownTrigger>
              <Button
                isIconOnly
                variant="light"
                aria-label="User menu"
                className="hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
              >
                <Icons.UserCircle />
              </Button>
            </DropdownTrigger>
            <DropdownMenu aria-label="User menu actions" variant="flat">
              <DropdownItem
                key="signin"
                onPress={() => router.push('/login')}
                className="min-h-[40px]"
              >
                {t('layout.header.guest.signin')}
              </DropdownItem>
              <DropdownItem
                key="signup"
                color="primary"
                onPress={() => router.push('/register')}
                className="min-h-[40px]"
              >
                {t('layout.header.guest.signup')}
              </DropdownItem>
            </DropdownMenu>
          </Dropdown>
        );
      }

      return (
        <div className="flex flex-col gap-2 w-full px-2">
          <button
            className="w-full rounded-lg border border-blue-500 text-blue-600 py-2 font-medium hover:bg-blue-50"
            onClick={() => {
              router.push('/login');
              closeMobileMenu?.();
            }}
          >
            {t('layout.header.guest.signin')}
          </button>
          <button
            className="w-full rounded-lg bg-blue-600 text-white py-2 font-medium hover:bg-blue-700"
            onClick={() => {
              router.push('/register');
              closeMobileMenu?.();
            }}
          >
            {t('layout.header.guest.signup')}
          </button>
        </div>
      );
    },
  };

  const executeSearch = () => {
    const trimmedQuery = searchQuery.trim();
    const hasAdvancedFilters = [categoryFilter, minPriceFilter, maxPriceFilter].some((value) =>
      value.trim()
    );

    if (!trimmedQuery && !hasAdvancedFilters) {
      return;
    }

    const params = new URLSearchParams();
    if (trimmedQuery) {
      params.set('q', trimmedQuery);
    }
    if (categoryFilter.trim()) {
      params.set('category', categoryFilter.trim());
    }
    if (minPriceFilter.trim()) {
      params.set('minPrice', minPriceFilter.trim());
    }
    if (maxPriceFilter.trim()) {
      params.set('maxPrice', maxPriceFilter.trim());
    }

    const queryString = params.toString();
    if (queryString) {
      router.push(`/search?${queryString}`);
      setSearchQuery('');
      setIsSearchOpen(false);
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    executeSearch();
  };

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (typeof window === 'undefined') {
      return;
    }

    const handleScroll = () => {
      setIsStickyVisible(window.scrollY > 220);
    };

    handleScroll();
    window.addEventListener('scroll', handleScroll, { passive: true });

    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  useEffect(() => {
    if (!isSearchOpen) {
      return;
    }

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setIsSearchOpen(false);
      }
    };

    document.addEventListener('keydown', handleKeyDown);

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isSearchOpen]);

  useEffect(() => {
    if (isSearchOpen) {
      searchInputRef.current?.focus();
    }
  }, [isSearchOpen]);

  useEffect(() => {
    if (!isSearchOpen) {
      setIsAdvancedOpen(false);
    }
  }, [isSearchOpen]);

  useEffect(() => {
    if (!isSearchOpen || typeof document === 'undefined') {
      return;
    }

    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    return () => {
      document.body.style.overflow = originalOverflow;
    };
  }, [isSearchOpen]);

  useEffect(() => {
    if (!categoryFilter) {
      if (!categorySearch) {
        return;
      }

      const matched = normalizedCategories.find((category) => category.name === categorySearch);
      if (!matched) {
        return;
      }
    }

    const selected = normalizedCategories.find((category) => category.id === categoryFilter);
    if (selected) {
      setCategorySearch(selected.name);
    } else if (!categoryFilter) {
      setCategorySearch('');
    }
  }, [categoryFilter, normalizedCategories]);

  useEffect(() => {
    if (!isAdvancedOpen) {
      setIsCategoryDropdownOpen(false);
    }
  }, [isAdvancedOpen]);

  const renderHeaderSection = (variant: 'default' | 'sticky') => {
    const headerClassName = clsx(
      'bg-white dark:bg-gray-950/95 backdrop-blur-md border-b border-gray-200 dark:border-gray-800 shadow-sm',
      variant === 'sticky'
        ? [
            'hidden lg:block fixed top-0 left-0 right-0 z-[65] w-full transition-all duration-300 ease-out',
            isStickyVisible
              ? 'translate-y-0 opacity-100 pointer-events-auto'
              : '-translate-y-full opacity-0 pointer-events-none',
          ]
        : 'relative z-40',
    );

    return (
      <header className={headerClassName}>
        <Container className="py-0">
          <Navbar
            onMenuOpenChange={setIsMenuOpen}
            isMenuOpen={isMenuOpen}
            className="bg-transparent shadow-none border-none px-0"
            maxWidth="full"
            position="static"
            classNames={{
              wrapper: 'w-full px-0',
            }}
            height="4rem"
          >
            {/* Left Section: Menu Toggle + Logo */}
            <NavbarContent justify="start">
              <NavbarMenuToggle
                aria-label={
                  isMenuOpen ? t('layout.header.menu.close') : t('layout.header.menu.open')
                }
                className="sm:hidden text-gray-600 dark:text-gray-400"
              />
              <NavbarBrand>
                <Logo currentLocale={currentLocale} />
              </NavbarBrand>
            </NavbarContent>

            {/* Center Section: Desktop Navigation */}
            <NavbarContent className="hidden lg:flex gap-2 header-nav" justify="center">
              <MenuNavigation items={navigationItemsConverted} renderers={navigationRenderers} />
            </NavbarContent>

            {/* Right Section: Actions */}
            <NavbarContent justify="end" className="gap-2">
              {/* Action Buttons */}
              {isAuthenticated && (
                <>
                  <NavbarItem>
                    <NotificationDropdown />
                  </NavbarItem>
                  <NavbarItem className="hidden sm:flex">
                    <IconButtonWithBadge
                      icon={<Icons.Heart />}
                      badge="5"
                      badgeColor="secondary"
                      label={t('layout.header.actions.wishlist')}
                      onClick={() => router.push('/wishlist')}
                    />
                  </NavbarItem>
                </>
              )}

              {/* Cart, profile, search, locale, and theme actions are only rendered when configured in the storefront menu */}
            </NavbarContent>

            {/* Mobile Menu */}
            <NavbarMenu className="px-0 pt-0 bg-white/95 dark:bg-gray-950/95 backdrop-blur-md">
              {/* Mobile Search */}
              <div className="px-4 pt-6 pb-4">
                <SearchInput
                  value={searchQuery}
                  onChange={setSearchQuery}
                  onSubmit={(e) => {
                    handleSearch(e);
                    setIsMenuOpen(false);
                  }}
                  size="lg"
                  placeholder={t('layout.header.search.placeholder')}
                  fullWidth
                />
              </div>

              {/* Navigation Items */}
              <MenuNavigation
                items={navigationItemsConverted}
                isMobileMenuOpen={isMenuOpen}
                onMobileMenuClose={() => setIsMenuOpen(false)}
                renderers={navigationRenderers}
              />

              {/* Cart, profile, search, locale, and theme entries are managed entirely via storefront navigation */}
            </NavbarMenu>

            {/* Shopping Cart Modal - disabled since we're using dropdown */}
            {/* <ShoppingCart /> */}
          </Navbar>

          {variant === 'default' && mounted && isSearchOpen
            ? createPortal(
                <div
                  className="hidden lg:flex fixed inset-0 z-[70] items-center justify-center px-4 py-16"
                  onClick={() => setIsSearchOpen(false)}
                >
                  <div className="absolute inset-0 bg-black/60 backdrop-blur-md" />
                  <div
                    className="relative w-full max-w-3xl rounded-3xl border border-gray-200 dark:border-gray-800 bg-white/95 dark:bg-gray-950/95 shadow-2xl"
                    onClick={(event) => event.stopPropagation()}
                  >
                    <Button
                      isIconOnly
                      type="button"
                      variant="light"
                      aria-label={t('layout.header.search.close')}
                      className="absolute top-4 right-4 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800"
                      onPress={() => setIsSearchOpen(false)}
                    >
                      <Icons.Close />
                    </Button>

                    <form
                      className="space-y-6 sm:space-y-8 p-6 sm:p-10 pt-14 sm:pt-16"
                      onSubmit={handleSearch}
                    >
                      <div className="space-y-2">
                        <h2 className="text-2xl sm:text-3xl font-semibold text-gray-900 dark:text-gray-100">
                          {t('layout.header.search.title')}
                        </h2>
                        <p className="text-sm sm:text-base text-gray-500 dark:text-gray-400">
                          {t('layout.header.search.subtitle')}
                        </p>
                      </div>

                      <Input
                        ref={searchInputRef}
                        type="search"
                        value={searchQuery}
                        onValueChange={setSearchQuery}
                        placeholder={t('layout.header.search.placeholder')}
                        size="lg"
                        variant="bordered"
                        radius="lg"
                        icon={
                          <span className="text-gray-400 dark:text-gray-500">
                            <Icons.Search />
                          </span>
                        }
                        classNames={{
                          inputWrapper:
                            'h-14 sm:h-16 px-4 border-2 border-transparent hover:border-gray-200 dark:hover:border-gray-700 bg-white/95 dark:bg-gray-950/70 shadow-sm focus-within:border-blue-500 focus-within:shadow-md transition-all',
                          input: 'text-base sm:text-lg text-gray-900 dark:text-gray-100',
                        }}
                      />

                      <div className="flex flex-wrap items-center justify-between gap-3">
                        <Button
                          size="sm"
                          variant="light"
                          type="button"
                          aria-expanded={isAdvancedOpen}
                          aria-controls={advancedSectionId}
                          onPress={() => setIsAdvancedOpen((prev) => !prev)}
                          className="self-start"
                        >
                          {isAdvancedOpen
                            ? t('layout.header.search.hide_advanced')
                            : t('layout.header.search.show_advanced')}
                        </Button>
                        <Button color="primary" type="submit">
                          {t('layout.header.search.submit')}
                        </Button>
                      </div>

                      {isAdvancedOpen && (
                        <div
                          id={advancedSectionId}
                          className="space-y-5 rounded-2xl border border-gray-200 dark:border-gray-800 bg-white/90 dark:bg-gray-900/85 p-6 shadow-inner"
                        >
                          <div className="flex flex-wrap items-start justify-between gap-3">
                            <div className="space-y-1">
                              <h3 className="text-base font-medium text-gray-900 dark:text-gray-100">
                                {t('layout.header.search.filters.heading')}
                              </h3>
                              <p className="text-sm text-gray-500 dark:text-gray-400">
                                {t('layout.header.search.filters.description')}
                              </p>
                            </div>
                            <Button
                              variant="light"
                              size="sm"
                              type="button"
                              onPress={() => {
                                setCategoryFilter('');
                                setMinPriceFilter('');
                                setMaxPriceFilter('');
                                setCategorySearch('');
                                setIsCategoryDropdownOpen(false);
                              }}
                            >
                              {t('layout.header.search.filters.reset')}
                            </Button>
                          </div>

                          <div className="grid gap-4 sm:grid-cols-3">
                            <div className="sm:col-span-1 relative">
                              <Input
                                label={t('layout.header.search.filters.category.label')}
                                placeholder={t(
                                  'layout.header.search.filters.category.placeholder',
                                )}
                                value={categorySearch}
                                onValueChange={(value) => {
                                  setCategorySearch(value);
                                  if (!value) {
                                    setCategoryFilter('');
                                  }
                                  setIsCategoryDropdownOpen(true);
                                }}
                                onFocus={() => setIsCategoryDropdownOpen(true)}
                                onBlur={() => {
                                  // delay closing to allow click events on dropdown items
                                  setTimeout(() => setIsCategoryDropdownOpen(false), 150);
                                }}
                                variant="bordered"
                                radius="lg"
                                size="md"
                                classNames={{
                                  label: 'text-sm font-medium text-gray-600 dark:text-gray-300',
                                  inputWrapper:
                                    'h-12 border-2 border-transparent hover:border-gray-200 dark:hover:border-gray-700 bg-white/95 dark:bg-gray-950/60 shadow-sm focus-within:border-blue-500 focus-within:shadow-md transition-all',
                                  input: 'text-sm text-gray-900 dark:text-gray-100',
                                }}
                                fullWidth
                              />
                              {isCategoryDropdownOpen && (
                                <div className="absolute z-40 mt-2 max-h-56 w-full overflow-y-auto rounded-xl border border-gray-200 bg-white/95 shadow-xl dark:border-gray-800 dark:bg-gray-950">
                                  {isLoadingCategories ? (
                                    <div className="p-4 text-sm text-gray-500 dark:text-gray-400">
                                      {t('layout.header.search.filters.loading')}
                                    </div>
                                  ) : normalizedCategories.length === 0 ? (
                                    <div className="p-4 text-sm text-gray-500 dark:text-gray-400">
                                      {t('layout.header.search.filters.empty')}
                                    </div>
                                  ) : filteredCategories.length === 0 ? (
                                    <div className="p-4 text-sm text-gray-500 dark:text-gray-400">
                                      {t('layout.header.search.filters.no_results')}
                                    </div>
                                  ) : (
                                    filteredCategories.map((category) => {
                                      const isSelected = category.id === categoryFilter;
                                      return (
                                        <button
                                          key={category.id}
                                          type="button"
                                          className={`w-full px-4 py-2 text-left text-sm transition-colors ${
                                            isSelected
                                              ? 'bg-blue-500/10 text-blue-600 dark:text-blue-300'
                                              : 'hover:bg-gray-100 dark:hover:bg-gray-800'
                                          }`}
                                          onMouseDown={() => {
                                            setCategoryFilter(category.id);
                                            setCategorySearch(category.name);
                                            setIsCategoryDropdownOpen(false);
                                          }}
                                        >
                                          {category.name}
                                        </button>
                                      );
                                    })
                                  )}
                                </div>
                              )}
                            </div>
                            <Input
                              label={t('layout.header.search.filters.min_price.label')}
                              placeholder={t('layout.header.search.filters.min_price.placeholder')}
                              type="number"
                              value={minPriceFilter}
                              onChange={(event) => setMinPriceFilter(event.target.value)}
                              variant="bordered"
                              radius="lg"
                              size="md"
                              inputMode="numeric"
                              fullWidth
                              classNames={{
                                label: 'text-sm font-medium text-gray-600 dark:text-gray-300',
                                inputWrapper:
                                  'h-12 border-2 border-transparent hover:border-gray-200 dark:hover:border-gray-700 bg-white/95 dark:bg-gray-950/60 shadow-sm focus-within:border-blue-500 focus-within:shadow-md transition-all',
                                input: 'text-sm text-gray-900 dark:text-gray-100',
                              }}
                            />
                            <Input
                              label={t('layout.header.search.filters.max_price.label')}
                              placeholder={t('layout.header.search.filters.max_price.placeholder')}
                              type="number"
                              value={maxPriceFilter}
                              onChange={(event) => setMaxPriceFilter(event.target.value)}
                              variant="bordered"
                              radius="lg"
                              size="md"
                              inputMode="numeric"
                              fullWidth
                              classNames={{
                                label: 'text-sm font-medium text-gray-600 dark:text-gray-300',
                                inputWrapper:
                                  'h-12 border-2 border-transparent hover:border-gray-200 dark:hover:border-gray-700 bg-white/95 dark:bg-gray-950/60 shadow-sm focus-within:border-blue-500 focus-within:shadow-md transition-all',
                                input: 'text-sm text-gray-900 dark:text-gray-100',
                              }}
                            />
                          </div>

                          <div className="flex justify-end">
                            <Button color="primary" type="submit">
                              {t('layout.header.search.filters.apply')}
                            </Button>
                          </div>
                        </div>
                      )}
                    </form>
                  </div>
                </div>,
                document.body,
              )
            : null}
        </Container>
      </header>
    );
  };

  return (
    <>
      <TopMenuBar />
      {renderHeaderSection('default')}
      <SubMenuBar />
      {renderHeaderSection('sticky')}
    </>
  );
};

export { Header };
export default Header;
