import {createNavigationContainerRef} from '@react-navigation/native';

/**
 * Ref global al NavigationContainer raíz, para poder navegar desde fuera
 * del árbol de React (handlers de push, listeners de FCM, etc).
 *
 * Se conecta en `App.tsx` con `<NavigationContainer ref={navigationRef}>`.
 */
export const navigationRef = createNavigationContainerRef();

const NAVIGATION_READY_TIMEOUT_MS = 5000;
const POLL_INTERVAL_MS = 50;

const waitForNavigationReady = async (): Promise<boolean> => {
  const start = Date.now();
  while (!navigationRef.isReady()) {
    if (Date.now() - start > NAVIGATION_READY_TIMEOUT_MS) {
      return false;
    }
    await new Promise<void>(resolve => {
      setTimeout(() => resolve(), POLL_INTERVAL_MS);
    });
  }
  return true;
};

/**
 * Navega a la tab "Reservas" desde fuera del árbol de NavigationContainer.
 *
 * Espera (con polling cada 50ms) a que el navigator esté listo, lo que
 * cubre el caso de quit-state: cuando el usuario tappea una push estando
 * la app cerrada, el handler puede dispararse antes de que el navigator
 * termine de inicializarse. Aborta tras 5s para no quedar en loop si algo
 * salió muy mal.
 */
export const navigateToReservations = async (): Promise<void> => {
  const ready = await waitForNavigationReady();
  if (!ready) {
    if (__DEV__) {
      console.warn(
        '[navigationRef] navigator no quedó listo tras 5s; navegación abortada',
      );
    }
    return;
  }
  // El tab está declarado como `name="Reservas"` en AppNavigator.
  navigationRef.navigate('Reservas' as never);
};
