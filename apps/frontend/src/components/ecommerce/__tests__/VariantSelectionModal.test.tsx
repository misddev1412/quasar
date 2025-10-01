import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import VariantSelectionModal from '../VariantSelectionModal';

// Mock the HeroUI components
jest.mock('@heroui/react', () => ({
  Modal: ({ children, isOpen, onOpenChange }: any) => (
    isOpen ? <div data-testid="modal">{children}</div> : null
  ),
  ModalContent: ({ children }: any) => <div data-testid="modal-content">{children}</div>,
  ModalHeader: ({ children }: any) => <div data-testid="modal-header">{children}</div>,
  ModalBody: ({ children }: any) => <div data-testid="modal-body">{children}</div>,
  ModalFooter: ({ children }: any) => <div data-testid="modal-footer">{children}</div>,
  Button: ({ children, onPress, ...props }: any) => (
    <button {...props} onClick={onPress}>
      {children}
    </button>
  ),
  Divider: () => <hr data-testid="divider" />, 
  Input: ({ onValueChange, value, ...props }: any) => (
    <input
      {...props}
      value={value}
      onChange={(event) => onValueChange?.(event.target.value)}
    />
  )
}));

const mockProduct = {
  id: '1',
  name: 'Test Product',
  price: 100,
  isActive: true,
  variants: [
    {
      id: 'variant-1',
      productId: '1',
      name: 'Small Red',
      price: 100,
      stockQuantity: 10,
      isActive: true,
      sortOrder: 0,
      variantItems: [
        {
          id: 'item-1',
          productVariantId: 'variant-1',
          attributeId: 'attr-1',
          attributeValueId: 'value-1',
          sortOrder: 0,
          attribute: {
            id: 'attr-1',
            name: 'size',
            displayName: 'Size'
          },
          attributeValue: {
            id: 'value-1',
            value: 'S',
            displayValue: 'Small'
          }
        },
        {
          id: 'item-2',
          productVariantId: 'variant-1',
          attributeId: 'attr-2',
          attributeValueId: 'value-3',
          sortOrder: 0,
          attribute: {
            id: 'attr-2',
            name: 'color',
            displayName: 'Color'
          },
          attributeValue: {
            id: 'value-3',
            value: 'red',
            displayValue: 'Red'
          }
        }
      ]
    },
    {
      id: 'variant-2',
      productId: '1',
      name: 'Medium Blue',
      price: 120,
      stockQuantity: 5,
      isActive: true,
      sortOrder: 1,
      variantItems: [
        {
          id: 'item-3',
          productVariantId: 'variant-2',
          attributeId: 'attr-1',
          attributeValueId: 'value-2',
          sortOrder: 0,
          attribute: {
            id: 'attr-1',
            name: 'size',
            displayName: 'Size'
          },
          attributeValue: {
            id: 'value-2',
            value: 'M',
            displayValue: 'Medium'
          }
        },
        {
          id: 'item-4',
          productVariantId: 'variant-2',
          attributeId: 'attr-2',
          attributeValueId: 'value-4',
          sortOrder: 0,
          attribute: {
            id: 'attr-2',
            name: 'color',
            displayName: 'Color'
          },
          attributeValue: {
            id: 'value-4',
            value: 'blue',
            displayValue: 'Blue'
          }
        }
      ]
    }
  ]
};

describe('VariantSelectionModal', () => {
  const mockOnVariantSelect = jest.fn();

  beforeEach(() => {
    mockOnVariantSelect.mockClear();
  });

  it('renders modal when isOpen is true', () => {
    render(
      <VariantSelectionModal
        isOpen={true}
        onOpenChange={jest.fn()}
        product={mockProduct}
        onVariantSelect={mockOnVariantSelect}
      />
    );

    expect(screen.getByTestId('modal')).toBeInTheDocument();
    expect(screen.getByText('Select Variant')).toBeInTheDocument();
    expect(screen.getByText('Test Product')).toBeInTheDocument();
  });

  it('does not render modal when isOpen is false', () => {
    render(
      <VariantSelectionModal
        isOpen={false}
        onOpenChange={jest.fn()}
        product={mockProduct}
        onVariantSelect={mockOnVariantSelect}
      />
    );

    expect(screen.queryByTestId('modal')).not.toBeInTheDocument();
  });

  it('displays attribute selection buttons', () => {
    render(
      <VariantSelectionModal
        isOpen={true}
        onOpenChange={jest.fn()}
        product={mockProduct}
        onVariantSelect={mockOnVariantSelect}
      />
    );

    expect(screen.getByText('Size')).toBeInTheDocument();
    expect(screen.getByText('Color')).toBeInTheDocument();
    expect(screen.getByText('Small')).toBeInTheDocument();
    expect(screen.getByText('Medium')).toBeInTheDocument();
    expect(screen.getByText('Red')).toBeInTheDocument();
    expect(screen.getByText('Blue')).toBeInTheDocument();
  });

  it('allows attribute selection and shows variant info', async () => {
    render(
      <VariantSelectionModal
        isOpen={true}
        onOpenChange={jest.fn()}
        product={mockProduct}
        onVariantSelect={mockOnVariantSelect}
      />
    );

    // Select size Small
    fireEvent.click(screen.getByText('Small'));
    // Select color Red
    fireEvent.click(screen.getByText('Red'));

    await waitFor(() => {
      expect(screen.getByText('Selected Variant')).toBeInTheDocument();
      expect(screen.getByText('$100.00')).toBeInTheDocument();
    });
  });

  it('calls onVariantSelect when Add to Cart is clicked', async () => {
    const mockOnOpenChange = jest.fn();
    render(
      <VariantSelectionModal
        isOpen={true}
        onOpenChange={mockOnOpenChange}
        product={mockProduct}
        onVariantSelect={mockOnVariantSelect}
      />
    );

    // Select attributes
    fireEvent.click(screen.getByText('Small'));
    fireEvent.click(screen.getByText('Red'));

    // Wait for variant to be selected
    await waitFor(() => {
      expect(screen.getByText('Selected Variant')).toBeInTheDocument();
    });

    // Click Add to Cart
    fireEvent.click(screen.getByText('Add to Cart'));

    expect(mockOnVariantSelect).toHaveBeenCalledWith(
      expect.objectContaining({
        id: 'variant-1',
        name: 'Small Red',
        price: 100
      }),
      1
    );
    expect(mockOnOpenChange).toHaveBeenCalledWith(false);
  });

  it('shows "No variant found" when invalid combination is selected', async () => {
    render(
      <VariantSelectionModal
        isOpen={true}
        onOpenChange={jest.fn()}
        product={mockProduct}
        onVariantSelect={mockOnVariantSelect}
      />
    );

    // Select invalid combination (Small + Blue doesn't exist)
    fireEvent.click(screen.getByText('Small'));
    fireEvent.click(screen.getByText('Blue'));

    await waitFor(() => {
      expect(screen.getByText('No variant found with selected attributes')).toBeInTheDocument();
    });
  });
});
