import {Platform} from 'react-native';

const API_BASE_URL = 'https://apitravelhub.site';
const REGISTER_DEVICE_ENDPOINT = `${API_BASE_URL}/api/v1/notifications/register_device`;
const UNREGISTER_DEVICE_ENDPOINT = `${API_BASE_URL}/api/v1/notifications/unregister_device`;

export interface RegisterDeviceParams {
  fcmToken: string;
  token: string; // JWT del usuario autenticado
}

export interface UnregisterDeviceParams {
  fcmToken: string;
  token: string;
}

const buildHeaders = (jwt: string) => ({
  'Content-Type': 'application/json',
  Authorization: `Bearer ${jwt}`,
});

/**
 * Registra el FCM token del dispositivo en el backend para asociarlo al
 * usuario autenticado. No lanza si el endpoint no existe — log en dev only,
 * no rompe el login.
 */
export const registerDeviceToken = async (
  params: RegisterDeviceParams,
): Promise<boolean> => {
  if (!params.token || !params.fcmToken) {
    return false;
  }
  try {
    const response = await fetch(REGISTER_DEVICE_ENDPOINT, {
      method: 'POST',
      headers: buildHeaders(params.token),
      body: JSON.stringify({
        fcm_token: params.fcmToken,
        platform: Platform.OS,
      }),
    });
    return response.ok;
  } catch (err) {
    if (__DEV__) {
      console.warn('[notificationsApi] registerDeviceToken failed', err);
    }
    return false;
  }
};

/**
 * Desregistra el token al hacer logout. Tampoco lanza ante errores.
 */
export const unregisterDeviceToken = async (
  params: UnregisterDeviceParams,
): Promise<boolean> => {
  if (!params.token || !params.fcmToken) {
    return false;
  }
  try {
    const response = await fetch(UNREGISTER_DEVICE_ENDPOINT, {
      method: 'POST',
      headers: buildHeaders(params.token),
      body: JSON.stringify({
        fcm_token: params.fcmToken,
        platform: Platform.OS,
      }),
    });
    return response.ok;
  } catch (err) {
    if (__DEV__) {
      console.warn('[notificationsApi] unregisterDeviceToken failed', err);
    }
    return false;
  }
};
