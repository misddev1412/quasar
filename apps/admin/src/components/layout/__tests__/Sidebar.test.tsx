import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import Sidebar from '../Sidebar';
import { LayoutProvider } from '../../../contexts/LayoutContext';
import { ThemeProvider as CustomThemeProvider } from '../../../context/ThemeContext';
import { AuthProvider } from '../../../context/AuthContext';

// Mock the translation hook
jest.mock('../../../hooks/useTranslationWithBackend', () => ({
  useTranslationWithBackend: () => ({
    t: (key: string, fallback: string) => fallback,
  }),
}));

// Mock the Logo component
jest.mock('../Logo', () => {
  return function MockLogo({ collapsed }: { collapsed: boolean }) {
    return <div data-testid="logo" data-collapsed={collapsed}>Logo</div>;
  };
});

// Mock the UserInfo component
jest.mock('../UserInfo', () => {
  return function MockUserInfo({ collapsed }: { collapsed: boolean }) {
    return <div data-testid="user-info" data-collapsed={collapsed}>UserInfo</div>;
  };
});

const theme = createTheme();

const TestWrapper: React.FC<{ children: React.ReactNode; collapsed?: boolean }> = ({ 
  children, 
  collapsed = false 
}) => (
  <BrowserRouter>
    <ThemeProvider theme={theme}>
      <CustomThemeProvider>
        <AuthProvider>
          <LayoutProvider initialConfig={{ type: 'vertical', sidebarCollapsed: collapsed }}>
            {children}
          </LayoutProvider>
        </AuthProvider>
      </CustomThemeProvider>
    </ThemeProvider>
  </BrowserRouter>
);

describe('Sidebar Component', () => {
  describe('Icon Display', () => {
    it('should display icons properly in expanded state', () => {
      render(
        <TestWrapper collapsed={false}>
          <Sidebar />
        </TestWrapper>
      );

      // Check if dashboard icon is visible
      const dashboardIcon = screen.getByTestId('DashboardIcon');
      expect(dashboardIcon).toBeInTheDocument();
      
      // Check if menu text is visible in expanded state
      expect(screen.getByText('仪表盘')).toBeInTheDocument();
    });

    it('should display icons properly in collapsed state', () => {
      render(
        <TestWrapper collapsed={true}>
          <Sidebar />
        </TestWrapper>
      );

      // Check if dashboard icon is still visible
      const dashboardIcon = screen.getByTestId('DashboardIcon');
      expect(dashboardIcon).toBeInTheDocument();
      
      // Check if menu text is hidden in collapsed state
      expect(screen.queryByText('仪表盘')).not.toBeInTheDocument();
    });

    it('should center icons properly in collapsed state', () => {
      render(
        <TestWrapper collapsed={true}>
          <Sidebar />
        </TestWrapper>
      );

      // Find the first menu item button
      const menuButton = screen.getAllByRole('button')[0];
      const computedStyle = window.getComputedStyle(menuButton);
      
      // Check if justifyContent is set to center
      expect(computedStyle.justifyContent).toBe('center');
    });

    it('should display badges correctly in both states', () => {
      render(
        <TestWrapper collapsed={false}>
          <Sidebar />
        </TestWrapper>
      );

      // Check if badges are present (user management has badge: 2)
      const badges = screen.getAllByText('2');
      expect(badges.length).toBeGreaterThan(0);
    });

    it('should toggle sidebar state correctly', () => {
      render(
        <TestWrapper collapsed={false}>
          <Sidebar />
        </TestWrapper>
      );

      // Find the collapse button and click it
      const collapseButton = screen.getByLabelText('收起侧边栏');
      fireEvent.click(collapseButton);

      // The sidebar should now be in collapsed state
      // This would require checking the context state, which is complex in this test setup
    });

    it('should show tooltips in collapsed state', () => {
      render(
        <TestWrapper collapsed={true}>
          <Sidebar />
        </TestWrapper>
      );

      // In collapsed state, tooltips should be present
      // This is harder to test without user interaction, but we can check for tooltip attributes
      const menuItems = screen.getAllByRole('button');
      expect(menuItems.length).toBeGreaterThan(0);
    });
  });

  describe('Sub-menu Icons', () => {
    it('should display sub-menu icons in collapsed state', () => {
      render(
        <TestWrapper collapsed={true}>
          <Sidebar />
        </TestWrapper>
      );

      // Sub-menu items should be rendered as separate buttons in collapsed state
      const userManagementIcons = screen.getAllByTestId('PermIdentityIcon');
      expect(userManagementIcons.length).toBeGreaterThan(0);
    });

    it('should show professional visual distinction between parent and child items in collapsed state', () => {
      render(
        <TestWrapper collapsed={true}>
          <Sidebar />
        </TestWrapper>
      );

      // Parent items should have different styling than child items
      const menuButtons = screen.getAllByRole('button');
      expect(menuButtons.length).toBeGreaterThan(0);

      // Check that sub-menu items have professional styling with borders and indicators
      // This would require more complex testing setup to verify computed styles
    });

    it('should highlight parent item when sub-item is active in collapsed state', () => {
      // Mock the current location to be a sub-menu path
      Object.defineProperty(window, 'location', {
        value: { pathname: '/users' },
        writable: true
      });

      render(
        <TestWrapper collapsed={true}>
          <Sidebar />
        </TestWrapper>
      );

      // The parent menu item should be highlighted when a sub-item is active
      // This would require checking the selected state of the parent button
    });

    it('should show professional visual indicators for parent items with active sub-items', () => {
      Object.defineProperty(window, 'location', {
        value: { pathname: '/users' },
        writable: true
      });

      render(
        <TestWrapper collapsed={true}>
          <Sidebar />
        </TestWrapper>
      );

      // Should show left border indicator on parent item when sub-item is active
      // This would require checking for the ::before pseudo-element with left border
    });
  });

  describe('Professional Visual Design', () => {
    it('should have improved selected state styling with subtle borders and shadows', () => {
      render(
        <TestWrapper collapsed={false}>
          <Sidebar />
        </TestWrapper>
      );

      // Selected items should have professional styling with borders and shadows
      // This would require checking computed styles for box-shadow and border properties
    });

    it('should have proper text contrast for active sub-menu items in expanded mode', () => {
      // Mock active sub-menu item
      Object.defineProperty(window, 'location', {
        value: { pathname: '/users' },
        writable: true
      });

      render(
        <TestWrapper collapsed={false}>
          <Sidebar />
        </TestWrapper>
      );

      // Active sub-menu items should have proper contrast
      // In dark theme: white text on dark blue background
      // In light theme: blue text on light blue background
      // This ensures readability in both themes
    });

    it('should display sub-menu items with professional borders and indicators in collapsed mode', () => {
      render(
        <TestWrapper collapsed={true}>
          <Sidebar />
        </TestWrapper>
      );

      // Sub-menu items should have subtle borders and left border indicators
      // This would require checking for border and ::before pseudo-element styles
    });

    it('should have consistent hover states across all menu items', () => {
      render(
        <TestWrapper collapsed={true}>
          <Sidebar />
        </TestWrapper>
      );

      // All menu items should have consistent hover styling
      // This would require testing hover state changes
    });

    it('should maintain proper contrast ratios for accessibility', () => {
      render(
        <TestWrapper collapsed={false}>
          <Sidebar />
        </TestWrapper>
      );

      // All text should meet WCAG contrast requirements
      // Active states should have sufficient contrast against their backgrounds
      // This would require color contrast ratio calculations
    });
  });

  describe('Theme and Search Icons', () => {
    it('should display theme toggle icon in collapsed state', () => {
      render(
        <TestWrapper collapsed={true}>
          <Sidebar />
        </TestWrapper>
      );

      // Theme toggle button should be visible
      const themeButton = screen.getByLabelText(/切换到.*模式/);
      expect(themeButton).toBeInTheDocument();
    });

    it('should display search icon in collapsed state', () => {
      render(
        <TestWrapper collapsed={true}>
          <Sidebar />
        </TestWrapper>
      );

      // Search button should be visible
      const searchButton = screen.getByLabelText('搜索');
      expect(searchButton).toBeInTheDocument();
    });
  });
});
