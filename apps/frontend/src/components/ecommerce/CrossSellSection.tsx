'use client';

import React, { useState } from 'react';
import { Card, Chip, Tabs, Tab } from '@heroui/react';
import { useTranslations } from 'next-intl';
import { FiPackage, FiPlus } from 'react-icons/fi';
import Button from '../common/Button';
import ProductCard from './ProductCard';
import type { Product } from '../../types/product';

interface CrossSellSectionProps {
  products: {
    related: Product[];
    frequentlyBoughtTogether: Product[];
    recommended: Product[];
    trending: Product[];
  };
  onAddToCart?: (product: Product, quantity?: number) => void;
  onWishlistToggle?: (productId: string) => void;
  className?: string;
  showTabs?: boolean;
  maxProducts?: number;
}

const CrossSellSection: React.FC<CrossSellSectionProps> = ({
  products,
  onAddToCart,
  onWishlistToggle,
  className = '',
  showTabs = true,
  maxProducts = 8,
}) => {
  const t = useTranslations('product.detail.crossSell');

  const [activeTab, setActiveTab] = useState('related');
  const [selectedTab, setSelectedTab] = useState<'related' | 'bought-together' | 'recommended' | 'trending'>('related');

  const getTabProducts = (tab: string) => {
    switch (tab) {
      case 'related':
        return products.related.slice(0, maxProducts);
      case 'bought-together':
        return products.frequentlyBoughtTogether.slice(0, maxProducts);
      case 'recommended':
        return products.recommended.slice(0, maxProducts);
      case 'trending':
        return products.trending.slice(0, maxProducts);
      default:
        return products.related.slice(0, maxProducts);
    }
  };

  const currentProducts = getTabProducts(selectedTab);

  const getTotalPrice = () => {
    if (selectedTab === 'bought-together') {
      return products.frequentlyBoughtTogether.reduce((total, product) => {
        const price = product.variants && product.variants.length > 0
          ? Math.min(...product.variants.map(v => v.price))
          : 0;
        return total + price;
      }, 0);
    }
    return 0;
  };

  const getTabInfo = (tab: string) => {
    const tabProducts = getTabProducts(tab);
    return {
      title: tab.charAt(0).toUpperCase() + tab.slice(1).replace('-', ' '),
      count: tabProducts.length,
      description: getTabDescription(tab)
    };
  };

  const getTabDescription = (tab: string) => {
    switch (tab) {
      case 'related':
        return t('descriptions.related');
      case 'bought-together':
        return t('descriptions.boughtTogether');
      case 'recommended':
        return t('descriptions.recommended');
      case 'trending':
        return t('descriptions.trending');
      default:
        return '';
    }
  };

  const renderTabContent = () => {
    if (currentProducts.length === 0) {
      return (
        <Card className="p-8 text-center">
          <div className="text-5xl mb-4 flex justify-center text-gray-300">
            <FiPackage />
          </div>
          <h3 className="text-xl font-semibold mb-2">{t('empty.title')}</h3>
          <p className="text-gray-600">{t('empty.description')}</p>
        </Card>
      );
    }

    return (
      <div className="space-y-6">
        {/* Frequently Bought Together Special Layout */}
        {selectedTab === 'bought-together' && currentProducts.length > 1 && (
          <div className="bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 rounded-xl p-6 mb-6">
            <div className="text-center mb-4">
              <h3 className="text-xl font-semibold mb-2">{t('completeSet.title')}</h3>
              <p className="text-gray-600 mb-4">{t('completeSet.subtitle')}</p>
              <div className="flex items-center justify-center gap-4 mb-4">
                <span className="text-2xl font-bold text-blue-600">
                  ${getTotalPrice().toFixed(2)}
                </span>
                <Button color="primary" size="lg">
                  {t('completeSet.addAll')}
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* Products Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {currentProducts.map((product, index) => (
            <div key={product.id} className="relative">
              {/* Add visual connector for "Frequently Bought Together" */}
              {selectedTab === 'bought-together' && index < currentProducts.length - 1 && (
                <div className="hidden lg:block absolute top-1/2 -right-3 transform -translate-y-1/2 z-10">
                  <FiPlus className="text-2xl text-gray-400" />
                </div>
              )}

              <ProductCard
                product={product}
                onAddToCart={onAddToCart}
                onWishlistToggle={onWishlistToggle}
                className="h-full"
              />
            </div>
          ))}
        </div>
      </div>
    );
  };

  if (!showTabs) {
    return (
      <div className={className}>
        <h2 className="text-2xl font-bold mb-6">{t('relatedTitle')}</h2>
        {renderTabContent()}
      </div>
    );
  }

  return (
    <div className={className}>
      <div className="mb-8">
        <h2 className="text-3xl font-bold text-center mb-4">{t('sectionTitle')}</h2>
        <p className="text-gray-600 text-center mb-8">
          {t('sectionSubtitle')}
        </p>

        <Tabs
          selectedKey={selectedTab}
          onSelectionChange={(key) => setSelectedTab(key as any)}
          variant="underlined"
          className="w-full"
        >
          <Tab key="related" title={
            <div className="flex items-center gap-2">
              <span>{t('tabs.related')}</span>
              <Chip size="sm" variant="flat">{products.related.length}</Chip>
            </div>
          }>
            <div className="mt-6">
              <p className="text-gray-600 mb-6 text-center">
                {t('descriptions.related')}
              </p>
              {renderTabContent()}
            </div>
          </Tab>

          <Tab key="bought-together" title={
            <div className="flex items-center gap-2">
              <span>{t('tabs.boughtTogether')}</span>
              <Chip size="sm" variant="flat">{products.frequentlyBoughtTogether.length}</Chip>
            </div>
          }>
            <div className="mt-6">
              <p className="text-gray-600 mb-6 text-center">
                {t('descriptions.boughtTogether')}
              </p>
              {renderTabContent()}
            </div>
          </Tab>

          <Tab key="recommended" title={
            <div className="flex items-center gap-2">
              <span>{t('tabs.recommended')}</span>
              <Chip size="sm" variant="flat">{products.recommended.length}</Chip>
            </div>
          }>
            <div className="mt-6">
              <p className="text-gray-600 mb-6 text-center">
                {t('descriptions.recommended')}
              </p>
              {renderTabContent()}
            </div>
          </Tab>

          <Tab key="trending" title={
            <div className="flex items-center gap-2">
              <span>{t('tabs.trending')}</span>
              <Chip size="sm" variant="flat">{products.trending.length}</Chip>
            </div>
          }>
            <div className="mt-6">
              <p className="text-gray-600 mb-6 text-center">
                {t('descriptions.trending')}
              </p>
              {renderTabContent()}
            </div>
          </Tab>
        </Tabs>
      </div>
    </div>
  );
};

export default CrossSellSection;