import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import VariantSelectionModal from '../VariantSelectionModal';

// Mock the HeroUI components
jest.mock('@heroui/react', () => ({
  Modal: ({ children, isOpen, onOpenChange }) => (
    isOpen ? <div data-testid="modal">{children}</div> : null
  ),
  ModalContent: ({ children }) => <div data-testid="modal-content">{children}</div>,
  ModalHeader: ({ children }) => <div data-testid="modal-header">{children}</div>,
  ModalBody: ({ children }) => <div data-testid="modal-body">{children}</div>,
  ModalFooter: ({ children }) => <div data-testid="modal-footer">{children}</div>,
  Button: ({ children, onPress, ...props }) => (
    <button {...props} onClick={onPress}>
      {children}
    </button>
  ),
  Divider: () => <hr data-testid="divider" />, 
  Input: ({ onValueChange, value, ...props }) => (
    <input
      {...props}
      value={value}
      onChange={(event) => onValueChange?.(event.target.value)}
    />
  )
}));

const mockAddToCart = jest.fn().mockResolvedValue({ success: true });

jest.mock('../../../hooks/useAddToCart', () => ({
  useAddToCart: () => ({
    addToCart: mockAddToCart,
    isAdding: false,
  }),
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

const mockProductWithUnevenAttributes = {
  id: '2',
  name: 'Uneven Variant Product',
  price: 80,
  isActive: true,
  variants: [
    {
      id: 'variant-a',
      productId: '2',
      name: 'Small Only',
      price: 80,
      stockQuantity: 4,
      isActive: true,
      sortOrder: 0,
      variantItems: [
        {
          id: 'item-a1',
          productVariantId: 'variant-a',
          attributeId: 'attr-size',
          attributeValueId: 'value-small',
          sortOrder: 0,
          attribute: {
            id: 'attr-size',
            name: 'size',
            displayName: 'Size'
          },
          attributeValue: {
            id: 'value-small',
            value: 'S',
            displayValue: 'Small'
          }
        }
      ]
    },
    {
      id: 'variant-b',
      productId: '2',
      name: 'Medium Blue',
      price: 90,
      stockQuantity: 6,
      isActive: true,
      sortOrder: 1,
      variantItems: [
        {
          id: 'item-b1',
          productVariantId: 'variant-b',
          attributeId: 'attr-size',
          attributeValueId: 'value-medium',
          sortOrder: 0,
          attribute: {
            id: 'attr-size',
            name: 'size',
            displayName: 'Size'
          },
          attributeValue: {
            id: 'value-medium',
            value: 'M',
            displayValue: 'Medium'
          }
        },
        {
          id: 'item-b2',
          productVariantId: 'variant-b',
          attributeId: 'attr-color',
          attributeValueId: 'value-blue',
          sortOrder: 1,
          attribute: {
            id: 'attr-color',
            name: 'color',
            displayName: 'Color'
          },
          attributeValue: {
            id: 'value-blue',
            value: 'blue',
            displayValue: 'Blue'
          }
        }
      ]
    }
  ]
};

describe('VariantSelectionModal', () => {
  const mockOnVariantAdded = jest.fn();

  beforeEach(() => {
    mockAddToCart.mockClear();
    mockOnVariantAdded.mockClear();
  });

  it('renders modal when isOpen is true', () => {
    render(
      <VariantSelectionModal
        isOpen={true}
        onOpenChange={jest.fn()}
        product={mockProduct}
        onVariantAdded={mockOnVariantAdded}
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
        onVariantAdded={mockOnVariantAdded}
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
        onVariantAdded={mockOnVariantAdded}
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
        onVariantAdded={mockOnVariantAdded}
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
        onVariantAdded={mockOnVariantAdded}
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

    await waitFor(() => {
      expect(mockAddToCart).toHaveBeenCalled();
      expect(mockOnVariantAdded).toHaveBeenCalledWith(
        expect.objectContaining({
          id: 'variant-1',
          name: 'Small Red',
          price: 100
        }),
        1
      );
      expect(mockOnOpenChange).toHaveBeenCalledWith(false);
    });
  });

  it('shows "No variant found" when invalid combination is selected', async () => {
    render(
      <VariantSelectionModal
        isOpen={true}
        onOpenChange={jest.fn()}
        product={mockProduct}
        onVariantAdded={mockOnVariantAdded}
      />
    );

    // Select invalid combination (Small + Blue doesn't exist)
    fireEvent.click(screen.getByText('Small'));
    fireEvent.click(screen.getByText('Blue'));

    await waitFor(() => {
      expect(screen.getByText('No variant found with selected attributes')).toBeInTheDocument();
    });
  });

  it('enables add to cart when a variant lacks optional attributes', async () => {
    const mockOnOpenChange = jest.fn();

    render(
      <VariantSelectionModal
        isOpen={true}
        onOpenChange={mockOnOpenChange}
        product={mockProductWithUnevenAttributes}
        onVariantAdded={mockOnVariantAdded}
      />
    );

    // Select the size attribute that only exists on the first variant
    fireEvent.click(screen.getByText('Small'));

    const addToCartButton = screen.getByRole('button', { name: 'Add to Cart' });

    await waitFor(() => {
      expect(addToCartButton).not.toBeDisabled();
    });

    fireEvent.click(addToCartButton);

    await waitFor(() => {
      expect(mockAddToCart).toHaveBeenCalled();
      expect(mockOnVariantAdded).toHaveBeenCalledWith(
        expect.objectContaining({ id: 'variant-a' }),
        1
      );
      expect(mockOnOpenChange).toHaveBeenCalledWith(false);
    });
  });
});
