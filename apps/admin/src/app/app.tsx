import React from 'react';
import { LayoutProvider } from '../contexts/LayoutContext';
import { ThemeProvider as CustomThemeProvider } from '../context/ThemeContext';
import { ToastProvider } from '../context/ToastContext';
import { BrowserRouter as Router } from 'react-router-dom';
import { HelmetProvider } from 'react-helmet-async';
import AppRoutes from '../routes/AppRoutes';
import { ThemeProvider as MUIThemeProvider, CssBaseline } from '@mui/material';
import { createTheme } from '@mui/material/styles';
import { AuthProvider } from '../context/AuthContext';

export function App() {
  // 创建 MUI 主题
  const muiTheme = createTheme({
    // 全局 MUI 主题配置
    palette: {
      primary: {
        main: '#2563eb',
        light: '#3b82f6',
        dark: '#1d4ed8',
      },
      secondary: {
        main: '#0ea5e9',
        light: '#38bdf8',
        dark: '#0369a1',
      },
    },
    components: {
      MuiButton: {
        styleOverrides: {
          root: {
            borderRadius: '8px',
          },
        },
      },
    },
  });

  return (
    <HelmetProvider>
      <Router>
        <MUIThemeProvider theme={muiTheme}>
          <CssBaseline />
          <CustomThemeProvider>
            <ToastProvider>
              <LayoutProvider>
                <AuthProvider>
                  <AppRoutes />
                </AuthProvider>
              </LayoutProvider>
            </ToastProvider>
          </CustomThemeProvider>
        </MUIThemeProvider>
      </Router>
    </HelmetProvider>
  );
}

export default App;
