import { Card, CardBody } from '@heroui/react';

interface AlertProps {
  type: 'success' | 'error' | 'warning' | 'info';
  title?: string;
  message: string;
  icon?: React.ReactNode;
  onClose?: () => void;
}

const alertStyles = {
  success: 'bg-green-50 border-green-200 text-green-800',
  error: 'bg-red-50 border-red-200 text-red-800',
  warning: 'bg-yellow-50 border-yellow-200 text-yellow-800',
  info: 'bg-blue-50 border-blue-200 text-blue-800',
};

const defaultIcons = {
  success: '✓',
  error: '✕',
  warning: '⚠',
  info: 'ℹ',
};

export const Alert: React.FC<AlertProps> = ({
  type,
  title,
  message,
  icon,
  onClose,
}) => {
  return (
    <Card className={`border ${alertStyles[type]} p-4`}>
      <CardBody className="p-0">
        <div className="flex items-start gap-3">
          <span className="text-2xl">{icon || defaultIcons[type]}</span>
          <div className="flex-1">
            {title && <h4 className="font-semibold mb-1">{title}</h4>}
            <p className="text-sm">{message}</p>
          </div>
          {onClose && (
            <button
              onClick={onClose}
              className="text-xl hover:opacity-70 transition-opacity"
            >
              ×
            </button>
          )}
        </div>
      </CardBody>
    </Card>
  );
};

export default Alert;