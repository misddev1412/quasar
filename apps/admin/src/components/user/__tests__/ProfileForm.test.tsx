import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { ProfileForm } from '../ProfileForm';
import { AdminUpdateUserProfileDto } from '../../../../../backend/src/modules/user/dto/admin/admin-user.dto';

// Mock the translation hook
jest.mock('../../hooks/useTranslationWithBackend', () => ({
  useTranslationWithBackend: () => ({
    t: (key: string) => key,
  }),
}));

describe('ProfileForm', () => {
  const mockOnSubmit = jest.fn();
  const initialData: AdminUpdateUserProfileDto = {
    firstName: 'John',
    lastName: 'Doe',
    phone: '123-456-7890',
    dateOfBirth: '1990-01-01',
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should render without infinite re-renders', async () => {
    const renderSpy = jest.fn();
    
    const TestComponent = () => {
      renderSpy();
      return (
        <ProfileForm
          initialData={initialData}
          onSubmit={mockOnSubmit}
          isSubmitting={false}
        />
      );
    };

    render(<TestComponent />);

    // Wait for any potential re-renders to settle
    await waitFor(() => {
      expect(screen.getByDisplayValue('John')).toBeInTheDocument();
    }, { timeout: 1000 });

    // The component should not re-render excessively
    // Allow for initial render + potential useEffect render
    expect(renderSpy).toHaveBeenCalledTimes(1);
  });

  it('should update form data when initialData changes', async () => {
    const { rerender } = render(
      <ProfileForm
        initialData={initialData}
        onSubmit={mockOnSubmit}
        isSubmitting={false}
      />
    );

    // Check initial values
    expect(screen.getByDisplayValue('John')).toBeInTheDocument();
    expect(screen.getByDisplayValue('Doe')).toBeInTheDocument();

    // Update initialData
    const newInitialData = {
      ...initialData,
      firstName: 'Jane',
      lastName: 'Smith',
    };

    rerender(
      <ProfileForm
        initialData={newInitialData}
        onSubmit={mockOnSubmit}
        isSubmitting={false}
      />
    );

    // Check that form data updated
    await waitFor(() => {
      expect(screen.getByDisplayValue('Jane')).toBeInTheDocument();
      expect(screen.getByDisplayValue('Smith')).toBeInTheDocument();
    });
  });

  it('should handle form submission', async () => {
    render(
      <ProfileForm
        initialData={initialData}
        onSubmit={mockOnSubmit}
        isSubmitting={false}
      />
    );

    // Change a field value
    const firstNameInput = screen.getByDisplayValue('John');
    fireEvent.change(firstNameInput, { target: { value: 'Johnny' } });

    // Submit the form
    const form = screen.getByRole('form') || screen.getByTestId('profile-form');
    fireEvent.submit(form);

    await waitFor(() => {
      expect(mockOnSubmit).toHaveBeenCalledWith({
        ...initialData,
        firstName: 'Johnny',
      });
    });
  });

  it('should not cause infinite loops with rapidly changing initialData', async () => {
    let renderCount = 0;
    const TestComponent = ({ data }: { data: AdminUpdateUserProfileDto }) => {
      renderCount++;
      return (
        <ProfileForm
          initialData={data}
          onSubmit={mockOnSubmit}
          isSubmitting={false}
        />
      );
    };

    const { rerender } = render(<TestComponent data={initialData} />);

    // Simulate rapid changes to initialData (like what might happen with tRPC updates)
    for (let i = 0; i < 5; i++) {
      const newData = { ...initialData, firstName: `John${i}` };
      rerender(<TestComponent data={newData} />);
      
      // Small delay to allow React to process
      await new Promise(resolve => setTimeout(resolve, 10));
    }

    // Wait for any potential additional renders to settle
    await waitFor(() => {
      expect(screen.getByDisplayValue('John4')).toBeInTheDocument();
    }, { timeout: 1000 });

    // Should not have excessive renders (allow some tolerance for React's behavior)
    expect(renderCount).toBeLessThan(20); // Much less than what would indicate infinite loop
  });
});
