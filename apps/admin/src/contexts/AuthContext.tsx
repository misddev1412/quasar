import { createContext, useContext, ReactNode } from 'react';
import { UseAuthReturn, useAuth as useAuthHook } from '../hooks/useAuth';
import { useNavigate } from 'react-router-dom';

export type { UseAuthReturn };

const AuthContext = createContext<UseAuthReturn | undefined>(undefined);


export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const auth = useAuthHook();
  
  return (
    <AuthContext.Provider value={auth}>
      {children}
    </AuthContext.Provider>
  );
};


export const useAuth = (): UseAuthReturn => {
  const context = useContext(AuthContext);
  
  if (context === undefined) {
    throw new Error('useAuth必须在AuthProvider内部使用');
  }
  
  return context;
};


export const withAuth = <P extends object>(
  Component: React.ComponentType<P>
): React.FC<P> => {
  return (props: P) => {
    const { isAuthenticated, isLoading } = useAuth();
    const navigate = useNavigate();

    if (!isLoading && !isAuthenticated) {
      navigate('/auth/login');
      return null;
    }

    if (isLoading) {
      return <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500"></div>
      </div>;
    }

    return isAuthenticated ? <Component {...props} /> : null;
  };
}; 