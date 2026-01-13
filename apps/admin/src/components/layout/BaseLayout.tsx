import React, { ReactNode } from 'react';
import Breadcrumb, { BreadcrumbItem } from '../common/Breadcrumb';
import { Button } from '../common/Button';

interface ActionButton {
  label: string;
  onClick: () => void;
  primary?: boolean;
  icon?: ReactNode;
  active?: boolean;
  disabled?: boolean;
}

interface BaseLayoutProps {
  title: string;
  description?: string;
  children: ReactNode;
  actions?: ActionButton[];
  fullWidth?: boolean;
  containerClassName?: string;
  breadcrumbs?: BreadcrumbItem[];
}


const BaseLayout: React.FC<BaseLayoutProps> = ({
  title,
  description,
  children,
  actions = [],
  fullWidth = false,
  containerClassName = '',
  breadcrumbs = []
}) => {
  return (
    <div className={`w-full p-4 sm:p-6 ${!fullWidth ? 'max-w-[1600px] mx-auto' : ''}`}>
      {breadcrumbs.length > 0 && (
        <Breadcrumb items={breadcrumbs} />
      )}

      {}
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center mb-6 gap-4">
        <div>
          <h1 className="text-2xl font-bold mb-1">{title}</h1>
          {description && (
            <p className="text-gray-500">{description}</p>
          )}
        </div>

        {actions.length > 0 && (
          <div className="flex flex-wrap gap-3 justify-end">
            {actions.map((action, index) => (
              <Button
                key={index}
                onClick={action.onClick}
                variant={action.primary ? 'primary' : 'secondary'}
                size="sm"
                startIcon={action.icon}
                active={action.active}
                disabled={action.disabled}
              >
                {action.label}
              </Button>
            ))}
          </div>
        )}
      </div>

      {}
      <div className={containerClassName}>
        {children}
      </div>
    </div>
  );
};

export default BaseLayout; 
