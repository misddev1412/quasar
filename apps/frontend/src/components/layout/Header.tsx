'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';
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
  Input,
} from '@heroui/react';
import { useAuth } from '../../contexts/AuthContext';

const Header: React.FC = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const { user, isAuthenticated, logout } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  const menuItems = [
    { name: 'Home', href: '/' },
    { name: 'Products', href: '/products' },
    { name: 'Categories', href: '/categories' },
    { name: 'Deals', href: '/deals' },
    { name: 'About', href: '/about' },
    { name: 'Contact', href: '/contact' },
  ];

  const isActive = (path: string) => {
    return pathname === path;
  };

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
      className="bg-white border-b"
      maxWidth="xl"
      height="4rem"
      position="sticky"
    >
      {/* Logo and Brand */}
      <NavbarContent>
        <NavbarMenuToggle
          aria-label={isMenuOpen ? "Close menu" : "Open menu"}
          className="sm:hidden"
        />
        <NavbarBrand>
          <Link href="/" className="flex items-center gap-2">
            <div className="w-8 h-8 bg-primary-500 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold">Q</span>
            </div>
            <p className="font-bold text-xl text-gray-900">Quasar Store</p>
          </Link>
        </NavbarBrand>
      </NavbarContent>

      {/* Desktop Navigation */}
      <NavbarContent className="hidden sm:flex gap-4" justify="center">
        {menuItems.map((item) => (
          <NavbarItem key={item.href} isActive={isActive(item.href)}>
            <Link
              href={item.href}
              className={`text-sm font-medium transition-colors ${
                isActive(item.href)
                  ? 'text-primary-500'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              {item.name}
            </Link>
          </NavbarItem>
        ))}
      </NavbarContent>

      {/* Right Side Actions */}
      <NavbarContent justify="end">
        {/* Search - Desktop */}
        <NavbarItem className="hidden lg:flex">
          <form onSubmit={handleSearch}>
            <Input
              classNames={{
                base: "max-w-full sm:max-w-[10rem] h-10",
                mainWrapper: "h-full",
                input: "text-small",
                inputWrapper: "h-full font-normal text-default-500 bg-default-400/20 dark:bg-default-500/20",
              }}
              placeholder="Search..."
              size="sm"
              type="search"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </form>
        </NavbarItem>

        {/* Notifications */}
        {isAuthenticated && (
          <NavbarItem>
            <Button
              isIconOnly
              variant="light"
              aria-label="Notifications"
              onPress={() => navigate('/notifications')}
            >
              <Badge content="3" color="danger" shape="circle" size="sm">
                <span className="text-lg">🔔</span>
              </Badge>
            </Button>
          </NavbarItem>
        )}

        {/* Wishlist */}
        {isAuthenticated && (
          <NavbarItem className="hidden sm:flex">
            <Button
              isIconOnly
              variant="light"
              aria-label="Wishlist"
              onPress={() => navigate('/wishlist')}
            >
              <Badge content="5" color="secondary" shape="circle" size="sm">
                <span className="text-lg">❤️</span>
              </Badge>
            </Button>
          </NavbarItem>
        )}

        {/* Cart */}
        <NavbarItem>
          <Button
            isIconOnly
            variant="light"
            aria-label="Shopping cart"
            onPress={() => navigate('/cart')}
          >
            <Badge content="2" color="primary" shape="circle" size="sm">
              <span className="text-lg">🛒</span>
            </Badge>
          </Button>
        </NavbarItem>

        {/* User Menu */}
        <NavbarItem>
          {isAuthenticated ? (
            <Dropdown placement="bottom-end">
              <DropdownTrigger>
                <Avatar
                  as="button"
                  className="transition-transform"
                  size="sm"
                  src={user?.avatar}
                  name={user?.name}
                  showFallback
                  fallback={<span className="text-sm">👤</span>}
                />
              </DropdownTrigger>
              <DropdownMenu aria-label="User menu actions" variant="flat">
                <DropdownItem key="profile" className="h-14 gap-2">
                  <p className="font-semibold">Signed in as</p>
                  <p className="font-semibold">{user?.email}</p>
                </DropdownItem>
                <DropdownItem
                  key="dashboard"
                  onPress={() => navigate('/account')}
                >
                  My Account
                </DropdownItem>
                <DropdownItem
                  key="profile"
                  onPress={() => navigate('/profile')}
                >
                  Edit Profile
                </DropdownItem>
                <DropdownItem
                  key="orders"
                  onPress={() => navigate('/orders')}
                >
                  My Orders
                </DropdownItem>
                <DropdownItem
                  key="wishlist"
                  onPress={() => navigate('/wishlist')}
                  className="sm:hidden"
                >
                  Wishlist
                </DropdownItem>
                <DropdownItem
                  key="notifications"
                  onPress={() => navigate('/notifications')}
                  className="sm:hidden"
                >
                  Notifications
                </DropdownItem>
                <DropdownItem
                  key="settings"
                  onPress={() => navigate('/settings')}
                >
                  Settings
                </DropdownItem>
                <DropdownItem
                  key="logout"
                  color="danger"
                  onPress={handleLogout}
                >
                  Log Out
                </DropdownItem>
              </DropdownMenu>
            </Dropdown>
          ) : (
            <div className="flex items-center gap-2">
              <Button
                variant="light"
                size="sm"
                onPress={() => navigate('/login')}
              >
                Sign In
              </Button>
              <Button
                color="primary"
                size="sm"
                onPress={() => navigate('/register')}
                className="hidden sm:flex"
              >
                Sign Up
              </Button>
            </div>
          )}
        </NavbarItem>
      </NavbarContent>

      {/* Mobile Menu */}
      <NavbarMenu>
        {/* Mobile Search */}
        <NavbarMenuItem>
          <form onSubmit={handleSearch} className="w-full">
            <Input
              classNames={{
                base: "w-full",
                mainWrapper: "h-full",
                input: "text-small",
                inputWrapper: "h-full font-normal text-default-500 bg-default-400/20",
              }}
              placeholder="Search products..."
              size="lg"
              type="search"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </form>
        </NavbarMenuItem>

        {/* Mobile Navigation Items */}
        {menuItems.map((item, index) => (
          <NavbarMenuItem key={`${item.href}-${index}`}>
            <Link
              to={item.href}
              className={`w-full text-lg flex items-center gap-3 py-2 ${
                isActive(item.href)
                  ? 'text-primary-500 font-medium'
                  : 'text-gray-600'
              }`}
              onClick={() => setIsMenuOpen(false)}
            >
              {item.name}
            </Link>
          </NavbarMenuItem>
        ))}

        {/* Divider */}
        <NavbarMenuItem>
          <div className="border-t border-gray-200 my-2"></div>
        </NavbarMenuItem>

        {/* Mobile User Actions */}
        {isAuthenticated ? (
          <>
            <NavbarMenuItem>
              <Link
                to="/account"
                className="w-full text-lg text-gray-600 flex items-center gap-3 py-2"
                onClick={() => setIsMenuOpen(false)}
              >
                My Account
              </Link>
            </NavbarMenuItem>
            <NavbarMenuItem>
              <Link
                to="/profile"
                className="w-full text-lg text-gray-600 flex items-center gap-3 py-2"
                onClick={() => setIsMenuOpen(false)}
              >
                Edit Profile
              </Link>
            </NavbarMenuItem>
            <NavbarMenuItem>
              <Link
                to="/orders"
                className="w-full text-lg text-gray-600 flex items-center gap-3 py-2"
                onClick={() => setIsMenuOpen(false)}
              >
                My Orders
              </Link>
            </NavbarMenuItem>
            <NavbarMenuItem>
              <Link
                to="/wishlist"
                className="w-full text-lg text-gray-600 flex items-center gap-3 py-2"
                onClick={() => setIsMenuOpen(false)}
              >
                Wishlist
              </Link>
            </NavbarMenuItem>
            <NavbarMenuItem>
              <Link
                to="/notifications"
                className="w-full text-lg text-gray-600 flex items-center gap-3 py-2"
                onClick={() => setIsMenuOpen(false)}
              >
                Notifications
              </Link>
            </NavbarMenuItem>
            <NavbarMenuItem>
              <Link
                to="/settings"
                className="w-full text-lg text-gray-600 flex items-center gap-3 py-2"
                onClick={() => setIsMenuOpen(false)}
              >
                Settings
              </Link>
            </NavbarMenuItem>
            <NavbarMenuItem>
              <Button
                color="danger"
                variant="flat"
                className="w-full"
                onPress={() => {
                  handleLogout();
                  setIsMenuOpen(false);
                }}
              >
                Log Out
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
                  navigate('/login');
                  setIsMenuOpen(false);
                }}
              >
                Sign In
              </Button>
            </NavbarMenuItem>
            <NavbarMenuItem>
              <Button
                color="primary"
                className="w-full"
                onPress={() => {
                  navigate('/register');
                  setIsMenuOpen(false);
                }}
              >
                Sign Up
              </Button>
            </NavbarMenuItem>
          </>
        )}
      </NavbarMenu>
    </Navbar>
  );
};

export { Header };
export default Header;