import { createContext, useContext, ReactNode } from 'react';
import { UseAuthReturn, useAuth as useAuthHook } from '../hooks/useAuth';
import { useNavigate } from 'react-router-dom';

export type { UseAuthReturn };

// 创建一个默认值为undefined的上下文
const AuthContext = createContext<UseAuthReturn | undefined>(undefined);

/**
 * 身份验证提供者组件，包装应用程序并提供身份验证上下文
 */
export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const auth = useAuthHook();
  
  return (
    <AuthContext.Provider value={auth}>
      {children}
    </AuthContext.Provider>
  );
};

/**
 * 使用身份验证上下文的自定义Hook
 */
export const useAuth = (): UseAuthReturn => {
  const context = useContext(AuthContext);
  
  if (context === undefined) {
    throw new Error('useAuth必须在AuthProvider内部使用');
  }
  
  return context;
};

/**
 * 身份验证保护HOC，包装需要身份验证的组件
 */
export const withAuth = <P extends object>(
  Component: React.ComponentType<P>
): React.FC<P> => {
  return (props: P) => {
    const { isAuthenticated, isLoading } = useAuth();
    const navigate = useNavigate();

    // 如果用户未登录且页面已加载，则重定向到登录页面
    if (!isLoading && !isAuthenticated) {
      navigate('/auth/login');
      return null;
    }

    // 如果页面正在加载，可以显示加载状态
    if (isLoading) {
      return <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500"></div>
      </div>;
    }

    // 渲染被保护的组件
    return isAuthenticated ? <Component {...props} /> : null;
  };
}; 