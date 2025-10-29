import React from 'react';
import { Modal, ModalContent, ModalHeader, ModalBody, Button } from '@heroui/react';
import { useTranslations } from 'next-intl';
import PriceDisplay from './PriceDisplay';
import type { Product, ProductVariant } from '../../types/product';

interface ProductQuickViewProps {
  isOpen: boolean;
  onClose: () => void;
  product: Product;
  selectedVariant: ProductVariant | null;
  description: string;
  onAddToCart: () => void;
}

const typography = {
  subsectionTitle: 'text-lg font-semibold text-gray-900 dark:text-white',
} as const;

const ProductQuickView: React.FC<ProductQuickViewProps> = ({
  isOpen,
  onClose,
  product,
  selectedVariant,
  description,
  onAddToCart,
}) => {
  const t = useTranslations('product.detail');
  const { name, media } = product;

  const getPrimaryImage = () => {
    if (media && media.length > 0) {
      const primaryMedia = media.find(m => m.isPrimary);
      return primaryMedia?.url || media[0].url;
    }
    return '/placeholder-product.png';
  };

  const currentPrice = selectedVariant?.price ||
    (product.variants && product.variants.length > 0 ? Math.min(...product.variants.map(v => v.price)) : 0);

  const originalPrice = selectedVariant?.compareAtPrice ||
    (product.variants && product.variants.length > 0 ? product.variants[0].compareAtPrice : undefined);

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      size="4xl"
      backdrop="blur"
    >
      <ModalContent>
        <ModalHeader>
          <h2 className={typography.subsectionTitle}>{name}</h2>
        </ModalHeader>
        <ModalBody>
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            <div>
              <img
                src={getPrimaryImage()}
                alt={name}
                className="w-full h-64 object-cover rounded-lg"
              />
            </div>
            <div className="space-y-5">
              <PriceDisplay price={currentPrice} originalPrice={originalPrice} size="lg" />
              <p className="text-base text-gray-600 line-clamp-3">{description}</p>
              <Button
                color="primary"
                onPress={() => {
                  onAddToCart();
                  onClose();
                }}
                fullWidth
              >
                {t('actions.addToCart')}
              </Button>
            </div>
          </div>
        </ModalBody>
      </ModalContent>
    </Modal>
  );
};

export default ProductQuickView;