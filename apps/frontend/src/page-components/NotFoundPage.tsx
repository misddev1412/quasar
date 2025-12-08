'use client';

import React from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';
import type { LucideIcon } from 'lucide-react';
import {
  AlertCircle,
  ArrowLeft,
  Dumbbell,
  HelpCircle,
  Home as HomeIcon,
  Mail,
  MessageCircle,
  Search,
  Shirt,
  ShoppingBag,
  Smartphone,
} from 'lucide-react';

const NotFoundPage: React.FC = () => {
  const router = useRouter();
  const t = useTranslations();

  const popularCategories: { name: string; path: string; Icon: LucideIcon }[] = [
    {
      name: t.has('pages.notFound.categories.electronics')
        ? t('pages.notFound.categories.electronics')
        : 'Electronics',
      path: '/categories/electronics',
      Icon: Smartphone,
    },
    {
      name: t.has('pages.notFound.categories.fashion')
        ? t('pages.notFound.categories.fashion')
        : 'Fashion',
      path: '/categories/fashion',
      Icon: Shirt,
    },
    {
      name: t.has('pages.notFound.categories.homeGarden')
        ? t('pages.notFound.categories.homeGarden')
        : 'Home & Garden',
      path: '/categories/home-garden',
      Icon: HomeIcon,
    },
    {
      name: t.has('pages.notFound.categories.sports')
        ? t('pages.notFound.categories.sports')
        : 'Sports',
      path: '/categories/sports',
      Icon: Dumbbell,
    },
  ];

  const handleSearch = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && e.currentTarget.value) {
      router.push(`/search?q=${encodeURIComponent(e.currentTarget.value)}`);
    }
  };

  const heading = t.has('pages.notFound.heading') 
    ? t('pages.notFound.heading') 
    : 'Page Not Found';
  const description = t.has('pages.notFound.description') 
    ? t('pages.notFound.description') 
    : 'The page you are looking for might have been removed, had its name changed, or is temporarily unavailable.';
  const backToHome = t.has('pages.notFound.backToHome') 
    ? t('pages.notFound.backToHome') 
    : 'Back to Home';
  const browseProducts = t.has('pages.notFound.browseProducts') 
    ? t('pages.notFound.browseProducts') 
    : 'Browse Products';
  const goBack = t.has('pages.notFound.goBack') 
    ? t('pages.notFound.goBack') 
    : 'Go Back';
  const searchTitle = t.has('pages.notFound.searchTitle') 
    ? t('pages.notFound.searchTitle') 
    : 'Search for something';
  const searchPlaceholder = t.has('pages.notFound.searchPlaceholder') 
    ? t('pages.notFound.searchPlaceholder') 
    : 'Search products, categories...';
  const categoriesTitle = t.has('pages.notFound.categoriesTitle') 
    ? t('pages.notFound.categoriesTitle') 
    : 'Popular Categories';
  const helpTitle = t.has('pages.notFound.helpTitle') 
    ? t('pages.notFound.helpTitle') 
    : 'Need help?';
  const contactSupport = t.has('pages.notFound.contactSupport') 
    ? t('pages.notFound.contactSupport') 
    : 'Contact Support';
  const helpCenter = t.has('pages.notFound.helpCenter') 
    ? t('pages.notFound.helpCenter') 
    : 'Help Center';
  const faq = t.has('pages.notFound.faq') 
    ? t('pages.notFound.faq') 
    : 'FAQ';

  return (
    <div className="min-h-[80vh] flex items-center justify-center py-12 px-4">
      <div className="max-w-4xl mx-auto w-full text-center">
        {/* 404 Section with Modern Design */}
        <div className="mb-12">
          {/* Large 404 Text with Gradient */}
          <div className="relative mb-8">
            <h1 className="text-8xl sm:text-9xl font-bold text-transparent bg-clip-text bg-gradient-to-br from-gray-200 via-gray-300 to-gray-400 dark:from-gray-700 dark:via-gray-600 dark:to-gray-500 mb-4">
              404
            </h1>
            <div className="absolute inset-0 blur-3xl opacity-20 bg-gradient-to-br from-blue-400 to-indigo-600 dark:from-blue-500 dark:to-indigo-700"></div>
          </div>

          {/* Icon with Modern Styling */}
          <div className="mb-8 flex justify-center">
            <div className="inline-flex items-center justify-center w-24 h-24 bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-900/30 dark:to-indigo-900/30 rounded-2xl shadow-lg mb-4 border border-blue-100 dark:border-blue-800/50">
              <AlertCircle
                className="w-10 h-10 text-blue-600 dark:text-blue-400"
                strokeWidth={1.8}
                aria-hidden="true"
              />
            </div>
          </div>

          {/* Error Message */}
          <div className="space-y-4 mb-8">
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 dark:text-gray-100">
              {heading}
            </h2>
            <p className="text-lg text-gray-600 dark:text-gray-400 max-w-2xl mx-auto leading-relaxed">
              {description}
            </p>
          </div>
        </div>

        {/* Action Buttons with Modern Styling */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
          <button
            onClick={() => router.push('/')}
            className="group inline-flex items-center justify-center gap-3 px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-semibold rounded-lg shadow-md hover:shadow-lg transition-all duration-200 transform hover:scale-105"
          >
            <HomeIcon
              className="w-5 h-5 text-white"
              strokeWidth={1.8}
              aria-hidden="true"
            />
            {backToHome}
          </button>

          <button
            onClick={() => router.push('/products')}
            className="group inline-flex items-center justify-center gap-3 px-6 py-3 bg-white dark:bg-gray-800 border-2 border-gray-200 dark:border-gray-700 hover:border-blue-300 dark:hover:border-blue-600 text-gray-900 dark:text-gray-100 font-semibold rounded-lg shadow-sm hover:shadow-md transition-all duration-200 hover:bg-gray-50 dark:hover:bg-gray-700/50"
          >
            <ShoppingBag
              className="w-5 h-5 text-gray-700 dark:text-gray-300 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors"
              strokeWidth={1.8}
              aria-hidden="true"
            />
            {browseProducts}
          </button>

          <button
            onClick={() => router.back()}
            className="group inline-flex items-center justify-center gap-3 px-6 py-3 bg-gray-50 dark:bg-gray-800/50 hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 font-semibold rounded-lg transition-all duration-200"
          >
            <ArrowLeft
              className="w-5 h-5 text-gray-600 dark:text-gray-400 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors"
              strokeWidth={1.8}
              aria-hidden="true"
            />
            {goBack}
          </button>
        </div>

        {/* Search Bar with Modern Styling */}
        <div className="mb-12">
          <div className="max-w-md mx-auto">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
              {searchTitle}
            </h3>
            <div className="relative">
              <input
                type="text"
                placeholder={searchPlaceholder}
                className="w-full px-4 py-3 pl-12 pr-4 text-gray-900 dark:text-gray-100 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 shadow-sm"
                onKeyDown={handleSearch}
              />
              <div className="absolute left-4 top-1/2 transform -translate-y-1/2">
                <Search
                  className="w-5 h-5 text-gray-400 dark:text-gray-500"
                  strokeWidth={1.8}
                  aria-hidden="true"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Popular Categories with Modern Card Design */}
        <div className="mb-12">
          <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-6">
            {categoriesTitle}
          </h3>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 max-w-2xl mx-auto">
            {popularCategories.map((category, index) => (
              <Link
                key={index}
                href={category.path}
                className="group flex flex-col items-center gap-3 p-5 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl hover:bg-gradient-to-br hover:from-blue-50 hover:to-indigo-50 dark:hover:from-blue-900/20 dark:hover:to-indigo-900/20 hover:border-blue-300 dark:hover:border-blue-600 transition-all duration-200 shadow-sm hover:shadow-md"
              >
                <div className="inline-flex items-center justify-center w-12 h-12 bg-blue-100 dark:bg-blue-900/30 rounded-lg group-hover:bg-blue-200 dark:group-hover:bg-blue-800/40 transition-colors">
                  <category.Icon
                    className="w-6 h-6 text-blue-600 dark:text-blue-400 group-hover:text-white transition-colors"
                    strokeWidth={1.8}
                    aria-hidden="true"
                  />
                </div>
                <div className="text-sm font-semibold text-gray-700 dark:text-gray-300 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors text-center">
                  {category.name}
                </div>
              </Link>
            ))}
          </div>
        </div>

        {/* Help Links with Modern Styling */}
        <div className="pt-8 border-t border-gray-200 dark:border-gray-700">
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
            {helpTitle}
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/contact"
              className="inline-flex items-center gap-2 text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 font-medium transition-colors duration-200"
            >
              <Mail
                className="w-4 h-4 text-blue-600 dark:text-blue-400"
                strokeWidth={1.8}
                aria-hidden="true"
              />
              {contactSupport}
            </Link>
            <Link
              href="/support"
              className="inline-flex items-center gap-2 text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 font-medium transition-colors duration-200"
            >
              <HelpCircle
                className="w-4 h-4 text-blue-600 dark:text-blue-400"
                strokeWidth={1.8}
                aria-hidden="true"
              />
              {helpCenter}
            </Link>
            <Link
              href="/faq"
              className="inline-flex items-center gap-2 text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 font-medium transition-colors duration-200"
            >
              <MessageCircle
                className="w-4 h-4 text-blue-600 dark:text-blue-400"
                strokeWidth={1.8}
                aria-hidden="true"
              />
              {faq}
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NotFoundPage;
