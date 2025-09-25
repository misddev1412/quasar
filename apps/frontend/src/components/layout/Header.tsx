'use client';

import React, { useState } from 'react';
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
  NavbarMenuItem,
  Button,
  Dropdown,
  DropdownTrigger,
  DropdownMenu,
  DropdownItem,
  Avatar,
  Badge,
  Divider,
} from '@heroui/react';
import { useAuth } from '../../contexts/AuthContext';
import { useTranslations, useLocale } from 'next-intl';
import SearchInput from '../common/SearchInput';
import ThemeToggle from '../common/ThemeToggle';
import LanguageSwitcher from '../common/LanguageSwitcher';
import NotificationDropdown from '../notifications/NotificationDropdown';

// Icons as components for better maintainability
const Icons = {
  Bell: () => (
    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
        d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
    </svg>
  ),
  Heart: () => (
    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
        d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
    </svg>
  ),
  Cart: () => (
    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
        d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
    </svg>
  ),
  User: () => (
    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
        d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
    </svg>
  ),
  UserCircle: () => (
    <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
        d="M5.121 17.804A13.937 13.937 0 0112 16c2.5 0 4.847.655 6.879 1.804M15 10a3 3 0 11-6 0 3 3 0 016 0zm6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  ),
  // User menu icons
  Account: () => (
    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
        d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
    </svg>
  ),
  Profile: () => (
    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
        d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 001.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
        d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
    </svg>
  ),
  Orders: () => (
    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
        d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
    </svg>
  ),
  Wishlist: () => (
    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
        d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
    </svg>
  ),
  Notifications: () => (
    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
        d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
    </svg>
  ),
  Settings: () => (
    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
        d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 001.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
        d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
    </svg>
  ),
  Logout: () => (
    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
        d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
    </svg>
  ),
};

// Navigation configuration - will be used with t() function

// User menu items configuration - will be used with t() function

// Logo Component
const Logo: React.FC<{ currentLocale: string }> = ({ currentLocale }) => {
  const t = useTranslations();

  return (
    <Link href="/" className="flex items-center gap-2 group">
      <div className="w-9 h-9 bg-gradient-to-br from-blue-500 to-blue-600 dark:from-blue-600 dark:to-blue-700 rounded-xl flex items-center justify-center shadow-md group-hover:shadow-lg transition-shadow">
        <span className="text-white font-bold text-lg">Q</span>
      </div>
      <p className="font-bold text-xl bg-gradient-to-r from-gray-800 to-gray-600 dark:from-gray-100 dark:to-gray-300 bg-clip-text text-transparent m-0">
        {t('layout.header.brand')}
      </p>
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
      primary: "bg-blue-500 text-white border-2 border-white dark:border-gray-900",
      secondary: "bg-purple-500 text-white border-2 border-white dark:border-gray-900",
      danger: "bg-red-500 text-white border-2 border-white dark:border-gray-900",
      success: "bg-green-500 text-white border-2 border-white dark:border-gray-900",
      warning: "bg-yellow-500 text-white border-2 border-white dark:border-gray-900"
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
        <span className={`
          absolute -top-1 -right-1
          min-w-[20px] h-[20px]
          rounded-full
          flex items-center justify-center
          text-[11px] font-semibold
          px-1
          ${getBadgeClasses(badgeColor || 'primary')}
          shadow-sm
        `}>
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

// Desktop Navigation Component
const DesktopNavigation: React.FC<{
  pathname: string;
  currentLocale: string;
}> = ({ pathname, currentLocale }) => {
  const t = useTranslations();

  const navigationItems = [
    { name: t('layout.header.nav.home'), href: '/' },
    { name: t('layout.header.nav.products'), href: '/products' },
    { name: t('layout.header.nav.categories'), href: '/categories' },
    { name: t('layout.header.nav.deals'), href: '/deals' },
    { name: t('layout.header.nav.about'), href: '/about' },
    { name: t('layout.header.nav.contact'), href: '/contact' },
  ];

  return (
    <NavbarContent className="hidden sm:flex gap-6" justify="center">
      {navigationItems.map((item) => {
        const isActive = pathname === item.href;
        return (
          <NavbarItem key={item.href} isActive={isActive}>
            <Link
              href={item.href}
              className={`
                text-sm font-medium transition-all duration-200 relative py-2
                ${isActive
                  ? 'text-blue-600 dark:text-blue-400'
                  : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'
                }
                after:content-[''] after:absolute after:bottom-0 after:left-0
                after:h-0.5 after:bg-blue-600 dark:after:bg-blue-400 after:transition-all after:duration-200
                ${isActive ? 'after:w-full' : 'after:w-0 hover:after:w-full'}
              `}
            >
              {item.name}
            </Link>
          </NavbarItem>
        );
      })}
    </NavbarContent>
  );
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
      href: '/account',
      icon: <Icons.Account />
    },
    {
      key: 'edit-profile',
      label: t('layout.header.user.profile'),
      href: '/profile',
      icon: <Icons.Profile />
    },
    {
      key: 'orders',
      label: t('layout.header.user.orders'),
      href: '/orders',
      icon: <Icons.Orders />
    },
    {
      key: 'wishlist',
      label: t('layout.header.user.wishlist'),
      href: '/wishlist',
      mobileOnly: true,
      icon: <Icons.Wishlist />
    },
    {
      key: 'notifications',
      label: t('layout.header.user.notifications'),
      href: '/notifications',
      mobileOnly: true,
      icon: <Icons.Notifications />
    },
    {
      key: 'settings',
      label: t('layout.header.user.settings'),
      href: '/settings',
      icon: <Icons.Settings />
    },
    {
      key: 'logout',
      label: t('layout.header.user.logout'),
      action: 'logout',
      danger: true,
      icon: <Icons.Logout />
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
            <p className="font-medium text-xs text-gray-500">{t('layout.header.user.signedInAs')}</p>
            <p className="font-semibold text-sm truncate">{user?.name || user?.email}</p>
            <p className="text-xs text-gray-400 truncate">{user?.email}</p>
          </div>
        </DropdownItem>

        <DropdownItem
          key="divider"
          className="h-1 py-0 my-1"
          isReadOnly
        >
          <div className="border-t border-gray-200 dark:border-gray-700"></div>
        </DropdownItem>

        <>
          {userMenuItems
            .filter(item => !item.mobileOnly)
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

// Mobile Menu Items Component
const MobileMenuItems: React.FC<{
  isAuthenticated: boolean;
  router: any;
  currentLocale: string;
  onLogout: () => void;
  onClose: () => void;
}> = ({ isAuthenticated, router, currentLocale, onLogout, onClose }) => {
  const t = useTranslations();

  const userMenuItems = [
    {
      key: 'account',
      label: t('layout.header.user.account'),
      href: '/account',
      icon: <Icons.Account />
    },
    {
      key: 'edit-profile',
      label: t('layout.header.user.profile'),
      href: '/profile',
      icon: <Icons.Profile />
    },
    {
      key: 'orders',
      label: t('layout.header.user.orders'),
      href: '/orders',
      icon: <Icons.Orders />
    },
    {
      key: 'wishlist',
      label: t('layout.header.user.wishlist'),
      href: '/wishlist',
      icon: <Icons.Wishlist />
    },
    {
      key: 'notifications',
      label: t('layout.header.user.notifications'),
      href: '/notifications',
      icon: <Icons.Notifications />
    },
    {
      key: 'settings',
      label: t('layout.header.user.settings'),
      href: '/settings',
      icon: <Icons.Settings />
    },
  ];

  return (
    <>
      {isAuthenticated ? (
        <>
          {userMenuItems.map((item) => (
            <NavbarMenuItem key={item.key}>
              <Link
                href={item.href || '#'}
                className="w-full text-base text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 flex items-center gap-3 py-2 transition-colors"
                onClick={onClose}
              >
                <span className="text-gray-500 dark:text-gray-400">
                  {item.icon}
                </span>
                {item.label}
              </Link>
            </NavbarMenuItem>
          ))}
          <NavbarMenuItem>
            <Button
              color="danger"
              variant="flat"
              className="w-full mt-2 flex items-center gap-3"
              onPress={() => {
                onLogout();
                onClose();
              }}
              startContent={<span className="text-red-500"><Icons.Logout /></span>}
            >
              {t('layout.header.user.logout')}
            </Button>
          </NavbarMenuItem>
        </>
      ) : (
        <>
          <NavbarMenuItem>
            <Button
              variant="flat"
              className="w-full"
              onPress={() => {
                router.push('/login');
                onClose();
              }}
            >
              {t('layout.header.guest.signin')}
            </Button>
          </NavbarMenuItem>
          <NavbarMenuItem>
            <Button
              color="primary"
              className="w-full"
              onPress={() => {
                router.push('/register');
                onClose();
              }}
            >
              {t('layout.header.guest.signup')}
            </Button>
          </NavbarMenuItem>
        </>
      )}
    </>
  );
};

// Main Header Component
const Header: React.FC = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const { user, isAuthenticated, logout } = useAuth();
  const t = useTranslations();
  const locale = useLocale();
  const router = useRouter();
  const pathname = usePathname();
  const { currentLocale, push } = useLocalePath();

  const handleLogout = () => {
    logout();
    router.push('/');
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/search?q=${encodeURIComponent(searchQuery)}`);
      setSearchQuery('');
    }
  };

  return (
    <Navbar
      onMenuOpenChange={setIsMenuOpen}
      isMenuOpen={isMenuOpen}
      className="bg-white/95 dark:bg-gray-950/95 backdrop-blur-md border-b border-gray-200 dark:border-gray-800 shadow-sm"
      maxWidth="xl"
      height="4rem"
      position="sticky"
    >
      {/* Left Section: Menu Toggle + Logo */}
      <NavbarContent justify="start">
        <NavbarMenuToggle
          aria-label={isMenuOpen ? t('layout.header.menu.close') : t('layout.header.menu.open')}
          className="sm:hidden text-gray-600 dark:text-gray-400"
        />
        <NavbarBrand>
          <Logo currentLocale={currentLocale} />
        </NavbarBrand>
      </NavbarContent>

      {/* Center Section: Desktop Navigation */}
      <DesktopNavigation pathname={pathname} currentLocale={currentLocale} />

      {/* Right Section: Actions */}
      <NavbarContent justify="end" className="gap-2">
        {/* Desktop Search */}
        <NavbarItem className="hidden lg:flex flex-1 max-w-lg mr-4">
          <SearchInput
            value={searchQuery}
            onChange={setSearchQuery}
            onSubmit={handleSearch}
            size="sm"
            placeholder={t('layout.header.search.placeholder')}
            fullWidth
          />
        </NavbarItem>

        {/* Language Switcher */}
        <NavbarItem>
          <LanguageSwitcher />
        </NavbarItem>

        {/* Theme Toggle */}
        <NavbarItem>
          <ThemeToggle />
        </NavbarItem>

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

        <NavbarItem>
          <IconButtonWithBadge
            icon={<Icons.Cart />}
            badge="2"
            badgeColor="primary"
            label={t('layout.header.actions.cart')}
            onClick={() => router.push('/cart')}
          />
        </NavbarItem>

        {/* User Section */}
        <NavbarItem>
          {isAuthenticated ? (
            <UserMenu user={user} router={router} currentLocale={currentLocale} onLogout={handleLogout} />
          ) : (
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
          )}
        </NavbarItem>
      </NavbarContent>

      {/* Mobile Menu */}
      <NavbarMenu className="pt-6 bg-white/95 dark:bg-gray-950/95 backdrop-blur-md">
        {/* Mobile Search */}
        <NavbarMenuItem className="mb-4">
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
        </NavbarMenuItem>

        {/* Navigation Items */}
        {[
          { name: t('layout.header.nav.home'), href: '/' },
          { name: t('layout.header.nav.products'), href: '/products' },
          { name: t('layout.header.nav.categories'), href: '/categories' },
          { name: t('layout.header.nav.deals'), href: '/deals' },
          { name: t('layout.header.nav.about'), href: '/about' },
          { name: t('layout.header.nav.contact'), href: '/contact' },
        ].map((item) => {
          const isActive = pathname === item.href;
          return (
            <NavbarMenuItem key={item.href}>
              <Link
                href={item.href}
                className={`
                  w-full text-base flex items-center gap-3 py-2 transition-colors rounded-lg px-2
                  ${isActive
                    ? 'text-blue-600 dark:text-blue-400 font-medium bg-blue-50 dark:bg-blue-900/20'
                    : 'text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-gray-50 dark:hover:bg-gray-800'
                  }
                `}
                onClick={() => setIsMenuOpen(false)}
              >
                {item.name}
              </Link>
            </NavbarMenuItem>
          );
        })}

        {/* Divider */}
        <NavbarMenuItem className="my-3">
          <Divider />
        </NavbarMenuItem>

        {/* User Actions */}
        <MobileMenuItems
          isAuthenticated={isAuthenticated}
          router={router}
          currentLocale={currentLocale}
          onLogout={handleLogout}
          onClose={() => setIsMenuOpen(false)}
        />
      </NavbarMenu>
    </Navbar>
  );
};

export { Header };
export default Header;