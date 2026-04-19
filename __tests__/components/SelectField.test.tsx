import React from 'react';
import {render, fireEvent} from '@testing-library/react-native';
import {SelectField, SelectOption} from '../../src/components/SelectField';

jest.mock('react-native-vector-icons/Ionicons', () => 'Icon');

const options: SelectOption[] = [
  {value: 'a', label: 'Opción A'},
  {value: 'b', label: 'Opción B'},
  {value: 'c', label: 'Opción C'},
];

describe('SelectField', () => {
  it('renders the label', () => {
    const {getByText} = render(
      <SelectField
        testID="fruit"
        label="Fruta:"
        value=""
        options={options}
        onChange={jest.fn()}
      />,
    );
    expect(getByText('Fruta:')).toBeTruthy();
  });

  it('shows placeholder when no value is selected', () => {
    const {getByText} = render(
      <SelectField
        testID="fruit"
        label="Fruta:"
        value=""
        options={options}
        onChange={jest.fn()}
        placeholder="Elegir..."
      />,
    );
    expect(getByText('Elegir...')).toBeTruthy();
  });

  it('shows the selected option label when value matches', () => {
    const {getByText} = render(
      <SelectField
        testID="fruit"
        label="Fruta:"
        value="b"
        options={options}
        onChange={jest.fn()}
      />,
    );
    expect(getByText('Opción B')).toBeTruthy();
  });

  it('opens the modal sheet when trigger is pressed', () => {
    const {getByTestId, queryByTestId} = render(
      <SelectField
        testID="fruit"
        label="Fruta:"
        value="a"
        options={options}
        onChange={jest.fn()}
      />,
    );
    expect(queryByTestId('fruit-sheet')).toBeNull();
    fireEvent.press(getByTestId('fruit'));
    expect(getByTestId('fruit-sheet')).toBeTruthy();
  });

  it('calls onChange with selected value and closes the modal', () => {
    const onChange = jest.fn();
    const {getByTestId, queryByTestId} = render(
      <SelectField
        testID="fruit"
        label="Fruta:"
        value="a"
        options={options}
        onChange={onChange}
      />,
    );
    fireEvent.press(getByTestId('fruit'));
    fireEvent.press(getByTestId('fruit-option-c'));
    expect(onChange).toHaveBeenCalledWith('c');
    expect(queryByTestId('fruit-sheet')).toBeNull();
  });

  it('does not open the modal when disabled', () => {
    const {getByTestId, queryByTestId} = render(
      <SelectField
        testID="fruit"
        label="Fruta:"
        value="a"
        options={options}
        onChange={jest.fn()}
        disabled
      />,
    );
    fireEvent.press(getByTestId('fruit'));
    expect(queryByTestId('fruit-sheet')).toBeNull();
  });

  it('closes the modal when the backdrop is pressed', () => {
    const {getByTestId, queryByTestId} = render(
      <SelectField
        testID="fruit"
        label="Fruta:"
        value="a"
        options={options}
        onChange={jest.fn()}
      />,
    );
    fireEvent.press(getByTestId('fruit'));
    fireEvent.press(getByTestId('fruit-backdrop'));
    expect(queryByTestId('fruit-sheet')).toBeNull();
  });
});
