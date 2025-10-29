import { useState, useCallback } from 'react';

interface UseProductStateProps {
  productId: string;
  onAddToCart?: (product: any, quantity?: number, variant?: any) => void;
  onWishlistToggle?: (productId: string) => void;
}

export const useProductState = ({ productId, onAddToCart, onWishlistToggle }: UseProductStateProps) => {
  const [quantity, setQuantity] = useState(1);
  const [wishlistAdded, setWishlistAdded] = useState(false);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [showQuickView, setShowQuickView] = useState(false);
  const [activeDetailTab, setActiveDetailTab] = useState<'details' | 'reviews' | 'questions'>('details');

  const handleQuantityChange = useCallback((newQuantity: number) => {
    if (Number.isNaN(newQuantity)) {
      return;
    }

    const clamped = Math.min(99, Math.max(1, Math.floor(newQuantity)));
    setQuantity(clamped);
  }, []);

  const handleAddToCart = useCallback((product: any, selectedVariant: any) => {
    if (onAddToCart) {
      onAddToCart(product, quantity, selectedVariant);
    }
  }, [onAddToCart, quantity]);

  const handleWishlistToggle = useCallback(() => {
    setWishlistAdded(!wishlistAdded);
    if (onWishlistToggle) {
      onWishlistToggle(productId);
    }
  }, [wishlistAdded, onWishlistToggle, productId]);

  const handleImageSelect = useCallback((index: number) => {
    setSelectedImageIndex(index);
  }, []);

  const handleQuickViewToggle = useCallback(() => {
    setShowQuickView(!showQuickView);
  }, [showQuickView]);

  const handleDetailTabChange = useCallback((tab: 'details' | 'reviews' | 'questions') => {
    setActiveDetailTab(tab);
  }, []);

  return {
    quantity,
    wishlistAdded,
    selectedImageIndex,
    showQuickView,
    activeDetailTab,
    handleQuantityChange,
    handleAddToCart,
    handleWishlistToggle,
    handleImageSelect,
    handleQuickViewToggle,
    handleDetailTabChange,
    setSelectedImageIndex,
    setShowQuickView,
  };
};