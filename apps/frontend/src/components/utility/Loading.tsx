import { Spinner } from '@heroui/react';

interface LoadingProps {
  fullScreen?: boolean;
  size?: 'sm' | 'md' | 'lg';
  label?: string;
  overlay?: boolean;
}

export const Loading: React.FC<LoadingProps> = ({
  fullScreen = false,
  size = 'lg',
  label = 'Loading...',
  overlay = false,
}) => {
  const content = (
    <div className="flex flex-col items-center justify-center gap-4">
      <Spinner size={size} color="primary" />
      {label && <p className="text-gray-600">{label}</p>}
    </div>
  );

  if (fullScreen) {
    return (
      <div className="fixed inset-0 flex items-center justify-center bg-white z-50">{content}</div>
    );
  }

  if (overlay) {
    return (
      <div className="absolute inset-0 flex items-center justify-center bg-white/80 backdrop-blur-sm z-10">
        {content}
      </div>
    );
  }

  return <div className="flex items-center justify-center p-8">{content}</div>;
};

export default Loading;
