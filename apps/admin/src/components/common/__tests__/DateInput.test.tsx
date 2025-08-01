import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { DateInput } from '../DateInput';

describe('DateInput', () => {
  it('renders with label and input', () => {
    render(
      <DateInput
        id="test-date"
        label="Test Date"
        value="2024-01-15"
        onChange={() => {}}
      />
    );

    expect(screen.getByLabelText('Test Date')).toBeInTheDocument();
    expect(screen.getByDisplayValue('2024-01-15')).toBeInTheDocument();
  });

  it('renders without label when not provided', () => {
    render(
      <DateInput
        id="test-date"
        value="2024-01-15"
        onChange={() => {}}
      />
    );

    expect(screen.getByDisplayValue('2024-01-15')).toBeInTheDocument();
    expect(screen.queryByText('Test Date')).not.toBeInTheDocument();
  });

  it('calls onChange when value changes', () => {
    const mockOnChange = jest.fn();
    render(
      <DateInput
        id="test-date"
        label="Test Date"
        value=""
        onChange={mockOnChange}
      />
    );

    const input = screen.getByLabelText('Test Date');
    fireEvent.change(input, { target: { value: '2024-01-15' } });

    expect(mockOnChange).toHaveBeenCalledWith('2024-01-15');
  });

  it('renders with error state', () => {
    render(
      <DateInput
        id="test-date"
        label="Test Date"
        value=""
        onChange={() => {}}
        error="This field is required"
      />
    );

    expect(screen.getByText('This field is required')).toBeInTheDocument();
    const input = screen.getByLabelText('Test Date');
    expect(input).toHaveClass('text-error');
  });

  it('renders with required indicator', () => {
    render(
      <DateInput
        id="test-date"
        label="Test Date"
        value=""
        onChange={() => {}}
        required
      />
    );

    expect(screen.getByText('*')).toBeInTheDocument();
  });

  it('renders disabled state correctly', () => {
    render(
      <DateInput
        id="test-date"
        label="Test Date"
        value=""
        onChange={() => {}}
        disabled
      />
    );

    const input = screen.getByLabelText('Test Date');
    expect(input).toBeDisabled();
    expect(input).toHaveClass('cursor-not-allowed');
  });

  it('applies min and max attributes', () => {
    render(
      <DateInput
        id="test-date"
        label="Test Date"
        value=""
        onChange={() => {}}
        min="2024-01-01"
        max="2024-12-31"
      />
    );

    const input = screen.getByLabelText('Test Date');
    expect(input).toHaveAttribute('min', '2024-01-01');
    expect(input).toHaveAttribute('max', '2024-12-31');
  });

  it('renders calendar icon', () => {
    render(
      <DateInput
        id="test-date"
        label="Test Date"
        value=""
        onChange={() => {}}
      />
    );

    // Check that the calendar icon SVG is present
    const calendarIcon = screen.getByRole('img', { hidden: true });
    expect(calendarIcon).toBeInTheDocument();
  });

  it('has correct input type', () => {
    render(
      <DateInput
        id="test-date"
        label="Test Date"
        value=""
        onChange={() => {}}
      />
    );

    const input = screen.getByLabelText('Test Date');
    expect(input).toHaveAttribute('type', 'date');
  });

  it('applies custom className', () => {
    render(
      <DateInput
        id="test-date"
        label="Test Date"
        value=""
        onChange={() => {}}
        className="custom-class"
      />
    );

    const container = screen.getByLabelText('Test Date').closest('.space-y-2');
    expect(container).toHaveClass('custom-class');
  });

  it('renders different sizes correctly', () => {
    const { rerender } = render(
      <DateInput
        id="test-date"
        label="Test Date"
        value=""
        onChange={() => {}}
        size="sm"
      />
    );

    let input = screen.getByLabelText('Test Date');
    expect(input).toHaveClass('!h-10');

    rerender(
      <DateInput
        id="test-date"
        label="Test Date"
        value=""
        onChange={() => {}}
        size="md"
      />
    );

    input = screen.getByLabelText('Test Date');
    expect(input).toHaveClass('!h-11');

    rerender(
      <DateInput
        id="test-date"
        label="Test Date"
        value=""
        onChange={() => {}}
        size="lg"
      />
    );

    input = screen.getByLabelText('Test Date');
    expect(input).toHaveClass('!h-12');
  });

  it('has date-input-custom class for calendar picker styling', () => {
    render(
      <DateInput
        id="test-date"
        label="Test Date"
        value=""
        onChange={() => {}}
      />
    );

    const input = screen.getByLabelText('Test Date');
    expect(input).toHaveClass('date-input-custom');
  });
});
