import React from 'react';
import {render, fireEvent} from '@testing-library/react-native';
import {CounterInput} from '../../src/components/CounterInput';

describe('CounterInput', () => {
  const defaultProps = {
    label: 'Adultos',
    value: 2,
    min: 1,
    onIncrement: jest.fn(),
    onDecrement: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders label', () => {
    const {getByText} = render(<CounterInput {...defaultProps} />);
    expect(getByText('Adultos')).toBeTruthy();
  });

  it('renders current value', () => {
    const {getByText} = render(<CounterInput {...defaultProps} />);
    expect(getByText('2')).toBeTruthy();
  });

  it('calls onIncrement when + is pressed', () => {
    const {getByText} = render(<CounterInput {...defaultProps} />);
    fireEvent.press(getByText('+'));
    expect(defaultProps.onIncrement).toHaveBeenCalledTimes(1);
  });

  it('calls onDecrement when - is pressed', () => {
    const {getByText} = render(<CounterInput {...defaultProps} />);
    fireEvent.press(getByText('-'));
    expect(defaultProps.onDecrement).toHaveBeenCalledTimes(1);
  });

  it('disables decrement button when value equals min', () => {
    const {getByText} = render(
      <CounterInput {...defaultProps} value={1} min={1} />,
    );
    fireEvent.press(getByText('-'));
    expect(defaultProps.onDecrement).not.toHaveBeenCalled();
  });

  it('disables decrement button when value is below min', () => {
    const {getByText} = render(
      <CounterInput {...defaultProps} value={0} min={1} />,
    );
    fireEvent.press(getByText('-'));
    expect(defaultProps.onDecrement).not.toHaveBeenCalled();
  });

  it('uses default min of 0 when not provided', () => {
    const {getByText} = render(
      <CounterInput
        label="Test"
        value={0}
        onIncrement={jest.fn()}
        onDecrement={defaultProps.onDecrement}
      />,
    );
    fireEvent.press(getByText('-'));
    expect(defaultProps.onDecrement).not.toHaveBeenCalled();
  });

  it('allows decrement when value is above min', () => {
    const {getByText} = render(
      <CounterInput {...defaultProps} value={5} min={1} />,
    );
    fireEvent.press(getByText('-'));
    expect(defaultProps.onDecrement).toHaveBeenCalledTimes(1);
  });
});
