import React, { useState } from 'react';
import { Button, Card, Chip } from '@heroui/react';
import { FiCheck, FiVideo, FiTruck, FiRefreshCw, FiShield, FiChevronDown, FiChevronUp } from 'react-icons/fi';
import type { ProductSpecification } from '../../types/product';
import { useTranslations } from 'next-intl';

interface ProductDescriptionProps {
  description: string;
  features?: string[];
  specifications?: ProductSpecification[];
  details?: {
    materials?: string;
    careInstructions?: string[];
    dimensions?: string;
    weight?: string;
    origin?: string;
    warranty?: string;
  };
  videos?: Array<{
    url: string;
    title: string;
    thumbnail?: string;
  }>;
  className?: string;
  expanded?: boolean;
}

const ProductDescription: React.FC<ProductDescriptionProps> = ({
  description,
  features = [],
  specifications = [],
  details = {},
  videos = [],
  className = '',
  expanded = false,
}) => {
  const t = useTranslations('product.detail.description');
  const [isExpanded, setIsExpanded] = useState(expanded);

  const rawDetailLabels = t.raw('details.labels');
  const detailLabels = (rawDetailLabels && typeof rawDetailLabels === 'object'
    ? (rawDetailLabels as Record<string, string>)
    : {});

  const rawPolicies = t.raw('policies');
  const policyCards = Array.isArray(rawPolicies)
    ? (rawPolicies as Array<{ title: string; description: string }>)
    : [];
  const policyIcons = [FiTruck, FiRefreshCw, FiShield];

  const readMoreLabel = t('readMore');
  const readLessLabel = t('readLess');
  const getDetailLabel = (key: string) => detailLabels[key] ?? key;

  const formatFeatureText = (text: string) => {
    return text.replace(/^[•\-\*]\s*/, '').trim();
  };

  const renderFeatures = () => (
    <div className="space-y-3 p-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {features.map((feature, index) => (
          <div key={index} className="flex items-start gap-3 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
            <FiCheck className="text-green-500 text-lg flex-shrink-0 mt-0.5" />
            <span className="text-sm text-gray-700 dark:text-gray-300">{formatFeatureText(feature)}</span>
          </div>
        ))}
      </div>
    </div>
  );

  const renderSpecifications = () => (
    <div className="space-y-4 p-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {specifications.map((spec) => (
          <div
            key={spec.id || spec.name}
            className="flex justify-between items-center p-3 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg"
          >
            <span className="font-medium text-gray-700 dark:text-gray-300">
              {spec.name.replace(/([A-Z])/g, ' $1').trim()}
            </span>
            <span className="text-gray-600 dark:text-gray-400 text-right">
              {spec.value}
            </span>
          </div>
        ))}
      </div>
    </div>
  );

  const renderDetails = () => (
    <div className="space-y-6 p-6">
      {details.materials && (
        <div>
          <h5 className="font-medium mb-2">{getDetailLabel('materials')}</h5>
          <p className="text-gray-700 dark:text-gray-300">{details.materials}</p>
        </div>
      )}

      {details.dimensions && (
        <div>
          <h5 className="font-medium mb-2">{getDetailLabel('dimensions')}</h5>
          <p className="text-gray-700 dark:text-gray-300">{details.dimensions}</p>
        </div>
      )}

      {details.weight && (
        <div>
          <h5 className="font-medium mb-2">{getDetailLabel('weight')}</h5>
          <p className="text-gray-700 dark:text-gray-300">{details.weight}</p>
        </div>
      )}

      {details.origin && (
        <div>
          <h5 className="font-medium mb-2">{getDetailLabel('origin')}</h5>
          <p className="text-gray-700 dark:text-gray-300">{details.origin}</p>
        </div>
      )}

      {details.warranty && (
        <div>
          <h5 className="font-medium mb-2">{getDetailLabel('warranty')}</h5>
          <p className="text-gray-700 dark:text-gray-300">{details.warranty}</p>
        </div>
      )}

      {details.careInstructions && details.careInstructions.length > 0 && (
        <div>
          <h5 className="font-medium mb-2">{getDetailLabel('careInstructions')}</h5>
          <ul className="space-y-2">
            {details.careInstructions.map((instruction, index) => (
              <li key={index} className="flex items-start gap-2">
                <span className="text-blue-500 text-sm flex-shrink-0 mt-1">•</span>
                <span className="text-gray-700 dark:text-gray-300">{instruction}</span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );

  const renderVideos = () => (
    <div className="space-y-6 p-6">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {videos.map((video, index) => (
          <Card key={index} className="overflow-hidden">
            <div className="aspect-video bg-black relative">
              <div className="absolute inset-0 flex items-center justify-center bg-gray-900">
                <div className="text-center text-white">
                  <FiVideo className="text-4xl mb-2" />
                  <p className="text-sm">{video.title}</p>
                </div>
              </div>
            </div>
            <div className="p-4">
              <h5 className="font-medium mb-1">{video.title}</h5>
              <Button variant="flat" size="sm" className="w-full mt-2">
                {t('videos.cta')}
              </Button>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Main Description */}
      <Card className="border border-gray-200 dark:border-gray-700 shadow-sm p-6">
        <div className="mb-4">
          <h3 className="text-xl font-semibold">{t('title')}</h3>
        </div>

        <div className="relative">
          <div
            className={`prose prose-gray dark:prose-invert max-w-none transition-all ${
              isExpanded ? '' : 'line-clamp-3'
            }`}
          >
            <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
              {description}
            </p>
          </div>

          {!isExpanded && (
            <button
              type="button"
              onClick={() => setIsExpanded(true)}
              className="absolute inset-x-0 bottom-0 flex items-center justify-center gap-2 rounded-b-2xl bg-gradient-to-t from-white via-white/95 to-white/0 px-4 pb-3 pt-10 text-sm font-semibold text-primary-600 dark:from-gray-900 dark:via-gray-900/80 dark:to-gray-900/0"
            >
              <span>{readMoreLabel}</span>
              <FiChevronDown className="text-base" />
            </button>
          )}
        </div>

        {isExpanded && (
          <button
            type="button"
            onClick={() => setIsExpanded(false)}
            className="mt-4 inline-flex items-center gap-2 text-sm font-semibold text-primary-600"
          >
            {readLessLabel}
            <FiChevronUp className="text-base" />
          </button>
        )}
      </Card>

      {/* Quick Info Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {policyCards.map((policy, index) => {
          const Icon = policyIcons[index % policyIcons.length];
          return (
            <Card key={`${policy.title}-${index}`} className="p-4 text-center d-flex items-center">
              <Icon className="text-3xl mb-2" />
              <h5 className="font-medium mb-1">{policy.title}</h5>
              <p className="text-sm text-gray-600 dark:text-gray-300">{policy.description}</p>
            </Card>
          );
        })}
      </div>
    </div>
  );
};

export default ProductDescription;
