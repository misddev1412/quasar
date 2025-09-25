'use client';

import React, { Suspense } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useTranslation } from 'react-i18next';
import { Button } from '@heroui/react';
import LanguageSwitcher from '../components/common/LanguageSwitcher';
import {
  HiOutlineHome,
  HiOutlineShoppingBag,
  HiOutlineSearch,
  HiOutlineArrowLeft,
} from 'react-icons/hi';

const NotFoundPage: React.FC = () => {
  const router = useRouter();
  const { t } = useTranslation();

  const popularCategories = [
    { name: t('pages.notFound.categories.electronics'), path: '/categories/electronics', emoji: '📱' },
    { name: t('pages.notFound.categories.fashion'), path: '/categories/fashion', emoji: '👕' },
    { name: t('pages.notFound.categories.homeGarden'), path: '/categories/home-garden', emoji: '🏠' },
    { name: t('pages.notFound.categories.sports'), path: '/categories/sports', emoji: '⚽' },
  ];

  const handleSearch = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && e.currentTarget.value) {
      router.push(`/search?q=${encodeURIComponent(e.currentTarget.value)}`);
    }
  };

  return (
    <div className="min-h-[70vh] flex items-center justify-center py-12">
      <div className="max-w-4xl mx-auto px-4 text-center">
        {/* Simple 404 Section */}
        <div className="mb-12">
          {/* Large 404 Text */}
          <h1 className="text-8xl sm:text-9xl font-bold text-gray-200 dark:text-gray-700 mb-4">
            404
          </h1>

          {/* Simple Icon */}
          <div className="mb-6">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-blue-100 dark:bg-blue-900/30 rounded-full mb-4">
              <span className="text-3xl">🤖</span>
            </div>
          </div>

          {/* Error Message */}
          <div className="space-y-4 mb-8">
            <h2 className="text-3xl font-bold text-gray-900 dark:text-gray-100">
              {t('pages.notFound.heading')}
            </h2>
            <p className="text-lg text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
              {t('pages.notFound.description')}
            </p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
          <Button
            color="primary"
            size="lg"
            onPress={() => router.push('/')}
            startContent={<HiOutlineHome className="text-xl" />}
            className="font-semibold"
          >
            {t('pages.notFound.backToHome')}
          </Button>

          <Button
            variant="bordered"
            size="lg"
            onPress={() => router.push('/products')}
            startContent={<HiOutlineShoppingBag className="text-xl" />}
            className="font-semibold"
          >
            {t('pages.notFound.browseProducts')}
          </Button>

          <Button
            variant="flat"
            size="lg"
            onPress={() => router.back()}
            startContent={<HiOutlineArrowLeft className="text-xl" />}
            className="font-semibold"
          >
            {t('pages.notFound.goBack')}
          </Button>
        </div>

        {/* Search Bar */}
        <div className="mb-12">
          <div className="max-w-md mx-auto">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              {t('pages.notFound.searchTitle')}
            </h3>
            <div className="relative">
              <input
                type="text"
                placeholder={t('pages.notFound.searchPlaceholder')}
                className="w-full px-4 py-3 pl-4 pr-12 text-gray-900 dark:text-gray-100 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                onKeyDown={handleSearch}
              />
              <HiOutlineSearch className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 dark:text-gray-500 text-xl" />
            </div>
          </div>
        </div>

        {/* Popular Categories */}
        <div className="mb-12">
          <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-6">
            {t('pages.notFound.categoriesTitle')}
          </h3>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 max-w-2xl mx-auto">
            {popularCategories.map((category) => (
              <Link
                key={category.name}
                href={category.path}
                className="p-4 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 hover:border-blue-300 dark:hover:border-blue-600 transition-all duration-200 text-center group"
              >
                <div className="text-2xl mb-2">{category.emoji}</div>
                <div className="text-sm font-medium text-gray-700 dark:text-gray-300 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                  {category.name}
                </div>
              </Link>
            ))}
          </div>
        </div>

        {/* Help Links */}
        <div className="pt-8 border-t border-gray-200 dark:border-gray-700">
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
            {t('pages.notFound.helpTitle')}
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/contact"
              className="text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 font-medium transition-colors"
            >
              {t('pages.notFound.contactSupport')}
            </Link>
            <Link
              href="/support"
              className="text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 font-medium transition-colors"
            >
              {t('pages.notFound.helpCenter')}
            </Link>
            <Link
              href="/faq"
              className="text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 font-medium transition-colors"
            >
              {t('pages.notFound.faq')}
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NotFoundPage;