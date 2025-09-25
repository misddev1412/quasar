import React, { useState } from 'react';
import { useTheme } from '../../context/ThemeContext';
import { cn } from '../../lib/utils';
import { Link, useLocation } from 'react-router-dom';
import {
  LayoutDashboard,
  Users,
  Settings,
  FileText,
  HelpCircle,
  Globe,
  Menu,
  X,
  Mail,
  Image
} from 'lucide-react';
import Logo from './Logo';
import { useTranslationWithBackend } from '../../hooks/useTranslationWithBackend';

interface MenuItem {
  icon: React.ReactNode;
  label: string;
  path: string;
  translationKey: string;
}

export const HorizontalNav: React.FC = () => {
  const { theme } = useTheme();
  const { primaryColor } = theme;
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { t } = useTranslationWithBackend();

  const menuItems: MenuItem[] = [
    {
      icon: <LayoutDashboard size={18} />,
      label: t('navigation.dashboard'),
      translationKey: 'navigation.dashboard',
      path: '/'
    },
    {
      icon: <Users size={18} />,
      label: t('admin.user_management'),
      translationKey: 'admin.user_management',
      path: '/users'
    },
    {
      icon: <FileText size={18} />,
      label: t('admin.seo_management'),
      translationKey: 'admin.seo_management',
      path: '/seo'
    },
    {
      icon: <Globe size={18} />,
      label: t('admin.translations'),
      translationKey: 'admin.translations',
      path: '/translations'
    },
    {
      icon: <Mail size={18} />,
      label: t('admin.mail_templates'),
      translationKey: 'admin.mail_templates',
      path: '/mail-templates'
    },
    {
      icon: <Image size={18} />,
      label: t('brand.assets_title', 'Brand Assets'),
      translationKey: 'brand.assets_title',
      path: '/brand-assets'
    },
    {
      icon: <Settings size={18} />,
      label: t('navigation.settings'),
      translationKey: 'navigation.settings',
      path: '/settings'
    },
    {
      icon: <HelpCircle size={18} />,
      label: t('navigation.help'),
      translationKey: 'navigation.help',
      path: '/help'
    }
  ];

  // Check if route is active
  const isActiveRoute = (path: string): boolean => {
    if (path === '/') {
      return location.pathname === '/';
    }
    return location.pathname.startsWith(path);
  };

  const toggleMobileMenu = () => {
    setMobileMenuOpen(!mobileMenuOpen);
  };

  return (
    <div className="bg-white dark:bg-neutral-900 border-b border-neutral-200 dark:border-neutral-800 h-16 flex items-center justify-between px-4 md:px-6">
      {/* Logo section */}
      <div className="flex items-center">
        <Logo collapsed={false} />
      </div>
      
      {/* Desktop navigation - large screens */}
      <nav className="hidden md:block flex-1 ml-4">
        <ul className="flex items-center space-x-1">
          {menuItems.map((item, index) => {
            const isActive = isActiveRoute(item.path);
            
            return (
              <li key={index}>
                <Link
                  to={item.path}
                  className={cn(
                    'flex items-center px-3 py-2 rounded-lg transition-all',
                    isActive
                      ? `text-${primaryColor}-700 dark:text-${primaryColor}-400 bg-${primaryColor}-50 dark:bg-${primaryColor}-900/20`
                      : 'text-neutral-600 dark:text-neutral-400 hover:bg-neutral-100 dark:hover:bg-neutral-800'
                  )}
                >
                  <span>
                    {item.icon}
                  </span>
                  <span className="ml-2 font-medium text-sm">
                    {item.label}
                  </span>
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      {/* Mobile menu button */}
      <button 
        className="md:hidden p-2 rounded-lg hover:bg-neutral-100 dark:hover:bg-neutral-800 text-neutral-600 dark:text-neutral-400"
        onClick={toggleMobileMenu}
        aria-label={t('navigation.open_menu')}
      >
        {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
      </button>

      {/* Mobile navigation menu */}
      {mobileMenuOpen && (
        <div className="md:hidden fixed inset-0 z-50 bg-neutral-900/50 backdrop-blur-sm">
          <div className="fixed right-0 top-0 h-full w-64 bg-white dark:bg-neutral-900 shadow-lg p-4 overflow-y-auto">
            <div className="flex justify-between items-center mb-6">
              <h2 className="font-bold text-lg text-neutral-900 dark:text-white">{t('common.menu')}</h2>
              <button 
                onClick={toggleMobileMenu}
                className="p-2 rounded-lg hover:bg-neutral-100 dark:hover:bg-neutral-800"
              >
                <X size={20} className="text-neutral-600 dark:text-neutral-400" />
              </button>
            </div>
            
            <ul className="space-y-2">
              {menuItems.map((item, index) => {
                const isActive = isActiveRoute(item.path);
                
                return (
                  <li key={index}>
                    <Link
                      to={item.path}
                      className={cn(
                        'flex items-center px-4 py-3 rounded-lg transition-all',
                        isActive
                          ? `text-${primaryColor}-700 dark:text-${primaryColor}-400 bg-${primaryColor}-50 dark:bg-${primaryColor}-900/20`
                          : 'text-neutral-600 dark:text-neutral-400 hover:bg-neutral-100 dark:hover:bg-neutral-800'
                      )}
                      onClick={toggleMobileMenu}
                    >
                      <span>{item.icon}</span>
                      <span className="ml-3 font-medium">{item.label}</span>
                    </Link>
                  </li>
                );
              })}
            </ul>
          </div>
        </div>
      )}
    </div>
  );
};

export default HorizontalNav; 