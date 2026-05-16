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

const warnNotReady = (): void => {
  if (__DEV__) {
    console.warn(
      '[navigationRef] navigator no quedó listo tras 5s; navegación abortada',
    );
  }
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
    warnNotReady();
    return;
  }
  // El tab está declarado como `name="Reservas"` en AppNavigator.
  navigationRef.navigate('Reservas' as never);
};

/**
 * Navega a la pantalla de detalle de una reserva específica desde fuera del
 * árbol de NavigationContainer. Se usa cuando la push trae `booking_id` en
 * `data`, para llevar al usuario directo a esa reserva en lugar de a la
 * lista general.
 *
 * El BookingDetailScreen acepta tanto un objeto `booking` completo
 * (camino normal desde la lista) como un `bookingId` suelto (camino que
 * usamos aquí): en este último caso la pantalla se encarga de pedir la
 * lista de reservas del usuario y resolver el booking por id.
 */
export const navigateToBooking = async (bookingId: string): Promise<void> => {
  if (!bookingId) {
    // Sin id no hay forma de identificar la reserva — caemos al
    // comportamiento anterior (lista general).
    return navigateToReservations();
  }
  const ready = await waitForNavigationReady();
  if (!ready) {
    warnNotReady();
    return;
  }
  // Para navegación anidada (BookingDetail dentro del stack de Reservas)
  // hay que usar el wrapper `.navigate()` de NavigationHelpers — desempaca
  // recursivamente la sintaxis `{screen, params}` y dispara la acción en
  // cada nivel. NO usar `dispatch(CommonActions.navigate(...))` aquí: esa
  // API de bajo nivel solo despacha una acción a un único navegador, deja
  // el inner stack desincronizado y rompe la history (back button, etc).
  //
  // `initial: false` es CRÍTICO en el caso quit-state: cuando la app se
  // abre por primera vez desde un tap de push, el stack de Reservas todavía
  // no ha sido inicializado. Por default, RN v7 trata el screen anidado
  // como el route inicial del stack — es decir, history quedaría
  // `[BookingDetail]` en lugar de `[ReservationsList, BookingDetail]`. Eso
  // rompe el back button (no hay a dónde volver) y desactiva el tap en la
  // tab "Reservas" (RN interpreta "tap en tab activa" como "pop to root",
  // pero el root ya es BookingDetail). Con `initial: false` el stack se
  // inicializa con ReservationsList y BookingDetail se pushea encima.
  //
  // El `as unknown as` esquiva el tipado estricto: el ref sin generic tipa
  // navigate con un solo arg `never`, pero en runtime acepta dos.
  const navigate = navigationRef.navigate as unknown as (
    name: string,
    params: {
      screen: string;
      params: Record<string, unknown>;
      initial?: boolean;
    },
  ) => void;
  navigate('Reservas', {
    screen: 'BookingDetail',
    params: {bookingId},
    initial: false,
  });
};
