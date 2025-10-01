import React, { useState } from 'react';
import { Button, Card, Chip } from '@heroui/react';
import { FiCheck, FiVideo, FiTruck, FiRefreshCw, FiShield } from 'react-icons/fi';

interface ProductDescriptionProps {
  description: string;
  features?: string[];
  specifications?: Record<string, string | number>;
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
  specifications = {},
  details = {},
  videos = [],
  className = '',
  expanded = false,
}) => {
  const [isExpanded, setIsExpanded] = useState(expanded);

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
        {Object.entries(specifications).map(([key, value]) => (
          <div key={key} className="flex justify-between items-center p-3 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg">
            <span className="font-medium text-gray-700 dark:text-gray-300 capitalize">
              {key.replace(/([A-Z])/g, ' $1').trim()}:
            </span>
            <span className="text-gray-600 dark:text-gray-400">
              {typeof value === 'number' ? value.toString() : value}
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
          <h5 className="font-medium mb-2">Materials</h5>
          <p className="text-gray-700 dark:text-gray-300">{details.materials}</p>
        </div>
      )}

      {details.dimensions && (
        <div>
          <h5 className="font-medium mb-2">Dimensions</h5>
          <p className="text-gray-700 dark:text-gray-300">{details.dimensions}</p>
        </div>
      )}

      {details.weight && (
        <div>
          <h5 className="font-medium mb-2">Weight</h5>
          <p className="text-gray-700 dark:text-gray-300">{details.weight}</p>
        </div>
      )}

      {details.origin && (
        <div>
          <h5 className="font-medium mb-2">Origin</h5>
          <p className="text-gray-700 dark:text-gray-300">{details.origin}</p>
        </div>
      )}

      {details.warranty && (
        <div>
          <h5 className="font-medium mb-2">Warranty</h5>
          <p className="text-gray-700 dark:text-gray-300">{details.warranty}</p>
        </div>
      )}

      {details.careInstructions && details.careInstructions.length > 0 && (
        <div>
          <h5 className="font-medium mb-2">Care Instructions</h5>
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
                Watch Video
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
        <div className="flex justify-between items-start mb-4">
          <h3 className="text-xl font-semibold">Description</h3>
          <Button
            variant="flat"
            size="sm"
            onPress={() => setIsExpanded(!isExpanded)}
          >
            {isExpanded ? 'Show Less' : 'Read More'}
          </Button>
        </div>

        <div className={`prose prose-gray dark:prose-invert max-w-none ${
          isExpanded ? '' : 'line-clamp-3'
        }`}>
          <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
            {description}
          </p>
        </div>
      </Card>

      {/* Supporting Sections */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        {features.length > 0 && (
          <Card className="border border-gray-200 dark:border-gray-700 shadow-sm">
            <div className="flex items-center justify-between border-b border-gray-200 px-6 py-4 dark:border-gray-700">
              <h4 className="text-lg font-semibold">Key Features</h4>
              <Chip size="sm" variant="flat">{features.length}</Chip>
            </div>
            {renderFeatures()}
          </Card>
        )}

        {Object.keys(specifications).length > 0 && (
          <Card className="border border-gray-200 dark:border-gray-700 shadow-sm">
            <div className="flex items-center justify-between border-b border-gray-200 px-6 py-4 dark:border-gray-700">
              <h4 className="text-lg font-semibold">Specifications</h4>
              <Chip size="sm" variant="flat">{Object.keys(specifications).length}</Chip>
            </div>
            {renderSpecifications()}
          </Card>
        )}

        {Object.keys(details).length > 0 && (
          <Card className="border border-gray-200 dark:border-gray-700 shadow-sm lg:col-span-2">
            <div className="border-b border-gray-200 px-6 py-4 dark:border-gray-700">
              <h4 className="text-lg font-semibold">Product Details</h4>
            </div>
            {renderDetails()}
          </Card>
        )}

        {videos.length > 0 && (
          <Card className="border border-gray-200 dark:border-gray-700 shadow-sm lg:col-span-2">
            <div className="flex items-center justify-between border-b border-gray-200 px-6 py-4 dark:border-gray-700">
              <h4 className="text-lg font-semibold">Product Videos</h4>
              <Chip size="sm" variant="flat">{videos.length}</Chip>
            </div>
            {renderVideos()}
          </Card>
        )}
      </div>

      {/* Quick Info Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="p-4 text-center">
          <FiTruck className="text-3xl mb-2" />
          <h5 className="font-medium mb-1">Free Shipping</h5>
          <p className="text-sm text-gray-600">On orders over $50</p>
        </Card>

        <Card className="p-4 text-center">
          <FiRefreshCw className="text-3xl mb-2" />
          <h5 className="font-medium mb-1">Easy Returns</h5>
          <p className="text-sm text-gray-600">30-day return policy</p>
        </Card>

        <Card className="p-4 text-center">
          <FiShield className="text-3xl mb-2" />
          <h5 className="font-medium mb-1">Warranty</h5>
          <p className="text-sm text-gray-600">1-year coverage included</p>
        </Card>
      </div>
    </div>
  );
};

export default ProductDescription;
