import {Platform, PermissionsAndroid} from 'react-native';
import messaging from '@react-native-firebase/messaging';
import {
  requestNotificationPermission,
  getFcmToken,
  deleteFcmToken,
  onTokenRefresh,
  onForegroundMessage,
  setBackgroundMessageHandler,
} from '../../src/services/notifications';

const messagingMock = (messaging as unknown as jest.Mock)();

describe('notifications service', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    Object.defineProperty(Platform, 'OS', {value: 'ios', configurable: true});
  });

  describe('requestNotificationPermission', () => {
    it('returns true when iOS authorization is AUTHORIZED', async () => {
      Object.defineProperty(Platform, 'OS', {value: 'ios', configurable: true});
      messagingMock.requestPermission.mockResolvedValueOnce(1);
      await expect(requestNotificationPermission()).resolves.toBe(true);
      expect(messagingMock.requestPermission).toHaveBeenCalledTimes(1);
    });

    it('returns true when iOS authorization is PROVISIONAL', async () => {
      Object.defineProperty(Platform, 'OS', {value: 'ios', configurable: true});
      messagingMock.requestPermission.mockResolvedValueOnce(2);
      await expect(requestNotificationPermission()).resolves.toBe(true);
    });

    it('returns false when iOS authorization is DENIED', async () => {
      Object.defineProperty(Platform, 'OS', {value: 'ios', configurable: true});
      messagingMock.requestPermission.mockResolvedValueOnce(0);
      await expect(requestNotificationPermission()).resolves.toBe(false);
    });

    it('asks Android runtime permission on API 33+', async () => {
      Object.defineProperty(Platform, 'OS', {value: 'android', configurable: true});
      Object.defineProperty(Platform, 'Version', {value: 33, configurable: true});
      const spy = jest
        .spyOn(PermissionsAndroid, 'request')
        .mockResolvedValueOnce(PermissionsAndroid.RESULTS.GRANTED);
      const result = await requestNotificationPermission();
      expect(spy).toHaveBeenCalledWith(
        PermissionsAndroid.PERMISSIONS.POST_NOTIFICATIONS,
      );
      expect(result).toBe(true);
    });

    it('returns false when user denies on Android 13+', async () => {
      Object.defineProperty(Platform, 'OS', {value: 'android', configurable: true});
      Object.defineProperty(Platform, 'Version', {value: 33, configurable: true});
      jest
        .spyOn(PermissionsAndroid, 'request')
        .mockResolvedValueOnce(PermissionsAndroid.RESULTS.DENIED);
      await expect(requestNotificationPermission()).resolves.toBe(false);
    });

    it('returns true on Android < 13 without prompting', async () => {
      Object.defineProperty(Platform, 'OS', {value: 'android', configurable: true});
      Object.defineProperty(Platform, 'Version', {value: 30, configurable: true});
      const spy = jest.spyOn(PermissionsAndroid, 'request');
      const result = await requestNotificationPermission();
      expect(spy).not.toHaveBeenCalled();
      expect(result).toBe(true);
    });
  });

  describe('getFcmToken', () => {
    it('returns the FCM token from messaging.getToken()', async () => {
      messagingMock.getToken.mockResolvedValueOnce('tok-123');
      await expect(getFcmToken()).resolves.toBe('tok-123');
    });

    it('returns null when getToken throws', async () => {
      messagingMock.getToken.mockRejectedValueOnce(new Error('boom'));
      await expect(getFcmToken()).resolves.toBeNull();
    });

    it('returns null when getToken resolves with empty string', async () => {
      messagingMock.getToken.mockResolvedValueOnce('');
      await expect(getFcmToken()).resolves.toBeNull();
    });
  });

  describe('deleteFcmToken', () => {
    it('calls messaging.deleteToken()', async () => {
      await deleteFcmToken();
      expect(messagingMock.deleteToken).toHaveBeenCalledTimes(1);
    });

    it('swallows errors silently', async () => {
      messagingMock.deleteToken.mockRejectedValueOnce(new Error('boom'));
      await expect(deleteFcmToken()).resolves.toBeUndefined();
    });
  });

  describe('listeners', () => {
    it('onTokenRefresh registers a callback and returns unsubscribe', () => {
      const cb = jest.fn();
      const unsub = onTokenRefresh(cb);
      expect(messagingMock.onTokenRefresh).toHaveBeenCalledWith(cb);
      expect(typeof unsub).toBe('function');
    });

    it('onForegroundMessage registers and forwards remote messages', async () => {
      const cb = jest.fn();
      let captured: ((m: unknown) => Promise<void>) | undefined;
      messagingMock.onMessage.mockImplementationOnce(
        (handler: (m: unknown) => Promise<void>) => {
          captured = handler;
          return () => {};
        },
      );
      onForegroundMessage(cb);
      await captured?.({notification: {title: 'hi'}});
      expect(cb).toHaveBeenCalledWith({notification: {title: 'hi'}});
    });

    it('setBackgroundMessageHandler installs a handler', () => {
      const handler = jest.fn();
      setBackgroundMessageHandler(handler);
      expect(messagingMock.setBackgroundMessageHandler).toHaveBeenCalledTimes(
        1,
      );
    });
  });
});
