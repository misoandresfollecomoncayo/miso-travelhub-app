import React, {useEffect} from 'react';
import {navigateToReservations} from '../navigation/navigationRef';
import {
  getInitialNotification,
  onNotificationOpenedFromBackground,
} from '../services/notifications';

/**
 * Conecta los eventos de "el usuario tappeó la push" con la navegación.
 *
 * Cubre dos escenarios (el foreground lo maneja `ForegroundNotificationBanner`):
 *  - Background → tap → `onNotificationOpenedApp` → navega a la tab Reservas.
 *  - Quit-state → tap → `getInitialNotification` devuelve el mensaje en el
 *    primer mount → navega a la tab Reservas (esperando a que el navigator
 *    esté listo, ver `navigateToReservations`).
 *
 * Renderiza `null`; vive solo por sus side-effects.
 */
export const NotificationOpenHandler: React.FC = () => {
  useEffect(() => {
    const unsubscribe = onNotificationOpenedFromBackground(() => {
      navigateToReservations();
    });

    getInitialNotification().then(msg => {
      if (msg) {
        navigateToReservations();
      }
    });

    return unsubscribe;
  }, []);

  return null;
};
