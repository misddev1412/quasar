'use client';
import React, { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { Input, Button, Card, Divider } from '@heroui/react';
import { Product } from './ProductCard';
import { useTranslation } from 'react-i18next';

interface ProductSearchProps {
  onSearch?: (query: string) => void;
  onSuggestionSelect?: (product: Product) => void;
  placeholder?: string;
  className?: string;
  size?: 'sm' | 'md' | 'lg';
  variant?: 'flat' | 'bordered' | 'faded' | 'underlined';
  showSuggestions?: boolean;
  showRecentSearches?: boolean;
  maxSuggestions?: number;
  maxRecentSearches?: number;
  searchEndpoint?: string;
  debounceMs?: number;
  fullWidth?: boolean;
}

const ProductSearch: React.FC<ProductSearchProps> = ({
  onSearch,
  onSuggestionSelect,
  placeholder,
  className = '',
  size = 'md',
  variant = 'flat',
  showSuggestions = true,
  showRecentSearches = true,
  maxSuggestions = 5,
  maxRecentSearches = 5,
  searchEndpoint,
  debounceMs = 300,
  fullWidth = false,
}) => {
  const [query, setQuery] = useState('');
  const [suggestions, setSuggestions] = useState<Product[]>([]);
  const [recentSearches, setRecentSearches] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const { t } = useTranslation();
  const resolvedPlaceholder = placeholder ?? t('common.searchBar.placeholder');

  const router = useRouter();
  const searchRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const debounceTimerRef = useRef<NodeJS.Timeout>();

  // Load recent searches from localStorage on mount
  useEffect(() => {
    const savedSearches = localStorage.getItem('recentProductSearches');
    if (savedSearches) {
      try {
        setRecentSearches(JSON.parse(savedSearches));
      } catch (error) {
        console.error('Error parsing recent searches:', error);
      }
    }
  }, []);

  // Save recent searches to localStorage when they change
  useEffect(() => {
    localStorage.setItem('recentProductSearches', JSON.stringify(recentSearches));
  }, [recentSearches]);

  // Handle clicks outside the search component
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setShowDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // Handle keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!showDropdown) return;

      const totalItems =
        suggestions.length + (showRecentSearches && query === '' ? recentSearches.length : 0);

      switch (e.key) {
        case 'ArrowDown':
          e.preventDefault();
          setSelectedIndex((prev) => (prev < totalItems - 1 ? prev + 1 : prev));
          break;
        case 'ArrowUp':
          e.preventDefault();
          setSelectedIndex((prev) => (prev > 0 ? prev - 1 : -1));
          break;
        case 'Enter':
          e.preventDefault();
          if (selectedIndex >= 0) {
            if (selectedIndex < suggestions.length) {
              handleSuggestionSelect(suggestions[selectedIndex]);
            } else {
              const recentIndex = selectedIndex - suggestions.length;
              handleRecentSearchSelect(recentSearches[recentIndex]);
            }
          } else {
            handleSearch();
          }
          break;
        case 'Escape':
          setShowDropdown(false);
          setSelectedIndex(-1);
          break;
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [showDropdown, suggestions, recentSearches, selectedIndex, query]);

  // Fetch suggestions based on query
  useEffect(() => {
    if (!query.trim() || !showSuggestions) {
      setSuggestions([]);
      return;
    }

    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }

    debounceTimerRef.current = setTimeout(() => {
      fetchSuggestions();
    }, debounceMs);

    return () => {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }
    };
  }, [query, showSuggestions]);

  const fetchSuggestions = async () => {
    if (!searchEndpoint) {
      // Mock suggestions for demo purposes
      const mockSuggestions: Product[] = [
        {
          id: '1',
          name: 'Wireless Headphones',
          description: 'High-quality wireless headphones with noise cancellation',
          price: 99.99,
          images: ['/placeholder-product.png'],
          inStock: true,
          slug: 'wireless-headphones',
        },
        {
          id: '2',
          name: 'Smartphone Case',
          description: 'Durable case for your smartphone',
          price: 19.99,
          images: ['/placeholder-product.png'],
          inStock: true,
          slug: 'smartphone-case',
        },
      ].filter(
        (product) =>
          product.name.toLowerCase().includes(query.toLowerCase()) ||
          product.description.toLowerCase().includes(query.toLowerCase())
      );

      setSuggestions(mockSuggestions.slice(0, maxSuggestions));
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch(
        `${searchEndpoint}?q=${encodeURIComponent(query)}&limit=${maxSuggestions}`
      );
      if (response.ok) {
        const data = await response.json();
        setSuggestions(data.products || []);
      }
    } catch (error) {
      console.error('Error fetching search suggestions:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSearch = () => {
    if (!query.trim()) return;

    // Add to recent searches
    const updatedSearches = [query, ...recentSearches.filter((search) => search !== query)].slice(
      0,
      maxRecentSearches
    );

    setRecentSearches(updatedSearches);
    setShowDropdown(false);
    setSelectedIndex(-1);

    if (onSearch) {
      onSearch(query);
    } else {
      router.push(`/search?q=${encodeURIComponent(query)}`);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    handleSearch();
  };

  const handleSuggestionSelect = (product: Product) => {
    setQuery('');
    setShowDropdown(false);
    setSelectedIndex(-1);

    if (onSuggestionSelect) {
      onSuggestionSelect(product);
    } else {
      router.push(`/products/${product.slug}`);
    }
  };

  const handleRecentSearchSelect = (searchTerm: string) => {
    setQuery(searchTerm);
    setShowDropdown(false);
    setSelectedIndex(-1);

    if (onSearch) {
      onSearch(searchTerm);
    } else {
      router.push(`/search?q=${encodeURIComponent(searchTerm)}`);
    }
  };

  const handleClearSearch = () => {
    setQuery('');
    setSuggestions([]);
    setShowDropdown(false);
    setSelectedIndex(-1);
    if (inputRef.current) {
      inputRef.current.focus();
    }
  };

  const handleClearRecentSearches = () => {
    setRecentSearches([]);
  };

  return (
    <div ref={searchRef} className={`relative ${className}`}>
      <form onSubmit={handleSubmit} className="flex">
        <Input
          ref={inputRef}
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setShowDropdown(true);
          }}
          onFocus={() => setShowDropdown(true)}
          placeholder={resolvedPlaceholder}
          size={size}
          variant={variant}
          fullWidth={fullWidth}
          endContent={
            query && (
              <Button
                isIconOnly
                size="sm"
                variant="light"
                onPress={handleClearSearch}
                className="mr-1"
              >
                <span className="text-lg">✕</span>
              </Button>
            )
          }
          startContent={<span className="text-lg mr-2">🔍</span>}
        />
        <Button type="submit" color="primary" size={size} className="ml-2">
          {t('common.searchBar.submit')}
        </Button>
      </form>

      {/* Search Dropdown */}
      {showDropdown && (suggestions.length > 0 || (recentSearches.length > 0 && query === '')) && (
        <Card className="absolute top-full left-0 right-0 z-10 mt-1 shadow-lg max-h-96 overflow-y-auto">
          {/* Recent Searches */}
          {query === '' && recentSearches.length > 0 && showRecentSearches && (
            <>
              <div className="p-3">
                <div className="flex justify-between items-center mb-2">
                  <h4 className="text-sm font-semibold text-gray-700">{t('common.searchBar.recent')}</h4>
                  <Button
                    size="sm"
                    variant="light"
                    onPress={handleClearRecentSearches}
                    className="text-xs"
                  >
                    {t('common.searchBar.clear')}
                  </Button>
                </div>
                <div className="space-y-1">
                  {recentSearches.map((search, index) => (
                    <div
                      key={search}
                      className={`flex items-center gap-2 p-2 rounded-md cursor-pointer hover:bg-gray-100 ${
                        selectedIndex === index ? 'bg-gray-100' : ''
                      }`}
                      onClick={() => handleRecentSearchSelect(search)}
                      onMouseEnter={() => setSelectedIndex(index)}
                    >
                      <span className="text-lg">🕐</span>
                      <span className="text-sm">{search}</span>
                    </div>
                  ))}
                </div>
              </div>
              <Divider />
            </>
          )}

          {/* Suggestions */}
          {suggestions.length > 0 && (
            <div className="p-3">
              <h4 className="text-sm font-semibold text-gray-700 mb-2">{t('common.searchBar.suggestions')}</h4>
              <div className="space-y-1">
                {suggestions.map((product, index) => {
                  const adjustedIndex = recentSearches.length + index;
                  return (
                    <div
                      key={product.id}
                      className={`flex items-center gap-3 p-2 rounded-md cursor-pointer hover:bg-gray-100 ${
                        selectedIndex === adjustedIndex ? 'bg-gray-100' : ''
                      }`}
                      onClick={() => handleSuggestionSelect(product)}
                      onMouseEnter={() => setSelectedIndex(adjustedIndex)}
                    >
                      <div className="w-10 h-10 flex-shrink-0">
                        <img
                          src={product.images[0] || '/placeholder-product.png'}
                          alt={product.name}
                          className="w-full h-full object-cover rounded-md"
                        />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="text-sm font-medium truncate">{product.name}</div>
                        <div className="text-xs text-gray-500 truncate">{product.description}</div>
                      </div>
                      <div className="text-sm font-medium">${product.price.toFixed(2)}</div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Loading State */}
          {isLoading && <div className="p-4 text-center text-gray-500">Loading suggestions...</div>}
        </Card>
      )}
    </div>
  );
};

export default ProductSearch;
