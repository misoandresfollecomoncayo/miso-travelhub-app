import {Platform, PermissionsAndroid} from 'react-native';
import messaging, {
  FirebaseMessagingTypes,
} from '@react-native-firebase/messaging';

/**
 * Solicita permiso al usuario para recibir notificaciones push.
 * - iOS: usa el diálogo nativo APNS (manejado por Firebase Messaging).
 * - Android 13+ (API 33+): usa POST_NOTIFICATIONS runtime permission.
 * - Android < 13: el permiso se otorga implícitamente vía manifest.
 */
export const requestNotificationPermission = async (): Promise<boolean> => {
  if (Platform.OS === 'ios') {
    const status = await messaging().requestPermission();
    return (
      status === messaging.AuthorizationStatus.AUTHORIZED ||
      status === messaging.AuthorizationStatus.PROVISIONAL
    );
  }

  if (Platform.OS === 'android' && Platform.Version >= 33) {
    const result = await PermissionsAndroid.request(
      PermissionsAndroid.PERMISSIONS.POST_NOTIFICATIONS,
    );
    return result === PermissionsAndroid.RESULTS.GRANTED;
  }

  return true;
};

/**
 * Obtiene el token FCM del dispositivo (registra el token APNS internamente
 * en iOS si todavía no se hizo).
 */
export const getFcmToken = async (): Promise<string | null> => {
  try {
    const token = await messaging().getToken();
    return token || null;
  } catch (err) {
    if (__DEV__) {
      console.warn('[notifications] getToken failed', err);
    }
    return null;
  }
};

/**
 * Suscribe a cambios del token FCM (rotación / reinstalación).
 * Devuelve la función de unsubscribe.
 */
export const onTokenRefresh = (
  callback: (token: string) => void,
): (() => void) => {
  return messaging().onTokenRefresh(callback);
};

/**
 * Listener foreground: la notificación llega mientras la app está abierta.
 * Por defecto FCM en foreground NO muestra el banner — el caller decide qué hacer.
 * Devuelve la función de unsubscribe.
 */
export const onForegroundMessage = (
  callback: (message: FirebaseMessagingTypes.RemoteMessage) => void,
): (() => void) => {
  return messaging().onMessage(async remoteMessage => {
    callback(remoteMessage);
  });
};

/**
 * Handler background: registra el procesador para mensajes recibidos con la app
 * en background o cerrada. DEBE registrarse fuera del componente (en index.js).
 */
export const setBackgroundMessageHandler = (
  handler: (
    message: FirebaseMessagingTypes.RemoteMessage,
  ) => Promise<void> | void,
): void => {
  messaging().setBackgroundMessageHandler(async remoteMessage => {
    await handler(remoteMessage);
  });
};

/**
 * Listener para cuando el usuario tappea una push con la app en background.
 * NO dispara para pushes recibidas con la app cerrada (quit) — para ese caso
 * usa `getInitialNotification`. Devuelve la función de unsubscribe.
 */
export const onNotificationOpenedFromBackground = (
  callback: (message: FirebaseMessagingTypes.RemoteMessage) => void,
): (() => void) => {
  return messaging().onNotificationOpenedApp(callback);
};

/**
 * Retorna el mensaje que abrió la app desde quit-state, o `null` si la app
 * se lanzó normalmente. Sólo trae un mensaje no-null en el primer launch
 * después de un tap de push con la app cerrada.
 */
export const getInitialNotification =
  async (): Promise<FirebaseMessagingTypes.RemoteMessage | null> => {
    try {
      const message = await messaging().getInitialNotification();
      return message ?? null;
    } catch (err) {
      if (__DEV__) {
        console.warn('[notifications] getInitialNotification failed', err);
      }
      return null;
    }
  };

/**
 * Limpia el token FCM del dispositivo (útil al hacer logout para que el
 * usuario actual no siga recibiendo push después de salir).
 */
export const deleteFcmToken = async (): Promise<void> => {
  try {
    await messaging().deleteToken();
  } catch (err) {
    if (__DEV__) {
      console.warn('[notifications] deleteToken failed', err);
    }
  }
};
