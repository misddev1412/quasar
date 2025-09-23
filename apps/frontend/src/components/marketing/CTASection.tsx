import { Button } from '@heroui/react';
import Container from '../common/Container';

interface CTASectionProps {
  title: string;
  description?: string;
  primaryAction?: {
    label: string;
    onClick: () => void;
  };
  secondaryAction?: {
    label: string;
    onClick: () => void;
  };
  variant?: 'centered' | 'left' | 'split';
  backgroundImage?: string;
  backgroundColor?: string;
}

export const CTASection: React.FC<CTASectionProps> = ({
  title,
  description,
  primaryAction,
  secondaryAction,
  variant = 'centered',
  backgroundImage,
  backgroundColor = 'bg-gradient-to-r from-blue-600 to-purple-600',
}) => {
  const renderContent = () => {
    if (variant === 'split') {
      return (
        <div className="flex flex-col md:flex-row items-center justify-between gap-8">
          <div className="flex-1">
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
              {title}
            </h2>
            {description && (
              <p className="text-lg text-white/90">{description}</p>
            )}
          </div>
          <div className="flex gap-4">
            {primaryAction && (
              <Button
                size="lg"
                color="secondary"
                onClick={primaryAction.onClick}
                className="font-semibold"
              >
                {primaryAction.label}
              </Button>
            )}
            {secondaryAction && (
              <Button
                size="lg"
                variant="bordered"
                className="font-semibold text-white border-white hover:bg-white/10"
                onClick={secondaryAction.onClick}
              >
                {secondaryAction.label}
              </Button>
            )}
          </div>
        </div>
      );
    }

    const alignment = variant === 'left' ? 'text-left' : 'text-center';

    return (
      <div className={`max-w-3xl ${variant === 'centered' ? 'mx-auto' : ''}`}>
        <h2 className={`text-3xl md:text-4xl font-bold text-white mb-4 ${alignment}`}>
          {title}
        </h2>
        {description && (
          <p className={`text-lg text-white/90 mb-8 ${alignment}`}>
            {description}
          </p>
        )}
        {(primaryAction || secondaryAction) && (
          <div className={`flex gap-4 ${variant === 'centered' ? 'justify-center' : ''}`}>
            {primaryAction && (
              <Button
                size="lg"
                color="secondary"
                onClick={primaryAction.onClick}
                className="font-semibold"
              >
                {primaryAction.label}
              </Button>
            )}
            {secondaryAction && (
              <Button
                size="lg"
                variant="bordered"
                className="font-semibold text-white border-white hover:bg-white/10"
                onClick={secondaryAction.onClick}
              >
                {secondaryAction.label}
              </Button>
            )}
          </div>
        )}
      </div>
    );
  };

  return (
    <section
      className={`relative py-16 md:py-20 ${backgroundColor}`}
      style={{
        backgroundImage: backgroundImage ? `url(${backgroundImage})` : undefined,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
      }}
    >
      {backgroundImage && (
        <div className="absolute inset-0 bg-black/50" />
      )}
      <Container className="relative z-10">
        {renderContent()}
      </Container>
    </section>
  );
};

export default CTASection;