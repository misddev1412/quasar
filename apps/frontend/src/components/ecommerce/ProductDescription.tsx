import React, { useState } from 'react';
import { Card } from '@heroui/react';
import Button from '../common/Button';
import { FiCheck, FiVideo, FiTruck, FiRefreshCw, FiShield, FiChevronDown, FiChevronUp, FiList } from 'react-icons/fi';
import type { ProductSpecification } from '../../types/product';
import { useTranslations } from 'next-intl';
import { UnifiedIcon } from '../common/UnifiedIcon';

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
  config?: any;
}

const ProductDescription: React.FC<ProductDescriptionProps> = ({
  description,
  features = [],
  specifications = [],
  details = {},
  videos = [],
  className = '',
  expanded = false,
  config,
}) => {
  const t = useTranslations('product.detail.description');
  const [isExpanded, setIsExpanded] = useState(expanded);
  const [isTocOpen, setIsTocOpen] = useState(true);

  // Config toggles
  const showTableOfContents = config?.showTableOfContents !== false;

  const rawDetailLabels = t.raw('details.labels');
  const detailLabels = (rawDetailLabels && typeof rawDetailLabels === 'object'
    ? (rawDetailLabels as Record<string, string>)
    : {});

  // Policies Logic
  const rawPolicies = t.raw('policies');
  const defaultPolicies = Array.isArray(rawPolicies)
    ? (rawPolicies as Array<{ title: string; description: string; icon?: string }>)
    : [];

  const configPolicies = Array.isArray(config?.policies)
    ? (config.policies as Array<{ title: string; description: string; icon?: string }>)
    : [];
  // Use config policies if present, otherwise default
  const policyCards = configPolicies.length > 0 ? configPolicies : defaultPolicies;

  const defaultPolicyIcons = [FiTruck, FiRefreshCw, FiShield];

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

  // Process description to extract headings, inject IDs, and generate hierarchical numbering
  const { processedDescription, tocItems } = React.useMemo(() => {
    const rawHeadings: Array<{ id: string; text: string; level: number }> = [];
    let modifiedHtml = description;

    // Regex to find headings (h2-h4)
    const regex = /<(h[2-4])([^>]*)>(.*?)<\/\1>/gi;

    modifiedHtml = modifiedHtml.replace(regex, (match, tag, attrs, content) => {
      const cleanText = content.replace(/<[^>]*>/g, '').trim();
      if (!cleanText) return match; // Skip empty headings

      const slug = cleanText
        .toLowerCase()
        .replace(/[^\w\s-]/g, '')
        .replace(/\s+/g, '-');

      const id = `toc-${slug}-${rawHeadings.length}`;
      const level = parseInt(tag.charAt(1));

      rawHeadings.push({ id, text: cleanText, level });

      // Inject ID and scroll-margin
      return `<${tag} id="${id}" class="scroll-mt-24 group relative" ${attrs}>
        <span class="absolute -left-6 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity text-primary-500">#</span>
        ${content}
      </${tag}>`;
    });

    // Generate hierarchical numbering (e.g., 1, 1.1, 1.2, 2)
    const counters = [0, 0, 0, 0, 0, 0, 0]; // Index corresponds to level
    const minLevel = rawHeadings.length > 0 ? Math.min(...rawHeadings.map(h => h.level)) : 2;

    const numberedHeadings = rawHeadings.map(heading => {
      const currentLevel = heading.level;

      // Increment current level counter
      counters[currentLevel]++;

      // Reset deeper levels
      for (let i = currentLevel + 1; i < counters.length; i++) {
        counters[i] = 0;
      }

      // Build number string (e.g. "1.2.")
      // We start from minLevel up to currentLevel
      const numberParts = [];
      for (let i = minLevel; i <= currentLevel; i++) {
        numberParts.push(counters[i]);
      }
      const numberString = numberParts.join('.');

      return { ...heading, numberString };
    });

    return { processedDescription: modifiedHtml, tocItems: numberedHeadings };
  }, [description]);

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Main Description */}
      <Card className="border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900/40 shadow-sm p-6">

        {/* Table of Contents */}
        {showTableOfContents && tocItems.length > 0 && (
          <div className="mb-4 rounded-xl border border-gray-200 bg-gray-50/50 dark:border-gray-700 dark:bg-gray-800/50 overflow-hidden">
            <button
              onClick={() => setIsTocOpen(!isTocOpen)}
              className="w-full flex items-center justify-between gap-2 border-b border-gray-200 bg-gray-100/50 px-5 py-3 dark:border-gray-700 dark:bg-gray-800 hover:bg-gray-200/50 dark:hover:bg-gray-700/50 transition-colors"
            >
              <div className="flex items-center gap-2">
                <FiList className="text-xl text-gray-700 dark:text-gray-200" />
                <h4 className="font-semibold text-sm uppercase text-gray-900 dark:text-white m-0">
                  MỤC LỤC
                </h4>
              </div>
              <FiChevronDown
                className={`text-gray-500 transition-transform duration-200 ${isTocOpen ? 'rotate-180' : ''}`}
              />
            </button>

            <div
              className={`transition-all duration-300 ease-in-out overflow-hidden ${isTocOpen ? 'max-h-[1000px] opacity-100' : 'max-h-0 opacity-0'}`}
            >
              <nav className="p-4">
                <ul className="flex flex-col gap-1">
                  {tocItems.map((item) => (
                    <li
                      key={item.id}
                      style={{ paddingLeft: `${(item.level - Math.min(...tocItems.map(i => i.level))) * 1.5}rem` }}
                    >
                      <a
                        href={`#${item.id}`}
                        className="group flex items-start gap-2 py-1.5 text-sm text-gray-600 transition-all hover:text-primary-600 dark:text-gray-400 dark:hover:text-primary-400"
                        onClick={(e) => {
                          e.preventDefault();
                          const element = document.getElementById(item.id);
                          if (element) {
                            element.scrollIntoView({ behavior: 'smooth' });
                            window.history.pushState(null, '', `#${item.id}`);
                          }
                        }}
                      >
                        <span className="flex-shrink-0 font-medium font-mono text-gray-400 group-hover:text-primary-500/70 transition-colors">
                          {item.numberString}
                        </span>
                        <span className="group-hover:underline decoration-primary-300 underline-offset-2">
                          {item.text}
                        </span>
                      </a>
                    </li>
                  ))}
                </ul>
              </nav>
            </div>
          </div>
        )}

        <div className="relative">
          <div
            className={`prose prose-gray dark:prose-invert max-w-none transition-all duration-300 ease-in-out ${isExpanded ? 'max-h-none opacity-100' : 'max-h-[500px] overflow-hidden opacity-90'
              }`}
          >
            <div
              className="text-gray-700 dark:text-gray-300 leading-relaxed"
              dangerouslySetInnerHTML={{ __html: processedDescription }}
            />
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
      {policyCards.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {policyCards.map((policy, index) => {
            const DefaultIcon = defaultPolicyIcons[index % defaultPolicyIcons.length];
            return (
              <Card
                key={`${policy.title}-${index}`}
                className="bg-white dark:bg-gray-900/40 p-4 text-center d-flex items-center"
              >
                {policy.icon ? (
                  <UnifiedIcon icon={policy.icon} className="text-3xl mb-2 mx-auto" />
                ) : (
                  <DefaultIcon className="text-3xl mb-2 mx-auto" />
                )}
                <h5 className="font-medium mb-1">{policy.title}</h5>
                <p className="text-sm text-gray-600 dark:text-gray-300">{policy.description}</p>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default ProductDescription;
