import { Card, CardBody, CardHeader, Button, Chip } from '@heroui/react';

interface PricingFeature {
  text: string;
  included: boolean;
}

interface PricingCardProps {
  title: string;
  description?: string;
  price: string;
  currency?: string;
  period?: string;
  features: PricingFeature[];
  highlighted?: boolean;
  badge?: string;
  buttonText?: string;
  onSelect?: () => void;
}

export const PricingCard: React.FC<PricingCardProps> = ({
  title,
  description,
  price,
  currency = '$',
  period = '/month',
  features,
  highlighted = false,
  badge,
  buttonText = 'Get Started',
  onSelect,
}) => {
  return (
    <Card
      className={`
        relative p-6 h-full
        ${highlighted ? 'border-2 border-blue-600 shadow-xl scale-105' : 'border border-gray-200'}
      `}
    >
      {badge && (
        <Chip color="primary" className="absolute -top-3 left-1/2 transform -translate-x-1/2">
          {badge}
        </Chip>
      )}

      <CardHeader className="pb-8 pt-4">
        <div className="w-full">
          <h3 className="text-2xl font-bold text-center">{title}</h3>
          {description && <p className="text-gray-600 text-center mt-2">{description}</p>}
          <div className="text-center mt-6">
            <span className="text-4xl font-bold">
              {currency}
              {price}
            </span>
            <span className="text-gray-600 ml-2">{period}</span>
          </div>
        </div>
      </CardHeader>

      <CardBody className="py-4">
        <ul className="space-y-3 mb-8">
          {features.map((feature, index) => (
            <li key={index} className="flex items-center gap-3">
              {feature.included ? (
                <svg
                  className="w-5 h-5 text-green-500 flex-shrink-0"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                    clipRule="evenodd"
                  />
                </svg>
              ) : (
                <svg
                  className="w-5 h-5 text-gray-400 flex-shrink-0"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                    clipRule="evenodd"
                  />
                </svg>
              )}
              <span className={feature.included ? '' : 'text-gray-400'}>{feature.text}</span>
            </li>
          ))}
        </ul>

        <Button
          color={highlighted ? 'primary' : 'default'}
          size="lg"
          className="w-full font-semibold"
          onClick={onSelect}
        >
          {buttonText}
        </Button>
      </CardBody>
    </Card>
  );
};

export default PricingCard;
