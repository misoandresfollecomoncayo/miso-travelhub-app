import {Platform} from 'react-native';
import {
  registerDeviceToken,
  unregisterDeviceToken,
} from '../../src/services/notificationsApi';

const makeResponse = (ok = true) =>
  Promise.resolve({
    ok,
    status: ok ? 200 : 500,
    json: () => Promise.resolve({}),
  });

describe('notificationsApi', () => {
  beforeEach(() => {
    Object.defineProperty(Platform, 'OS', {value: 'ios', configurable: true});
    globalThis.fetch = jest.fn(() => makeResponse(true)) as jest.Mock;
  });

  afterEach(() => {
    (globalThis.fetch as jest.Mock).mockReset();
  });

  describe('registerDeviceToken', () => {
    it('POSTs to /api/v1/notifications/register_device with bearer', async () => {
      await registerDeviceToken({fcmToken: 'fcm-1', token: 'jwt-1'});
      const [url, options] = (globalThis.fetch as jest.Mock).mock.calls[0];
      expect(url).toBe(
        'https://apitravelhub.site/api/v1/notifications/register_device',
      );
      expect(options.method).toBe('POST');
      expect(options.headers.Authorization).toBe('Bearer jwt-1');
    });

    it('sends fcm_token and platform in the body', async () => {
      Object.defineProperty(Platform, 'OS', {value: 'android', configurable: true});
      await registerDeviceToken({fcmToken: 'fcm-1', token: 'jwt-1'});
      const body = JSON.parse(
        (globalThis.fetch as jest.Mock).mock.calls[0][1].body,
      );
      expect(body).toEqual({fcm_token: 'fcm-1', platform: 'android'});
    });

    it('returns false (without calling fetch) when fcmToken is empty', async () => {
      const ok = await registerDeviceToken({fcmToken: '', token: 'jwt-1'});
      expect(ok).toBe(false);
      expect(globalThis.fetch).not.toHaveBeenCalled();
    });

    it('returns false (without calling fetch) when token is empty', async () => {
      const ok = await registerDeviceToken({fcmToken: 'fcm-1', token: ''});
      expect(ok).toBe(false);
      expect(globalThis.fetch).not.toHaveBeenCalled();
    });

    it('returns false on non-2xx response', async () => {
      (globalThis.fetch as jest.Mock).mockImplementationOnce(() =>
        makeResponse(false),
      );
      const ok = await registerDeviceToken({fcmToken: 'fcm-1', token: 'jwt'});
      expect(ok).toBe(false);
    });

    it('returns false (no throw) when fetch rejects', async () => {
      (globalThis.fetch as jest.Mock).mockImplementationOnce(() =>
        Promise.reject(new Error('ENOTFOUND')),
      );
      const ok = await registerDeviceToken({fcmToken: 'fcm-1', token: 'jwt'});
      expect(ok).toBe(false);
    });
  });

  describe('unregisterDeviceToken', () => {
    it('POSTs to /api/v1/notifications/unregister_device', async () => {
      await unregisterDeviceToken({fcmToken: 'fcm-1', token: 'jwt-1'});
      const [url, options] = (globalThis.fetch as jest.Mock).mock.calls[0];
      expect(url).toBe(
        'https://apitravelhub.site/api/v1/notifications/unregister_device',
      );
      expect(options.method).toBe('POST');
      expect(options.headers.Authorization).toBe('Bearer jwt-1');
    });

    it('returns false when token is missing', async () => {
      const ok = await unregisterDeviceToken({fcmToken: 'fcm-1', token: ''});
      expect(ok).toBe(false);
      expect(globalThis.fetch).not.toHaveBeenCalled();
    });

    it('returns false (no throw) when fetch rejects', async () => {
      (globalThis.fetch as jest.Mock).mockImplementationOnce(() =>
        Promise.reject(new Error('boom')),
      );
      const ok = await unregisterDeviceToken({fcmToken: 'f', token: 'j'});
      expect(ok).toBe(false);
    });
  });
});
