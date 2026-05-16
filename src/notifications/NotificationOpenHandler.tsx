import React, {useEffect} from 'react';
import {FirebaseMessagingTypes} from '@react-native-firebase/messaging';
import {
  navigateToBooking,
  navigateToReservations,
} from '../navigation/navigationRef';
import {
  getInitialNotification,
  onNotificationOpenedFromBackground,
} from '../services/notifications';

/**
 * Lee el `booking_id` (o variante camelCase) del payload `data` de la push.
 * Aceptamos ambos formatos para ser tolerantes a la convención que use el
 * backend.
 */
const extractBookingId = (
  msg: FirebaseMessagingTypes.RemoteMessage,
): string | undefined => {
  const raw = msg.data?.booking_id ?? msg.data?.bookingId;
  return typeof raw === 'string' && raw.length > 0 ? raw : undefined;
};

const routeFromMessage = (
  msg: FirebaseMessagingTypes.RemoteMessage,
): void => {
  const bookingId = extractBookingId(msg);
  if (bookingId) {
    navigateToBooking(bookingId);
  } else {
    // Fallback: si la push no trae `booking_id` (p.ej. notificaciones
    // generales o promocionales), abrimos la lista de reservas.
    navigateToReservations();
  }
};

/**
 * Conecta los eventos de "el usuario tappeó la push" con la navegación.
 *
 * Cubre dos escenarios (el foreground lo maneja `ForegroundNotificationBanner`):
 *  - Background → tap → `onNotificationOpenedApp` → navega a la reserva
 *    indicada en `data.booking_id` o, en su defecto, a la tab Reservas.
 *  - Quit-state → tap → `getInitialNotification` devuelve el mensaje en el
 *    primer mount → mismo enrutamiento que background.
 *
 * Renderiza `null`; vive solo por sus side-effects.
 */
export const NotificationOpenHandler: React.FC = () => {
  useEffect(() => {
    const unsubscribe = onNotificationOpenedFromBackground(routeFromMessage);

    getInitialNotification().then(msg => {
      if (msg) {
        routeFromMessage(msg);
      }
    });

    return unsubscribe;
  }, []);

  return null;
};
