import React from 'react';
import {render, fireEvent} from '@testing-library/react-native';
import {TermsAndConditionsScreen} from '../../src/screens/TermsAndConditionsScreen';

jest.mock('react-native-vector-icons/Ionicons', () => 'Icon');

const mockGoBack = jest.fn();

jest.mock('@react-navigation/native', () => ({
  useNavigation: () => ({
    goBack: mockGoBack,
  }),
}));

describe('TermsAndConditionsScreen', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders header title', () => {
    const {getByText} = render(<TermsAndConditionsScreen />);
    expect(getByText('Términos y condiciones')).toBeTruthy();
  });

  it('renders body title', () => {
    const {getByText} = render(<TermsAndConditionsScreen />);
    expect(getByText('Términos y condiciones de uso')).toBeTruthy();
  });

  it('renders lorem ipsum body text', () => {
    const {getByTestId} = render(<TermsAndConditionsScreen />);
    const body = getByTestId('terms-body');
    expect(body.props.children).toMatch(/Lorem ipsum/);
  });

  it('calls goBack when back button is pressed', () => {
    const {getByTestId} = render(<TermsAndConditionsScreen />);
    fireEvent.press(getByTestId('terms-back-button'));
    expect(mockGoBack).toHaveBeenCalledTimes(1);
  });
});
