import {Language} from '../preferences/PreferencesContext';

/**
 * Tabla de traducciones. Para agregar una key:
 *   1. Agrégala en ambos diccionarios (es y en).
 *   2. Úsala con `const t = useT(); t('mi.key')`.
 *
 * Si una key no existe en el idioma actual, se cae a español; si tampoco existe
 * en español, se devuelve la key cruda (útil para detectar strings olvidados
 * en desarrollo).
 */
export type TranslationKey = keyof typeof translations.es;

export const translations = {
  es: {
    // Tabs
    'tab.search': 'Buscar',
    'tab.reservations': 'Reservas',
    'tab.user': 'Usuario',

    // Common
    'common.cancel': 'Cancelar',
    'common.confirm': 'Confirmar',
    'common.save': 'Guardar',
    'common.back': 'Volver',
    'common.close': 'Cerrar',
    'common.retry': 'REINTENTAR',
    'common.error': 'Error',
    'common.comingSoon': 'Funcionalidad próximamente',
    'common.unknownError': 'Error desconocido',
    'common.search': 'BUSCAR',

    // Profile
    'profile.title': 'Mi perfil',
    'profile.myInfo': 'Mi información',
    'profile.notifications': 'Notificaciones',
    'profile.security': 'Seguridad',
    'profile.settings': 'Configuración',
    'profile.about': 'Acerca de TravelHub',
    'profile.logout': 'Cerrar sesión',
    'profile.logoutConfirmTitle': 'Cerrar sesión',
    'profile.logoutConfirmMessage': '¿Seguro que deseas cerrar la sesión?',
    'profile.logoutConfirm': 'Cerrar sesión',

    // Settings
    'settings.title': 'Configuración',
    'settings.section.language': 'Idioma',
    'settings.section.currency': 'Moneda',
    'settings.language.es': 'Español',
    'settings.language.en': 'Inglés',
    'settings.currency.cop': 'Peso colombiano (COP)',
    'settings.currency.eur': 'Euro (EUR)',
    'settings.currency.usd': 'Dólar estadounidense (USD)',
    'settings.savedToast': 'Preferencias guardadas',

    // Login
    'login.title': 'Iniciar sesión',
    'login.email': 'Correo electrónico:',
    'login.password': 'Contraseña:',
    'login.invalidEmail': 'Ingresa un correo electrónico válido.',
    'login.forgotPassword': '¿No recuerdas tu contraseña?',
    'login.submitButton': 'INICIAR SESIÓN',
    'login.registerButton': 'CREAR CUENTA',
    'login.errorFallback': 'No se pudo iniciar sesión',

    // Register
    'register.title': 'Crear cuenta',
    'register.subtitle': 'Regístrate para comenzar a planear tus viajes.',
    'register.fullName': 'Nombre completo:',
    'register.email': 'Correo electrónico:',
    'register.phone': 'Teléfono (opcional):',
    'register.country': 'País:',
    'register.language': 'Idioma:',
    'register.currency': 'Moneda preferida:',
    'register.password': 'Contraseña:',
    'register.confirmPassword': 'Confirmar contraseña:',
    'register.passwordsDontMatch': 'Las contraseñas no coinciden.',
    'register.passwordCheckLength': 'Al menos {n} caracteres',
    'register.passwordCheckLetter': 'Al menos 1 letra',
    'register.passwordCheckDigit': 'Al menos 1 número',
    'register.passwordCheckSpecial': 'Al menos 1 carácter especial',
    'register.acceptTermsPrefix': 'Acepto los ',
    'register.acceptTermsLink': 'términos y condiciones de uso',
    'register.acceptTermsSuffix': ' de la aplicación.',
    'register.submitButton': 'CREAR CUENTA',
    'register.errorFallback': 'No se pudo crear la cuenta',
    'register.languageOption.es': 'Español',
    'register.languageOption.en': 'Inglés',
    'register.currencyOption.cop': 'COP — Peso colombiano',
    'register.currencyOption.eur': 'EUR — Euro',
    'register.currencyOption.usd': 'USD — Dólar estadounidense',
    'register.country.co': 'Colombia',
    'register.country.ar': 'Argentina',
    'register.country.br': 'Brasil',
    'register.country.cl': 'Chile',
    'register.country.ec': 'Ecuador',
    'register.country.es': 'España',
    'register.country.mx': 'México',
    'register.country.pe': 'Perú',
    'register.country.us': 'Estados Unidos',
    'register.country.uy': 'Uruguay',
    'register.country.ve': 'Venezuela',

    // Forgot password
    'forgot.title': 'Recuperar contraseña',
    'forgot.subtitle':
      'Ingresa tu correo y te enviaremos instrucciones para restablecer tu contraseña.',
    'forgot.email': 'Correo electrónico:',
    'forgot.submitButton': 'RECUPERAR CONTRASEÑA',
    'forgot.alertTitle': 'Recuperar contraseña',
    'forgot.alertMessage':
      'Si el correo existe, recibirás instrucciones para restablecer tu contraseña.',

    // Terms & Conditions
    'terms.headerTitle': 'Términos y condiciones',
    'terms.bodyTitle': 'Términos y condiciones de uso',

    // Search
    'search.title': 'Buscar hospedaje',
    'search.destination': 'Destino:',
    'search.destinationPlaceholder': 'Ciudad, país',
    'search.adults': 'Número de adultos',
    'search.children': 'Número de niños',
    'search.rooms': 'Número de habitaciones',
    'search.searchButton': 'BUSCAR',

    // Results
    'results.searching': 'Buscando hospedajes...',
    'results.errorTitle': 'No se pudieron cargar los hospedajes',
    'results.foundCount': '{n} hospedajes encontrados',
    'results.summaryDestination': 'Destino: ',
    'results.summaryDates': 'Fechas: ',
    'results.summaryAdults': 'Número de adultos: ',
    'results.summaryRooms': 'Número de habitaciones: ',
    'results.empty': 'No se encontraron hospedajes para tu búsqueda.',
    'results.errorCheckinPast':
      'La fecha de entrada ya pasó. Selecciona una fecha futura.',
    'results.errorCheckoutBeforeCheckin':
      'La fecha de salida debe ser posterior a la de entrada.',
    'results.errorNetwork':
      'No se pudo conectar con el servidor. Revisa tu conexión.',
    'results.errorGeneric': 'No se pudieron cargar los hospedajes.',

    // Detail
    'detail.starsLabel': 'estrellas',
    'detail.reviewsLabel': 'Reseñas',
    'detail.infoSection': 'Información del hospedaje',
    'detail.address': 'Dirección',
    'detail.distance': 'Distancia',
    'detail.access': 'Acceso',
    'detail.roomType': 'Tipo de habitación',
    'detail.size': 'Tamaño',
    'detail.bedTypeSingle': 'Tipo de cama',
    'detail.bedTypePlural': 'Tipos de cama',
    'detail.capacity': 'Capacidad',
    'detail.capacityValueSingular': 'Hasta {n} persona',
    'detail.capacityValuePlural': 'Hasta {n} personas',
    'detail.score': 'Puntuación',
    'detail.amenitiesSection': 'Amenidades',
    'detail.forNightsSingular': 'Por {n} noche',
    'detail.forNightsPlural': 'Por {n} noches',
    'detail.reserveButton': 'RESERVAR',
    'detail.reserveButtonAccessibility': 'Reservar hospedaje',

    // Room Card
    'roomCard.fromLabel': 'Desde: ',
    'roomCard.perNight': '/noche',
    'roomCard.reviewsCount': '({n} reseñas)',
    'roomCard.viewDetailAccessibility': 'Ver detalle de {hotel}',

    // Reservation
    'reservation.title': 'Reservar',
    'reservation.destination': 'Destino:',
    'reservation.lodging': 'Hospedaje:',
    'reservation.date': 'Fecha:',
    'reservation.editDatesAccessibility': 'Editar fechas de la reserva',
    'reservation.adults': 'Número de adultos',
    'reservation.maxCapacitySingular': 'Capacidad máxima: {n} persona',
    'reservation.maxCapacityPlural': 'Capacidad máxima: {n} personas',
    'reservation.subtotal': 'Subtotal',
    'reservation.taxes': 'Impuestos',
    'reservation.total': 'Total',
    'reservation.cancellationPolicy':
      'Cancelación gratuita hasta 48 horas antes del check-in.',
    'reservation.taxPolicy': 'Los precios incluyen IVA.',
    'reservation.acceptPoliciesPrefix': 'Al continuar, aceptas nuestras ',
    'reservation.acceptPoliciesLink': 'políticas de reservación',
    'reservation.acceptPoliciesAccessibility':
      'Al continuar, aceptas nuestras políticas de reservación',
    'reservation.payButton': 'RESERVAR',
    'reservation.payButtonAccessibility': 'Pagar reserva',
    'reservation.confirmTitle': 'Confirmar reserva',
    'reservation.confirmMessage': '¿Deseas confirmar la reserva?',
    'reservation.errorFallback': 'No se pudo crear la reserva',
    'reservation.notLoggedInTitle': 'Inicia sesión',
    'reservation.notLoggedInMessage':
      'Debes iniciar sesión para crear una reserva.',
    'reservation.editDatesTitle': 'Editar fechas',

    // Reservation policies
    'policies.headerTitle': 'Políticas de reservación',
    'policies.bodyTitle': 'Términos y condiciones de reserva',

    // Reservation success
    'success.title': 'Reserva enviada',
    'success.subtitle': 'Tu reserva espera confirmación por parte del hotel.',
    'success.confirmationCode': 'Código de confirmación',
    'success.destination': 'Destino',
    'success.lodging': 'Hospedaje',
    'success.dates': 'Fechas',
    'success.nightsLabel': 'Noches',
    'success.adultsLabel': 'Adultos',
    'success.totalPaid': 'Total a pagar',
    'success.nightSingular': 'noche',
    'success.nightPlural': 'noches',
    'success.adultSingular': 'adulto',
    'success.adultPlural': 'adultos',

    // Reservations list
    'reservations.title': 'Reservas',
    'reservations.notLoggedInTitle': 'Inicia sesión',
    'reservations.notLoggedInSubtitle': 'Inicia sesión para ver tus reservas.',
    'reservations.loadingText': 'Cargando reservas...',
    'reservations.errorTitle': 'No se pudieron cargar tus reservas',
    'reservations.errorFallback': 'No se pudieron cargar las reservas',
    'reservations.emptyTitle': 'Aún no tienes reservas',
    'reservations.emptySubtitle': 'Cuando hagas una reserva la verás aquí.',
    'reservations.refreshAccessibility': 'Actualizar reservas',
    'reservations.guestSingular': '1 huésped',
    'reservations.guestPlural': '{n} huéspedes',
    'reservations.viewBookingAccessibility': 'Ver detalle de la reserva en {hotel}',
    'reservations.totalLabel': 'Total: ',
    'reservations.status.pending': 'Pendiente',
    'reservations.status.confirmed': 'Confirmada',
    'reservations.status.paid': 'Pagada',
    'reservations.status.completed': 'Completada',
    'reservations.status.cancelled': 'Cancelada',
    'reservations.status.refunded': 'Reembolsada',
    'reservations.status.unknown': 'Sin estado',

    // Booking detail
    'bookingDetail.headerTitle': 'Consultar reserva',
    'bookingDetail.bookingId': 'Id reserva:',
    'bookingDetail.destination': 'Destino:',
    'bookingDetail.lodging': 'Hospedaje:',
    'bookingDetail.date': 'Fecha:',
    'bookingDetail.adults': 'Número de adultos:',
    'bookingDetail.totalPaid': 'Total pagado:',
    'bookingDetail.status': 'Estado:',
    'bookingDetail.payButton': 'PAGAR',
    'bookingDetail.payOpenError': 'No se pudo abrir la pasarela de pagos.',
    'bookingDetail.notFound': 'No se encontró la reserva en tu cuenta.',
    'bookingDetail.errorLoading': 'No se pudo cargar la reserva.',

    // Components — SelectField
    'select.placeholder': 'Selecciona...',
  },
  en: {
    // Tabs
    'tab.search': 'Search',
    'tab.reservations': 'Bookings',
    'tab.user': 'Account',

    // Common
    'common.cancel': 'Cancel',
    'common.confirm': 'Confirm',
    'common.save': 'Save',
    'common.back': 'Back',
    'common.close': 'Close',
    'common.retry': 'RETRY',
    'common.error': 'Error',
    'common.comingSoon': 'Coming soon',
    'common.unknownError': 'Unknown error',
    'common.search': 'SEARCH',

    // Profile
    'profile.title': 'My profile',
    'profile.myInfo': 'My information',
    'profile.notifications': 'Notifications',
    'profile.security': 'Security',
    'profile.settings': 'Settings',
    'profile.about': 'About TravelHub',
    'profile.logout': 'Log out',
    'profile.logoutConfirmTitle': 'Log out',
    'profile.logoutConfirmMessage': 'Are you sure you want to log out?',
    'profile.logoutConfirm': 'Log out',

    // Settings
    'settings.title': 'Settings',
    'settings.section.language': 'Language',
    'settings.section.currency': 'Currency',
    'settings.language.es': 'Spanish',
    'settings.language.en': 'English',
    'settings.currency.cop': 'Colombian peso (COP)',
    'settings.currency.eur': 'Euro (EUR)',
    'settings.currency.usd': 'US dollar (USD)',
    'settings.savedToast': 'Preferences saved',

    // Login
    'login.title': 'Sign in',
    'login.email': 'Email:',
    'login.password': 'Password:',
    'login.invalidEmail': 'Enter a valid email address.',
    'login.forgotPassword': 'Forgot your password?',
    'login.submitButton': 'SIGN IN',
    'login.registerButton': 'CREATE ACCOUNT',
    'login.errorFallback': 'Could not sign in',

    // Register
    'register.title': 'Create account',
    'register.subtitle': 'Sign up to start planning your trips.',
    'register.fullName': 'Full name:',
    'register.email': 'Email:',
    'register.phone': 'Phone (optional):',
    'register.country': 'Country:',
    'register.language': 'Language:',
    'register.currency': 'Preferred currency:',
    'register.password': 'Password:',
    'register.confirmPassword': 'Confirm password:',
    'register.passwordsDontMatch': "Passwords don't match.",
    'register.passwordCheckLength': 'At least {n} characters',
    'register.passwordCheckLetter': 'At least 1 letter',
    'register.passwordCheckDigit': 'At least 1 number',
    'register.passwordCheckSpecial': 'At least 1 special character',
    'register.acceptTermsPrefix': 'I accept the ',
    'register.acceptTermsLink': 'terms and conditions of use',
    'register.acceptTermsSuffix': ' of the application.',
    'register.submitButton': 'CREATE ACCOUNT',
    'register.errorFallback': 'Could not create the account',
    'register.languageOption.es': 'Spanish',
    'register.languageOption.en': 'English',
    'register.currencyOption.cop': 'COP — Colombian peso',
    'register.currencyOption.eur': 'EUR — Euro',
    'register.currencyOption.usd': 'USD — US dollar',
    'register.country.co': 'Colombia',
    'register.country.ar': 'Argentina',
    'register.country.br': 'Brazil',
    'register.country.cl': 'Chile',
    'register.country.ec': 'Ecuador',
    'register.country.es': 'Spain',
    'register.country.mx': 'Mexico',
    'register.country.pe': 'Peru',
    'register.country.us': 'United States',
    'register.country.uy': 'Uruguay',
    'register.country.ve': 'Venezuela',

    // Forgot password
    'forgot.title': 'Recover password',
    'forgot.subtitle':
      'Enter your email and we will send you instructions to reset your password.',
    'forgot.email': 'Email:',
    'forgot.submitButton': 'RECOVER PASSWORD',
    'forgot.alertTitle': 'Recover password',
    'forgot.alertMessage':
      'If the email exists, you will receive instructions to reset your password.',

    // Terms & Conditions
    'terms.headerTitle': 'Terms and conditions',
    'terms.bodyTitle': 'Terms and conditions of use',

    // Search
    'search.title': 'Find a stay',
    'search.destination': 'Destination:',
    'search.destinationPlaceholder': 'City, country',
    'search.adults': 'Number of adults',
    'search.children': 'Number of children',
    'search.rooms': 'Number of rooms',
    'search.searchButton': 'SEARCH',

    // Results
    'results.searching': 'Searching for stays...',
    'results.errorTitle': 'Could not load stays',
    'results.foundCount': '{n} stays found',
    'results.summaryDestination': 'Destination: ',
    'results.summaryDates': 'Dates: ',
    'results.summaryAdults': 'Number of adults: ',
    'results.summaryRooms': 'Number of rooms: ',
    'results.empty': 'No stays found for your search.',
    'results.errorCheckinPast':
      'The check-in date has already passed. Pick a future date.',
    'results.errorCheckoutBeforeCheckin':
      'The check-out date must be later than the check-in date.',
    'results.errorNetwork':
      'Could not reach the server. Check your connection.',
    'results.errorGeneric': 'Could not load stays.',

    // Detail
    'detail.starsLabel': 'stars',
    'detail.reviewsLabel': 'Reviews',
    'detail.infoSection': 'Stay information',
    'detail.address': 'Address',
    'detail.distance': 'Distance',
    'detail.access': 'Access',
    'detail.roomType': 'Room type',
    'detail.size': 'Size',
    'detail.bedTypeSingle': 'Bed type',
    'detail.bedTypePlural': 'Bed types',
    'detail.capacity': 'Capacity',
    'detail.capacityValueSingular': 'Up to {n} person',
    'detail.capacityValuePlural': 'Up to {n} people',
    'detail.score': 'Score',
    'detail.amenitiesSection': 'Amenities',
    'detail.forNightsSingular': 'For {n} night',
    'detail.forNightsPlural': 'For {n} nights',
    'detail.reserveButton': 'BOOK',
    'detail.reserveButtonAccessibility': 'Book stay',

    // Room Card
    'roomCard.fromLabel': 'From: ',
    'roomCard.perNight': '/night',
    'roomCard.reviewsCount': '({n} reviews)',
    'roomCard.viewDetailAccessibility': 'View details of {hotel}',

    // Reservation
    'reservation.title': 'Book',
    'reservation.destination': 'Destination:',
    'reservation.lodging': 'Stay:',
    'reservation.date': 'Date:',
    'reservation.editDatesAccessibility': 'Edit booking dates',
    'reservation.adults': 'Number of adults',
    'reservation.maxCapacitySingular': 'Maximum capacity: {n} person',
    'reservation.maxCapacityPlural': 'Maximum capacity: {n} people',
    'reservation.subtotal': 'Subtotal',
    'reservation.taxes': 'Taxes',
    'reservation.total': 'Total',
    'reservation.cancellationPolicy':
      'Free cancellation up to 48 hours before check-in.',
    'reservation.taxPolicy': 'Prices include VAT.',
    'reservation.acceptPoliciesPrefix': 'By continuing, you accept our ',
    'reservation.acceptPoliciesLink': 'booking policies',
    'reservation.acceptPoliciesAccessibility':
      'By continuing, you accept our booking policies',
    'reservation.payButton': 'BOOK',
    'reservation.payButtonAccessibility': 'Pay booking',
    'reservation.confirmTitle': 'Confirm booking',
    'reservation.confirmMessage': 'Do you want to confirm the booking?',
    'reservation.errorFallback': 'Could not create the booking',
    'reservation.notLoggedInTitle': 'Sign in',
    'reservation.notLoggedInMessage': 'You must sign in to create a booking.',
    'reservation.editDatesTitle': 'Edit dates',

    // Reservation policies
    'policies.headerTitle': 'Booking policies',
    'policies.bodyTitle': 'Booking terms and conditions',

    // Reservation success
    'success.title': 'Booking submitted',
    'success.subtitle': 'Your booking is awaiting hotel confirmation.',
    'success.confirmationCode': 'Confirmation code',
    'success.destination': 'Destination',
    'success.lodging': 'Stay',
    'success.dates': 'Dates',
    'success.nightsLabel': 'Nights',
    'success.adultsLabel': 'Adults',
    'success.totalPaid': 'Total to pay',
    'success.nightSingular': 'night',
    'success.nightPlural': 'nights',
    'success.adultSingular': 'adult',
    'success.adultPlural': 'adults',

    // Reservations list
    'reservations.title': 'Bookings',
    'reservations.notLoggedInTitle': 'Sign in',
    'reservations.notLoggedInSubtitle': 'Sign in to see your bookings.',
    'reservations.loadingText': 'Loading bookings...',
    'reservations.errorTitle': 'Could not load your bookings',
    'reservations.errorFallback': 'Could not load bookings',
    'reservations.emptyTitle': 'You have no bookings yet',
    'reservations.emptySubtitle': 'When you book, it will appear here.',
    'reservations.refreshAccessibility': 'Refresh bookings',
    'reservations.guestSingular': '1 guest',
    'reservations.guestPlural': '{n} guests',
    'reservations.viewBookingAccessibility': 'View booking details at {hotel}',
    'reservations.totalLabel': 'Total: ',
    'reservations.status.pending': 'Pending',
    'reservations.status.confirmed': 'Confirmed',
    'reservations.status.paid': 'Paid',
    'reservations.status.completed': 'Completed',
    'reservations.status.cancelled': 'Cancelled',
    'reservations.status.refunded': 'Refunded',
    'reservations.status.unknown': 'No status',

    // Booking detail
    'bookingDetail.headerTitle': 'View booking',
    'bookingDetail.bookingId': 'Booking ID:',
    'bookingDetail.destination': 'Destination:',
    'bookingDetail.lodging': 'Stay:',
    'bookingDetail.date': 'Date:',
    'bookingDetail.adults': 'Number of adults:',
    'bookingDetail.totalPaid': 'Total paid:',
    'bookingDetail.status': 'Status:',
    'bookingDetail.payButton': 'PAY',
    'bookingDetail.payOpenError': 'Could not open the payment gateway.',
    'bookingDetail.notFound': 'We could not find this booking in your account.',
    'bookingDetail.errorLoading': 'We could not load the booking.',

    // Components — SelectField
    'select.placeholder': 'Select...',
  },
} as const;

export const translate = (key: TranslationKey, language: Language): string => {
  const dict = translations[language] ?? translations.es;
  const value = (dict as Record<string, string>)[key];
  if (typeof value === 'string') {
    return value;
  }
  const fallback = (translations.es as Record<string, string>)[key];
  return fallback ?? key;
};

/**
 * Reemplaza placeholders {x} en una traducción.
 *   format('Por {n} noches', {n: 4}) → 'Por 4 noches'
 */
export const format = (
  template: string,
  vars: Record<string, string | number>,
): string =>
  Object.keys(vars).reduce(
    (acc, key) => acc.replace(new RegExp(`\\{${key}\\}`, 'g'), String(vars[key])),
    template,
  );

// ─────────────────────────────────────────────────────────────────────────────
// Meses y días por idioma — para componentes que listan meses/días (Calendar,
// formatters de fechas en BookingDetail/ReservationsScreen).

const MONTHS_FULL: Record<Language, string[]> = {
  es: [
    'enero',
    'febrero',
    'marzo',
    'abril',
    'mayo',
    'junio',
    'julio',
    'agosto',
    'septiembre',
    'octubre',
    'noviembre',
    'diciembre',
  ],
  en: [
    'january',
    'february',
    'march',
    'april',
    'may',
    'june',
    'july',
    'august',
    'september',
    'october',
    'november',
    'december',
  ],
};

const MONTHS_SHORT: Record<Language, string[]> = {
  es: [
    'ene',
    'feb',
    'mar',
    'abr',
    'may',
    'jun',
    'jul',
    'ago',
    'sep',
    'oct',
    'nov',
    'dic',
  ],
  en: [
    'jan',
    'feb',
    'mar',
    'apr',
    'may',
    'jun',
    'jul',
    'aug',
    'sep',
    'oct',
    'nov',
    'dec',
  ],
};

const MONTHS_FULL_CAPITALIZED: Record<Language, string[]> = {
  es: [
    'Enero',
    'Febrero',
    'Marzo',
    'Abril',
    'Mayo',
    'Junio',
    'Julio',
    'Agosto',
    'Septiembre',
    'Octubre',
    'Noviembre',
    'Diciembre',
  ],
  en: [
    'January',
    'February',
    'March',
    'April',
    'May',
    'June',
    'July',
    'August',
    'September',
    'October',
    'November',
    'December',
  ],
};

const DAYS_SHORT: Record<Language, string[]> = {
  es: ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'],
  en: ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'],
};

export const getMonthName = (
  monthIndex: number,
  language: Language,
  variant: 'full' | 'short' | 'capitalized' = 'full',
): string => {
  const safeIndex = Math.max(0, Math.min(11, monthIndex));
  const lang = (language in MONTHS_FULL ? language : 'es') as Language;
  if (variant === 'short') {
    return MONTHS_SHORT[lang][safeIndex];
  }
  if (variant === 'capitalized') {
    return MONTHS_FULL_CAPITALIZED[lang][safeIndex];
  }
  return MONTHS_FULL[lang][safeIndex];
};

export const getDayShortNames = (language: Language): string[] => {
  const lang = (language in DAYS_SHORT ? language : 'es') as Language;
  return DAYS_SHORT[lang];
};
