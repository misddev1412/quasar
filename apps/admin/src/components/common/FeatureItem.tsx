import React from 'react';

interface FeatureItemProps {
  icon: React.ReactNode;
  text: string;
  className?: string;
}

export const FeatureItem: React.FC<FeatureItemProps> = ({
  icon,
  text,
  className = '',
}) => {
  return (
    <div className={`flex items-center gap-4 ${className}`}>
      <div className="p-2 bg-white/10 rounded-lg backdrop-blur-sm">
        {icon}
      </div>
      <span className="text-blue-50 font-medium">{text}</span>
    </div>
  );
};

export default FeatureItem; 