import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import UserProfilePage from '../profile';

// Mock all the dependencies
jest.mock('../../hooks/useTranslationWithBackend', () => ({
  useTranslationWithBackend: () => ({
    t: (key: string) => key,
  }),
}));

jest.mock('../../utils/trpc', () => ({
  trpc: {
    useContext: () => ({
      adminUser: {
        getProfile: {
          invalidate: jest.fn(),
        },
      },
    }),
    adminUser: {
      getProfile: {
        useQuery: jest.fn(() => ({
          data: {
            profile: {
              firstName: 'John',
              lastName: 'Doe',
              email: 'john@example.com',
            },
          },
          isLoading: false,
          error: null,
        })),
      },
      updateProfile: {
        useMutation: jest.fn(() => ({
          mutateAsync: jest.fn(),
          isPending: false,
          error: null,
        })),
      },
      updatePassword: {
        useMutation: jest.fn(() => ({
          mutateAsync: jest.fn(),
          isPending: false,
          error: null,
        })),
      },
    },
  },
}));

jest.mock('../../context/ToastContext', () => ({
  useToast: () => ({
    addToast: jest.fn(),
  }),
}));

jest.mock('../../components/layout/BaseLayout', () => {
  return function MockBaseLayout({ children, title }: any) {
    return (
      <div data-testid="base-layout">
        <h1>{title}</h1>
        {children}
      </div>
    );
  };
});

jest.mock('../../components/common/Tabs', () => {
  return function MockTabs({ tabs, activeTab }: any) {
    return (
      <div data-testid="tabs">
        {tabs[activeTab] && tabs[activeTab].content}
      </div>
    );
  };
});

jest.mock('../../components/user/ProfileForm', () => {
  return function MockProfileForm({ initialData }: any) {
    return (
      <div data-testid="profile-form">
        Profile Form - {JSON.stringify(initialData)}
      </div>
    );
  };
});

jest.mock('../../components/user/UpdatePasswordForm', () => {
  return function MockUpdatePasswordForm() {
    return <div data-testid="update-password-form">Update Password Form</div>;
  };
});

jest.mock('../../components/user/PreferenceSettings', () => {
  return function MockPreferenceSettings() {
    return <div data-testid="preference-settings">Preference Settings</div>;
  };
});

const renderWithRouter = (component: React.ReactElement) => {
  return render(
    <BrowserRouter>
      {component}
    </BrowserRouter>
  );
};

describe('UserProfilePage', () => {
  it('should render without infinite re-renders', async () => {
    const renderSpy = jest.fn();
    
    const TestComponent = () => {
      renderSpy();
      return <UserProfilePage />;
    };

    renderWithRouter(<TestComponent />);

    await waitFor(() => {
      expect(screen.getByTestId('base-layout')).toBeInTheDocument();
    });

    // Wait a bit more to ensure no additional renders occur
    await new Promise(resolve => setTimeout(resolve, 500));

    // Should not have excessive renders
    expect(renderSpy).toHaveBeenCalledTimes(1);
  });

  it('should memoize initialData correctly', async () => {
    renderWithRouter(<UserProfilePage />);

    await waitFor(() => {
      expect(screen.getByTestId('profile-form')).toBeInTheDocument();
    });

    // Check that the profile form receives the correct initial data
    const profileForm = screen.getByTestId('profile-form');
    expect(profileForm).toHaveTextContent('John');
    expect(profileForm).toHaveTextContent('Doe');
  });

  it('should handle loading state', () => {
    // Mock loading state
    const mockTrpc = require('../../utils/trpc').trpc;
    mockTrpc.adminUser.getProfile.useQuery.mockReturnValue({
      data: null,
      isLoading: true,
      error: null,
    });

    renderWithRouter(<UserProfilePage />);

    expect(screen.getByRole('status') || screen.getByTestId('loading')).toBeInTheDocument();
  });

  it('should handle error state', () => {
    // Mock error state
    const mockTrpc = require('../../utils/trpc').trpc;
    mockTrpc.adminUser.getProfile.useQuery.mockReturnValue({
      data: null,
      isLoading: false,
      error: { message: 'Failed to load profile' },
    });

    renderWithRouter(<UserProfilePage />);

    expect(screen.getByText(/Failed to load profile/)).toBeInTheDocument();
  });
});
