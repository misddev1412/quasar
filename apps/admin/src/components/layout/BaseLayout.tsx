import React, { ReactNode } from 'react';
import { Button } from '../common/Button';

interface ActionButton {
  label: string;
  onClick: () => void;
  primary?: boolean;
  icon?: ReactNode;
}

interface BaseLayoutProps {
  title: string;
  description?: string;
  children: ReactNode;
  actions?: ActionButton[];
  fullWidth?: boolean;
  containerClassName?: string;
}

/**
 * 基础布局组件 - 提供统一的页面布局结构
 * 
 * 使用方法：
 * <BaseLayout 
 *   title="页面标题" 
 *   description="页面描述" 
 *   actions={[{ label: '按钮', onClick: handleClick, primary: true }]}
 * >
 *   {页面内容}
 * </BaseLayout>
 */
const BaseLayout: React.FC<BaseLayoutProps> = ({
  title,
  description,
  children,
  actions = [],
  fullWidth = false,
  containerClassName = ''
}) => {
  return (
    <div className={`w-full p-4 sm:p-6 ${!fullWidth ? 'max-w-[1600px] mx-auto' : ''}`}>
      {/* 页面顶部：标题和操作按钮 */}
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
              >
                {action.label}
              </Button>
            ))}
          </div>
        )}
      </div>

      {/* 主内容区域 */}
      <div className={containerClassName}>
        {children}
      </div>
    </div>
  );
};

export default BaseLayout; 