import { Button } from '@heroui/react';
import Container from '../common/Container';

interface HeroSectionProps {
  title: string;
  subtitle?: string;
  description?: string;
  primaryAction?: {
    label: string;
    onClick: () => void;
  };
  secondaryAction?: {
    label: string;
    onClick: () => void;
  };
  backgroundImage?: string;
  backgroundGradient?: string;
  alignment?: 'left' | 'center' | 'right';
  minHeight?: string;
}

export const HeroSection: React.FC<HeroSectionProps> = ({
  title,
  subtitle,
  description,
  primaryAction,
  secondaryAction,
  backgroundImage,
  backgroundGradient = 'from-blue-600 to-purple-700',
  alignment = 'center',
  minHeight = 'min-h-[600px]',
}) => {
  const alignmentClasses = {
    left: 'text-left items-start',
    center: 'text-center items-center',
    right: 'text-right items-end',
  };

  return (
    <section
      className={`relative ${minHeight} flex items-center py-20 overflow-hidden`}
      style={{
        backgroundImage: backgroundImage ? `url(${backgroundImage})` : undefined,
      }}
    >
      {/* Background overlay */}
      {!backgroundImage && (
        <div className={`absolute inset-0 bg-gradient-to-br ${backgroundGradient}`} />
      )}
      {backgroundImage && <div className="absolute inset-0 bg-black/50" />}

      <Container className="relative z-10">
        <div className={`flex flex-col ${alignmentClasses[alignment]} max-w-4xl mx-auto`}>
          {subtitle && (
            <span className="text-sm font-semibold text-white/90 uppercase tracking-wider mb-4">
              {subtitle}
            </span>
          )}

          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-6">{title}</h1>

          {description && (
            <p className="text-lg md:text-xl text-white/90 mb-8 max-w-2xl">{description}</p>
          )}

          {(primaryAction || secondaryAction) && (
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              {primaryAction && (
                <Button
                  size="lg"
                  color="secondary"
                  variant="solid"
                  onClick={primaryAction.onClick}
                  className="font-semibold px-8"
                >
                  {primaryAction.label}
                </Button>
              )}
              {secondaryAction && (
                <Button
                  size="lg"
                  variant="bordered"
                  className="font-semibold px-8 text-white border-white hover:bg-white/10"
                  onClick={secondaryAction.onClick}
                >
                  {secondaryAction.label}
                </Button>
              )}
            </div>
          )}
        </div>
      </Container>

      {/* Decorative elements */}
      <div className="absolute bottom-0 left-0 right-0">
        <svg className="w-full h-24 text-white" viewBox="0 0 1440 74" fill="currentColor">
          <path d="M0,32L48,37.3C96,43,192,53,288,56C384,59,480,53,576,48C672,43,768,37,864,32C960,27,1056,21,1152,26.7C1248,32,1344,48,1392,56L1440,64L1440,74L1392,74C1344,74,1248,74,1152,74C1056,74,960,74,864,74C768,74,672,74,576,74C480,74,384,74,288,74C192,74,96,74,48,74L0,74Z" />
        </svg>
      </div>
    </section>
  );
};

export default HeroSection;
