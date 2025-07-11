import React, { ReactNode } from 'react';

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
              <button
                key={index}
                onClick={action.onClick}
                className={`
                  px-4 py-2 rounded-md flex items-center gap-2 transition-colors
                  ${action.primary 
                    ? 'bg-blue-600 text-white hover:bg-blue-700 focus:ring-blue-500' 
                    : 'bg-gray-100 text-gray-800 hover:bg-gray-200 focus:ring-gray-300'}
                  focus:outline-none focus:ring-2 focus:ring-offset-2 shadow-sm
                `}
              >
                {action.icon && <span>{action.icon}</span>}
                <span>{action.label}</span>
              </button>
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