import { Card, CardBody, CardHeader } from '@heroui/react';
import Container from '../common/Container';

export interface Feature {
  title: string;
  description: string;
  icon?: React.ReactNode;
  image?: string;
}

interface FeatureGridProps {
  title?: string;
  subtitle?: string;
  features: Feature[];
  columns?: 2 | 3 | 4;
  variant?: 'card' | 'simple' | 'centered';
}

export const FeatureGrid: React.FC<FeatureGridProps> = ({
  title,
  subtitle,
  features,
  columns = 3,
  variant = 'card',
}) => {
  const gridColumns = {
    2: 'md:grid-cols-2',
    3: 'md:grid-cols-3',
    4: 'md:grid-cols-2 lg:grid-cols-4',
  };

  const renderFeature = (feature: Feature, index: number) => {
    if (variant === 'card') {
      return (
        <Card key={index} shadow="md" className="hover:scale-105 transition-transform">
          {feature.image && (
            <img
              src={feature.image}
              alt={feature.title}
              className="w-full h-48 object-cover"
            />
          )}
          <CardHeader className="pb-2">
            <div className="flex items-center gap-3">
              {feature.icon && <div className="text-3xl">{feature.icon}</div>}
              <h3 className="text-xl font-semibold">{feature.title}</h3>
            </div>
          </CardHeader>
          <CardBody className="pt-2">
            <p className="text-gray-600">{feature.description}</p>
          </CardBody>
        </Card>
      );
    }

    if (variant === 'centered') {
      return (
        <div key={index} className="text-center">
          {feature.icon && (
            <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-100 rounded-full mb-4">
              <span className="text-2xl">{feature.icon}</span>
            </div>
          )}
          <h3 className="text-xl font-semibold mb-2">{feature.title}</h3>
          <p className="text-gray-600">{feature.description}</p>
        </div>
      );
    }

    // Simple variant
    return (
      <div key={index} className="flex gap-4">
        {feature.icon && (
          <div className="flex-shrink-0 text-3xl text-blue-600">
            {feature.icon}
          </div>
        )}
        <div>
          <h3 className="text-lg font-semibold mb-1">{feature.title}</h3>
          <p className="text-gray-600">{feature.description}</p>
        </div>
      </div>
    );
  };

  return (
    <section className="py-16 bg-gray-50">
      <Container>
        {(title || subtitle) && (
          <div className="text-center mb-12">
            {subtitle && (
              <span className="text-sm font-semibold text-blue-600 uppercase tracking-wider">
                {subtitle}
              </span>
            )}
            {title && (
              <h2 className="text-3xl md:text-4xl font-bold mt-2">{title}</h2>
            )}
          </div>
        )}

        <div className={`grid grid-cols-1 ${gridColumns[columns]} gap-8`}>
          {features.map(renderFeature)}
        </div>
      </Container>
    </section>
  );
};

export default FeatureGrid;