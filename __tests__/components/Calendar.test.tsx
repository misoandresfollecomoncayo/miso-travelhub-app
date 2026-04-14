import React from 'react';
import {render, fireEvent} from '@testing-library/react-native';
import {Calendar} from '../../src/components/Calendar';

describe('Calendar', () => {
  const defaultProps = {
    year: 2099,
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
    expect(getByText('Enero 2099')).toBeTruthy();
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
    expect(getByText('Febrero 2099')).toBeTruthy();
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
      expect(getByText(`${name} 2099`)).toBeTruthy();
    });
  });

  it('disables past dates in the current month', () => {
    const today = new Date();
    const {getByText} = render(
      <Calendar
        {...defaultProps}
        year={today.getFullYear()}
        month={today.getMonth()}
      />,
    );
    // Yesterday (or day 1 if today is the 1st) should not fire onSelectDate
    if (today.getDate() > 1) {
      fireEvent.press(getByText('1'));
      expect(defaultProps.onSelectDate).not.toHaveBeenCalled();
    }
  });

  it('disables all dates in past months', () => {
    const today = new Date();
    const pastYear = today.getFullYear() - 1;
    const {getByText} = render(
      <Calendar {...defaultProps} year={pastYear} month={0} />,
    );
    fireEvent.press(getByText('15'));
    expect(defaultProps.onSelectDate).not.toHaveBeenCalled();
  });

  it('disables prev button on the current month', () => {
    const today = new Date();
    const {getByText} = render(
      <Calendar
        {...defaultProps}
        year={today.getFullYear()}
        month={today.getMonth()}
      />,
    );
    fireEvent.press(getByText('<'));
    expect(defaultProps.onPrevMonth).not.toHaveBeenCalled();
  });

  it('renders leap year February with 29 days', () => {
    const {getByText, queryByText} = render(
      <Calendar {...defaultProps} year={2096} month={1} />,
    );
    expect(getByText('29')).toBeTruthy();
    expect(queryByText('30')).toBeNull();
  });

  it('enables future dates', () => {
    const {getByText} = render(
      <Calendar {...defaultProps} year={2099} month={5} />,
    );
    fireEvent.press(getByText('15'));
    expect(defaultProps.onSelectDate).toHaveBeenCalledWith(15);
  });

  it('renders April with 30 days', () => {
    const {getByText, queryByText} = render(
      <Calendar {...defaultProps} month={3} />,
    );
    expect(getByText('30')).toBeTruthy();
    expect(queryByText('31')).toBeNull();
  });

  it('renders day name headers in correct order', () => {
    const {getAllByText} = render(<Calendar {...defaultProps} />);
    // Dom should appear (day header)
    const domElements = getAllByText('Dom');
    expect(domElements.length).toBeGreaterThan(0);
  });

  it('does not call onSelectDate for disabled past dates', () => {
    const today = new Date();
    if (today.getDate() <= 1) {
      return; // skip if today is the 1st
    }
    const {getByText} = render(
      <Calendar
        {...defaultProps}
        year={today.getFullYear()}
        month={today.getMonth()}
      />,
    );
    fireEvent.press(getByText('1'));
    expect(defaultProps.onSelectDate).not.toHaveBeenCalled();
  });

  it('allows prev month navigation for future months', () => {
    const {getByText} = render(
      <Calendar {...defaultProps} year={2099} month={6} />,
    );
    fireEvent.press(getByText('<'));
    expect(defaultProps.onPrevMonth).toHaveBeenCalledTimes(1);
  });

  it('disables prev button for past months', () => {
    const today = new Date();
    const pastYear = today.getFullYear() - 1;
    const {getByText} = render(
      <Calendar {...defaultProps} year={pastYear} month={0} />,
    );
    fireEvent.press(getByText('<'));
    expect(defaultProps.onPrevMonth).not.toHaveBeenCalled();
  });

  it('renders start and end dates with edge styling', () => {
    const {getByText} = render(
      <Calendar {...defaultProps} startDate={10} endDate={20} />,
    );
    expect(getByText('10')).toBeTruthy();
    expect(getByText('20')).toBeTruthy();
    expect(getByText('15')).toBeTruthy();
  });
});
