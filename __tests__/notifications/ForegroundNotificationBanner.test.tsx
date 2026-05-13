import React from 'react';
import {act, fireEvent, render} from '@testing-library/react-native';
import {ForegroundNotificationBanner} from '../../src/notifications/ForegroundNotificationBanner';

// Capturamos el callback que registra el componente al subscribirse, para
// poder dispararlo manualmente desde cada test (simulando que llega un push
// con la app en foreground).
let mockForegroundCallback:
  | ((msg: Record<string, unknown>) => void)
  | null = null;
const mockUnsubscribe = jest.fn();

jest.mock('../../src/services/notifications', () => ({
  onForegroundMessage: (cb: (msg: Record<string, unknown>) => void) => {
    mockForegroundCallback = cb;
    return mockUnsubscribe;
  },
}));

const mockNavigateToReservations = jest.fn(() => Promise.resolve());
jest.mock('../../src/navigation/navigationRef', () => ({
  navigateToReservations: () => mockNavigateToReservations(),
}));

describe('ForegroundNotificationBanner', () => {
  beforeEach(() => {
    jest.useFakeTimers();
    mockForegroundCallback = null;
    mockUnsubscribe.mockClear();
    mockNavigateToReservations.mockClear();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it('renders nothing while no foreground message has arrived', () => {
    const {queryByTestId} = render(<ForegroundNotificationBanner />);
    expect(queryByTestId('foreground-notification-banner')).toBeNull();
  });

  it('unsubscribes from foreground messages on unmount', () => {
    const {unmount} = render(<ForegroundNotificationBanner />);
    unmount();
    expect(mockUnsubscribe).toHaveBeenCalledTimes(1);
  });

  it('renders the banner with title and body from notification block', () => {
    const {getByTestId, getByText} = render(<ForegroundNotificationBanner />);
    act(() => {
      mockForegroundCallback?.({
        messageId: 'm1',
        notification: {
          title: 'Reserva confirmada',
          body: 'Tu reserva en Hotel Treta fue confirmada.',
        },
      });
    });
    expect(getByTestId('foreground-notification-banner')).toBeTruthy();
    expect(getByText('Reserva confirmada')).toBeTruthy();
    expect(
      getByText('Tu reserva en Hotel Treta fue confirmada.'),
    ).toBeTruthy();
  });

  it('falls back to data.title / data.body when the notification block is missing', () => {
    const {getByText} = render(<ForegroundNotificationBanner />);
    act(() => {
      mockForegroundCallback?.({
        messageId: 'm2',
        data: {title: 'Pago recibido', body: 'Procesamos tu pago.'},
      });
    });
    expect(getByText('Pago recibido')).toBeTruthy();
    expect(getByText('Procesamos tu pago.')).toBeTruthy();
  });

  it('ignores silent pushes (no title and no body)', () => {
    const {queryByTestId} = render(<ForegroundNotificationBanner />);
    act(() => {
      mockForegroundCallback?.({
        messageId: 'silent',
        data: {action: 'refresh'},
      });
    });
    expect(queryByTestId('foreground-notification-banner')).toBeNull();
  });

  it('auto-dismisses after 5 seconds', () => {
    const {queryByTestId} = render(<ForegroundNotificationBanner />);
    act(() => {
      mockForegroundCallback?.({
        messageId: 'm1',
        notification: {title: 'Hola', body: 'Mundo'},
      });
    });
    expect(queryByTestId('foreground-notification-banner')).toBeTruthy();
    act(() => {
      jest.advanceTimersByTime(5000);
    });
    expect(queryByTestId('foreground-notification-banner')).toBeNull();
  });

  it('dismisses immediately when the banner is tapped', () => {
    const {getByTestId, queryByTestId} = render(
      <ForegroundNotificationBanner />,
    );
    act(() => {
      mockForegroundCallback?.({
        messageId: 'm1',
        notification: {title: 'Hola', body: 'Mundo'},
      });
    });
    fireEvent.press(getByTestId('foreground-notification-banner'));
    expect(queryByTestId('foreground-notification-banner')).toBeNull();
  });

  it('navigates to Reservas when the banner is tapped', () => {
    const {getByTestId} = render(<ForegroundNotificationBanner />);
    act(() => {
      mockForegroundCallback?.({
        messageId: 'm1',
        notification: {title: 'Reserva confirmada', body: 'OK'},
      });
    });
    fireEvent.press(getByTestId('foreground-notification-banner'));
    expect(mockNavigateToReservations).toHaveBeenCalledTimes(1);
  });

  it('replaces the current banner when a newer notification arrives', () => {
    const {getByText, queryByText} = render(<ForegroundNotificationBanner />);
    act(() => {
      mockForegroundCallback?.({
        messageId: 'm1',
        notification: {title: 'Primero', body: 'A'},
      });
    });
    expect(getByText('Primero')).toBeTruthy();
    act(() => {
      mockForegroundCallback?.({
        messageId: 'm2',
        notification: {title: 'Segundo', body: 'B'},
      });
    });
    expect(getByText('Segundo')).toBeTruthy();
    expect(queryByText('Primero')).toBeNull();
  });
});
