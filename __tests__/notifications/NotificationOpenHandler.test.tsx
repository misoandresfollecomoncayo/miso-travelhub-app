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

const mockNavigateToReservations = jest.fn(() => Promise.resolve());
jest.mock('../../src/navigation/navigationRef', () => ({
  navigateToReservations: () => mockNavigateToReservations(),
}));

const flushAsync = () => act(() => Promise.resolve());

describe('NotificationOpenHandler', () => {
  beforeEach(() => {
    mockBackgroundCallback = null;
    mockBackgroundUnsubscribe.mockClear();
    mockNavigateToReservations.mockClear();
    mockGetInitialNotification = jest.fn(() => Promise.resolve(null));
  });

  it('does NOT render any visible output', () => {
    const {toJSON} = render(<NotificationOpenHandler />);
    expect(toJSON()).toBeNull();
  });

  it('navigates to Reservas when a push is tapped from background', async () => {
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
  });

  it('navigates to Reservas when the app was launched from a quit-state push tap', async () => {
    mockGetInitialNotification = jest.fn(() =>
      Promise.resolve({
        messageId: 'quit-1',
        notification: {title: 'Hola', body: 'Mundo'},
      }),
    );
    render(<NotificationOpenHandler />);
    await flushAsync();
    expect(mockNavigateToReservations).toHaveBeenCalledTimes(1);
  });

  it('does NOT navigate when the app was launched normally (no initial notification)', async () => {
    mockGetInitialNotification = jest.fn(() => Promise.resolve(null));
    render(<NotificationOpenHandler />);
    await flushAsync();
    expect(mockNavigateToReservations).not.toHaveBeenCalled();
  });

  it('unsubscribes from the background-tap listener on unmount', () => {
    const {unmount} = render(<NotificationOpenHandler />);
    unmount();
    expect(mockBackgroundUnsubscribe).toHaveBeenCalledTimes(1);
  });
});
