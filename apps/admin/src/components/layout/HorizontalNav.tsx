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
  X
} from 'lucide-react';
import Logo from './Logo';

interface MenuItem {
  icon: React.ReactNode;
  label: string;
  path: string;
}

export const HorizontalNav: React.FC = () => {
  const { theme } = useTheme();
  const { primaryColor } = theme;
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const menuItems: MenuItem[] = [
    {
      icon: <LayoutDashboard size={18} />,
      label: '仪表盘',
      path: '/'
    },
    {
      icon: <Users size={18} />,
      label: '用户管理',
      path: '/users'
    },
    {
      icon: <FileText size={18} />,
      label: 'SEO管理',
      path: '/seo'
    },
    {
      icon: <Globe size={18} />,
      label: '翻译',
      path: '/translations'
    },
    {
      icon: <Settings size={18} />,
      label: '设置',
      path: '/settings'
    },
    {
      icon: <HelpCircle size={18} />,
      label: '帮助',
      path: '/help'
    }
  ];

  // 检查路由是否活跃
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
      {/* Logo部分 */}
      <div className="flex items-center">
        <Logo collapsed={false} />
      </div>
      
      {/* 桌面导航 - 大屏幕 */}
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

      {/* 移动端菜单按钮 */}
      <button 
        className="md:hidden p-2 rounded-lg hover:bg-neutral-100 dark:hover:bg-neutral-800 text-neutral-600 dark:text-neutral-400"
        onClick={toggleMobileMenu}
        aria-label="打开导航菜单"
      >
        {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
      </button>

      {/* 移动端导航菜单 */}
      {mobileMenuOpen && (
        <div className="md:hidden fixed inset-0 z-50 bg-neutral-900/50 backdrop-blur-sm">
          <div className="fixed right-0 top-0 h-full w-64 bg-white dark:bg-neutral-900 shadow-lg p-4 overflow-y-auto">
            <div className="flex justify-between items-center mb-6">
              <h2 className="font-bold text-lg text-neutral-900 dark:text-white">菜单</h2>
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