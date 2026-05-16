import React from 'react';
import {act, render} from '@testing-library/react-native';
import {NotificationOpenHandler} from '../../src/notifications/NotificationOpenHandler';

// Capturamos el callback que el handler registra contra el evento de
// background-tap, para disparar manualmente desde cada test.
let mockBackgroundCallback:
  | ((msg: Record<string, unknown>) => void)
  | null = null;
const mockBackgroundUnsubscribe = jest.fn();

let mockGetInitialNotification: jest.Mock = jest.fn(() => Promise.resolve(null));

jest.mock('../../src/services/notifications', () => ({
  onNotificationOpenedFromBackground: (
    cb: (msg: Record<string, unknown>) => void,
  ) => {
    mockBackgroundCallback = cb;
    return mockBackgroundUnsubscribe;
  },
  getInitialNotification: () => mockGetInitialNotification(),
}));

const mockNavigateToReservations = jest.fn((): Promise<void> => Promise.resolve());
const mockNavigateToBooking = jest.fn(
  (_id: string): Promise<void> => Promise.resolve(),
);
jest.mock('../../src/navigation/navigationRef', () => ({
  navigateToReservations: () => mockNavigateToReservations(),
  navigateToBooking: (id: string) => mockNavigateToBooking(id),
}));

const flushAsync = () => act(() => Promise.resolve());

describe('NotificationOpenHandler', () => {
  beforeEach(() => {
    mockBackgroundCallback = null;
    mockBackgroundUnsubscribe.mockClear();
    mockNavigateToReservations.mockClear();
    mockNavigateToBooking.mockClear();
    mockGetInitialNotification = jest.fn(() => Promise.resolve(null));
  });

  it('does NOT render any visible output', () => {
    const {toJSON} = render(<NotificationOpenHandler />);
    expect(toJSON()).toBeNull();
  });

  it('navigates to Reservas when a push without booking_id is tapped from background', async () => {
    render(<NotificationOpenHandler />);
    await flushAsync();
    expect(mockNavigateToReservations).not.toHaveBeenCalled();
    act(() => {
      mockBackgroundCallback?.({
        messageId: 'bg-1',
        notification: {title: 'Reserva confirmada', body: 'OK'},
      });
    });
    expect(mockNavigateToReservations).toHaveBeenCalledTimes(1);
    expect(mockNavigateToBooking).not.toHaveBeenCalled();
  });

  it('navigates to the specific booking when data.booking_id is present (background)', async () => {
    render(<NotificationOpenHandler />);
    await flushAsync();
    act(() => {
      mockBackgroundCallback?.({
        messageId: 'bg-2',
        notification: {title: 'Reserva confirmada', body: 'OK'},
        data: {booking_id: 'BKG-42'},
      });
    });
    expect(mockNavigateToBooking).toHaveBeenCalledTimes(1);
    expect(mockNavigateToBooking).toHaveBeenCalledWith('BKG-42');
    expect(mockNavigateToReservations).not.toHaveBeenCalled();
  });

  it('accepts camelCase bookingId as alternative to snake_case', async () => {
    render(<NotificationOpenHandler />);
    await flushAsync();
    act(() => {
      mockBackgroundCallback?.({
        messageId: 'bg-3',
        notification: {title: 'Reserva', body: 'OK'},
        data: {bookingId: 'BKG-99'},
      });
    });
    expect(mockNavigateToBooking).toHaveBeenCalledWith('BKG-99');
  });

  it('navigates to the booking when the app was launched from a quit-state push with booking_id', async () => {
    mockGetInitialNotification = jest.fn(() =>
      Promise.resolve({
        messageId: 'quit-1',
        notification: {title: 'Hola', body: 'Mundo'},
        data: {booking_id: 'BKG-7'},
      }),
    );
    render(<NotificationOpenHandler />);
    await flushAsync();
    expect(mockNavigateToBooking).toHaveBeenCalledWith('BKG-7');
    expect(mockNavigateToReservations).not.toHaveBeenCalled();
  });

  it('falls back to Reservas on quit-state when no booking_id is present', async () => {
    mockGetInitialNotification = jest.fn(() =>
      Promise.resolve({
        messageId: 'quit-2',
        notification: {title: 'Hola', body: 'Mundo'},
      }),
    );
    render(<NotificationOpenHandler />);
    await flushAsync();
    expect(mockNavigateToReservations).toHaveBeenCalledTimes(1);
    expect(mockNavigateToBooking).not.toHaveBeenCalled();
  });

  it('does NOT navigate when the app was launched normally (no initial notification)', async () => {
    mockGetInitialNotification = jest.fn(() => Promise.resolve(null));
    render(<NotificationOpenHandler />);
    await flushAsync();
    expect(mockNavigateToReservations).not.toHaveBeenCalled();
    expect(mockNavigateToBooking).not.toHaveBeenCalled();
  });

  it('unsubscribes from the background-tap listener on unmount', () => {
    const {unmount} = render(<NotificationOpenHandler />);
    unmount();
    expect(mockBackgroundUnsubscribe).toHaveBeenCalledTimes(1);
  });
});
