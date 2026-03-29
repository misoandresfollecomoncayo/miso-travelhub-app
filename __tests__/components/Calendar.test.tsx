import React from 'react';
import {render, fireEvent} from '@testing-library/react-native';
import {Calendar} from '../../src/components/Calendar';

describe('Calendar', () => {
  const defaultProps = {
    year: 2026,
    month: 0, // Enero
    startDate: null as number | null,
    endDate: null as number | null,
    onSelectDate: jest.fn(),
    onPrevMonth: jest.fn(),
    onNextMonth: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders month name and year', () => {
    const {getByText} = render(<Calendar {...defaultProps} />);
    expect(getByText('Enero 2026')).toBeTruthy();
  });

  it('renders day names', () => {
    const {getByText} = render(<Calendar {...defaultProps} />);
    expect(getByText('Dom')).toBeTruthy();
    expect(getByText('Lun')).toBeTruthy();
    expect(getByText('Sáb')).toBeTruthy();
  });

  it('renders days of the month', () => {
    const {getByText} = render(<Calendar {...defaultProps} />);
    expect(getByText('1')).toBeTruthy();
    expect(getByText('15')).toBeTruthy();
    expect(getByText('31')).toBeTruthy();
  });

  it('calls onPrevMonth when prev button pressed', () => {
    const {getByText} = render(<Calendar {...defaultProps} />);
    fireEvent.press(getByText('<'));
    expect(defaultProps.onPrevMonth).toHaveBeenCalledTimes(1);
  });

  it('calls onNextMonth when next button pressed', () => {
    const {getByText} = render(<Calendar {...defaultProps} />);
    fireEvent.press(getByText('>'));
    expect(defaultProps.onNextMonth).toHaveBeenCalledTimes(1);
  });

  it('calls onSelectDate when a day is pressed', () => {
    const {getByText} = render(<Calendar {...defaultProps} />);
    fireEvent.press(getByText('10'));
    expect(defaultProps.onSelectDate).toHaveBeenCalledWith(10);
  });

  it('renders with a date range selected', () => {
    const {getByText} = render(
      <Calendar {...defaultProps} startDate={5} endDate={10} />,
    );
    expect(getByText('5')).toBeTruthy();
    expect(getByText('7')).toBeTruthy();
    expect(getByText('10')).toBeTruthy();
  });

  it('renders with only start date selected', () => {
    const {getByText} = render(
      <Calendar {...defaultProps} startDate={15} endDate={null} />,
    );
    expect(getByText('15')).toBeTruthy();
  });

  it('renders February correctly', () => {
    const {getByText, queryByText} = render(
      <Calendar {...defaultProps} month={1} />,
    );
    expect(getByText('Febrero 2026')).toBeTruthy();
    expect(getByText('28')).toBeTruthy();
    expect(queryByText('29')).toBeNull();
  });

  it('renders all 12 month names correctly', () => {
    const months = [
      'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
      'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre',
    ];
    months.forEach((name, index) => {
      const {getByText} = render(
        <Calendar {...defaultProps} month={index} />,
      );
      expect(getByText(`${name} 2026`)).toBeTruthy();
    });
  });
});
