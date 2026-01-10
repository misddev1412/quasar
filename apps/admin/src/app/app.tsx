import React, { useMemo } from 'react';
import { LayoutProvider } from '../contexts/LayoutContext';
import { ThemeProvider as CustomThemeProvider, useTheme } from '../context/ThemeContext';
import { ToastProvider } from '../context/ToastContext';
import { BrowserRouter as Router } from 'react-router-dom';
import { HelmetProvider } from 'react-helmet-async';
import AppRoutes from '../routes/AppRoutes';
import { ThemeProvider as MUIThemeProvider, CssBaseline } from '@mui/material';
import { createTheme } from '@mui/material/styles';
import { AuthProvider } from '../context/AuthContext';
import { FirebaseAuthProvider } from '../hooks/useFirebaseAuth';
import { ModalProvider } from '../context/ModalContext';
import { RouteLoadingProvider } from '../context/RouteLoadingContext';
import RouteLoadingIndicator from '../components/common/RouteLoadingIndicator';
import { DynamicFavicon } from '../components/common/DynamicFavicon';
import { Toaster } from 'react-hot-toast';
import { I18nProvider } from '../contexts/I18nContext';

// Inner component that consumes CustomTheme to generate MUI Theme
const ThemedApp = () => {
  const { theme, currentMode } = useTheme();

  // Create MUI theme based on current custom theme settings
  const muiTheme = useMemo(() => {
    return createTheme({
      palette: {
        mode: currentMode,
        primary: {
          main: theme.colors.primary,
          light: theme.colors.primary, // You might want to generate lighter shades
          dark: theme.colors.primary,  // You might want to generate darker shades
        },
        secondary: {
          main: theme.colors.secondary,
        },
        background: {
          default: currentMode === 'dark' ? theme.modes.dark.background : theme.modes.light.background,
          paper: currentMode === 'dark' ? theme.modes.dark.surface : theme.modes.light.surface,
        }
      },
      typography: {
        fontFamily: theme.fontFamily,
        button: {
          textTransform: 'none', // Modern look
        }
      },
      components: {
        MuiButton: {
          styleOverrides: {
            root: {
              borderRadius: theme.borderRadius === 'none' ? '0px' :
                theme.borderRadius === 'sm' ? '2px' :
                  theme.borderRadius === 'md' ? '8px' :
                    theme.borderRadius === 'lg' ? '12px' : '16px',
            },
          },
        },
        MuiPaper: {
          styleOverrides: {
            root: {
              backgroundImage: 'none', // Remove elevation overlay in dark mode for cleaner look
            }
          }
        }
      },
      shape: {
        borderRadius: theme.borderRadius === 'none' ? 0 :
          theme.borderRadius === 'sm' ? 2 :
            theme.borderRadius === 'md' ? 8 :
              theme.borderRadius === 'lg' ? 12 : 16,
      }
    });
  }, [theme, currentMode]);

  return (
    <MUIThemeProvider theme={muiTheme}>
      <CssBaseline />
      <ToastProvider>
        <ModalProvider>
          <RouteLoadingProvider>
            <LayoutProvider>
              <AuthProvider>
                <FirebaseAuthProvider>
                  <AppRoutes />
                </FirebaseAuthProvider>
              </AuthProvider>
            </LayoutProvider>
            <RouteLoadingIndicator />
          </RouteLoadingProvider>
        </ModalProvider>
      </ToastProvider>
    </MUIThemeProvider>
  );
};

export function App() {
  return (
    <HelmetProvider>
      <DynamicFavicon />
      <Router>
        <CustomThemeProvider>
          <Toaster position="top-right" />
          <I18nProvider>
            <ThemedApp />
          </I18nProvider>
        </CustomThemeProvider>
      </Router>
    </HelmetProvider>
  );
}

export default App;
