Universidad de los Andes<br/>
Departamento de Ingeniería de Sistemas y Computación<br/>
Maestría en Ingeniería de Software<br/>
Proyecto Final 2<br/>
TravelHub — Aplicación Móvil<br/>

# 1. Estudiantes

| Nombres | Correo Uniandes |
|---|---|
| Andrés Folleco Moncayo | oa.folleco41@uniandes.edu.co |
| Edwin Cruz Silva | e.cruzs@uniandes.edu.co |
| Omar Pava Perez | o.pava@uniandes.edu.co |
| Pablo Rivera Herrera | p.riverah@uniandes.edu.co |

# 2. Contexto del Proyecto

TravelHub corresponde a una iniciativa de transformación digital de una
plataforma de reservas hoteleras con presencia en seis países de Latinoamérica
que afronta limitaciones críticas de rendimiento, escalabilidad, seguridad y
experiencia de usuario. La aplicación móvil entregada en este repositorio
permite a los viajeros buscar, comparar y reservar hospedajes de manera
intuitiva, e integra funcionalidades de consulta de disponibilidad en tiempo
casi real, gestión de reservas, notificaciones push, integración con pasarela
de pagos externa y check‑in mediante código QR. El sistema se soporta sobre
una arquitectura distribuida y desacoplada que persigue alta disponibilidad
(≥ 99.95 %), tiempos de respuesta inferiores a 800 ms en búsquedas,
escalabilidad ante picos de demanda y cumplimiento de estándares de seguridad
equivalentes a PCI‑DSS.

# 3. Estructura del Proyecto

```
miso-travelhub-app/
├── src/
│   ├── assets/                                # Imágenes y logotipos
│   ├── auth/
│   │   └── AuthContext.tsx                    # Sesión (login/registro/logout) + AsyncStorage
│   ├── components/                            # Componentes reutilizables
│   │   ├── Calendar.tsx                       # Selector de rango de fechas
│   │   ├── CounterInput.tsx                   # Contador (adultos, niños, habitaciones)
│   │   ├── RoomCard.tsx                       # Tarjeta de hospedaje
│   │   ├── SelectField.tsx                    # Desplegable (modal bottom-sheet)
│   │   └── StarRating.tsx                     # Calificación por estrellas
│   ├── config/
│   │   └── api.ts                             # Constante única API_BASE_URL
│   ├── data/
│   │   └── room.ts                            # Tipo `Room`
│   ├── i18n/                                  # Internacionalización
│   │   ├── translations.ts                    # Diccionario es/en y utilidades de meses/días
│   │   └── useT.ts                            # Hooks `useT()` y `useDates()`
│   ├── navigation/                            # React Navigation v7
│   │   ├── AppNavigator.tsx                   # Bottom tabs (Buscar / Reservas / Usuario)
│   │   ├── SearchStackNavigator.tsx           # Stack: Search → Results → Detail → Reservation
│   │   ├── ReservationsStackNavigator.tsx     # Stack: lista de reservas → detalle
│   │   ├── UserStackNavigator.tsx             # Stack: Login / Register / Forgot / Profile / Settings
│   │   └── navigationRef.ts                   # Ref global + helper `navigateToReservations` (push → Reservas)
│   ├── notifications/                         # Capa UI de push notifications
│   │   ├── ForegroundNotificationBanner.tsx   # Banner in-app cuando llega una push con la app abierta
│   │   └── NotificationOpenHandler.tsx        # Tap en push (background / quit) → navega a Reservas
│   ├── preferences/
│   │   └── PreferencesContext.tsx             # Idioma y moneda persistidos
│   ├── screens/                               # 14 pantallas
│   │   ├── SearchScreen.tsx
│   │   ├── ResultsScreen.tsx
│   │   ├── DetailScreen.tsx
│   │   ├── ReservationScreen.tsx
│   │   ├── ReservationPoliciesScreen.tsx
│   │   ├── ReservationSuccessScreen.tsx
│   │   ├── ReservationsScreen.tsx             # Listado de reservas del usuario
│   │   ├── BookingDetailScreen.tsx            # Detalle de reserva con QR y botón de pago
│   │   ├── LoginScreen.tsx
│   │   ├── RegisterScreen.tsx
│   │   ├── ForgotPasswordScreen.tsx
│   │   ├── TermsAndConditionsScreen.tsx
│   │   ├── UserProfileScreen.tsx
│   │   └── SettingsScreen.tsx                 # Configuración de idioma y moneda
│   ├── services/                              # Clientes HTTP del backend
│   │   ├── authApi.ts                         # POST /auth/login, /auth/register
│   │   ├── bookingApi.ts                      # POST /booking_room, GET /get_bookings?moneda=…
│   │   ├── searchApi.ts                       # GET /search_rooms
│   │   ├── notifications.ts                   # Token FCM, permisos y listeners (foreground/background/quit)
│   │   └── notificationsApi.ts                # POST /notifications/register-device, /unregister_device
│   ├── theme/
│   │   └── colors.ts                          # Paleta cromática
│   └── utils/
│       ├── amenityIcons.ts                    # Mapeo amenidad → ícono Ionicons
│       ├── currency.ts                        # `formatAmount(amount, currency)`
│       ├── format.ts                          # Formato de precios y códigos de confirmación
│       ├── images.ts                          # Placeholder ante imágenes inválidas
│       └── password.ts                        # Validación de contraseña fuerte
├── __tests__/                                 # Jest + RTL — 43 archivos · 577 pruebas · 92.7 % statements / 83.6 % branches
│   ├── auth/  components/  i18n/  navigation/  notifications/
│   ├── preferences/  screens/  services/  theme/  utils/  a11y/
├── e2e/                                       # Detox 20
│   ├── jest.config.js
│   ├── smoke.test.js
│   ├── search.test.js
│   ├── accessibility.test.js
│   ├── i18n.test.js
│   └── login.test.js
├── android/                                   # Código nativo Android
│   ├── app/src/androidTest/java/.../DetoxTest.java
│   ├── app/src/main/java/.../MainApplication.kt          # Crea NotificationChannel "travelhub_default" (high)
│   ├── app/src/main/AndroidManifest.xml                  # Meta-data FCM (icon, color, channel_id)
│   ├── app/src/main/res/drawable/ic_notification.xml     # Ícono blanco status bar
│   └── app/src/main/res/values/colors.xml                # `notification_color` para el tinte
├── ios/                                       # Código nativo iOS
├── .github/workflows/
│   ├── ci.yml                                 # lint + test + e2e-ios + e2e-android
│   └── cd.yml
├── .detoxrc.js                                # Configuración Detox (iOS sim + Android emu)
├── App.tsx                                    # Providers, NavigationContainer (ref) + banner + open-handler
├── index.js                                   # Registro del handler de FCM en background
├── jest.config.js
├── jest.setup.js                              # Mocks globales (Firebase, async-storage, navigation, …)
└── package.json
```

# 4. Tecnologías Utilizadas

| Tecnología | Versión | Descripción |
|---|---|---|
| React | 19.2.3 | Biblioteca para construcción de interfaces de usuario |
| React Native | 0.84.1 | Framework móvil multiplataforma (arquitectura nueva / Fabric) |
| TypeScript | 5.9.3 | Tipado estático |
| React Navigation | 7.x | Navegación por stacks y bottom tabs |
| React Native Vector Icons | 10.3.0 | Conjunto de íconos (Ionicons) |
| `@react-native-async-storage/async-storage` | 2.2.0 | Persistencia local (sesión, idioma y moneda) |
| `@react-native-firebase/app` + `messaging` | 24.0.0 | Notificaciones push mediante FCM |
| `react-native-qrcode-svg` + `react-native-svg` | 6.3.21 / 15.15.4 | QR del detalle de reserva |
| `react-native-safe-area-context` | 5.7.0 | Manejo de áreas seguras |
| `react-native-screens` | 4.24.0 | Optimización de transiciones |
| Jest | 29.6.3 | Marco de pruebas unitarias |
| `@testing-library/react-native` | 13.3.3 | Render y consultas para pruebas de componente |
| Detox | 20.50.4 | Pruebas extremo a extremo |
| Babel | 7.25 | Transpilador |
| Metro | (RN) | Empaquetador |
| ESLint | 8.57.1 | Análisis estático |
| Prettier | 2.8.8 | Formateador |
| CocoaPods | — | Gestor de dependencias nativas en iOS |
| Gradle | — | Sistema de construcción Android |
| Java | 17 | Requerido por Gradle/AGP |
| Node.js | ≥ 22.11.0 | Entorno de ejecución |

# 5. Instrucciones de Ejecución

## 5.1 Instalación inicial

    npm install
    cd ios && LANG=en_US.UTF-8 LC_ALL=en_US.UTF-8 pod install && cd ..

Antes de compilar las apps nativas se requieren los archivos de configuración
reales de Firebase (los del repositorio son ejemplos genéricos):

- `android/app/google-services.json`: descárguelo desde Firebase Console
  (aplicación Android registrada con el package `com.misotravelhubapp`).
- `ios/MisoTravelhubApp/GoogleService-Info.plist`: descárguelo desde Firebase
  Console (aplicación iOS) y arrástrelo al target en Xcode marcando la opción
  *Copy items if needed*.

## 5.2 Servidor de desarrollo Metro

    npm start

## 5.3 Android

La compilación requiere Java 17:

    export JAVA_HOME="$(/usr/libexec/java_home -v 17)"     # macOS
    npx react-native run-android

Si tras agregar nuevas librerías nativas el *autolink* no las detecta
(síntoma habitual: error `RNFBAppModule not found` en runtime), limpie las
cachés y recompile:

    rm -rf android/build/generated/autolinking android/.gradle
    cd android && ./gradlew clean && cd ..
    npx react-native run-android

### Notificaciones push en Android

A diferencia de iOS, Android (API 26+) requiere un `NotificationChannel`
registrado para que el sistema muestre las push en background o quit-state.
La app lo crea en `MainApplication.onCreate()` con importance HIGH, usando
los recursos:

- `res/values/strings.xml` → ids y nombre del canal (`travelhub_default`).
- `res/drawable/ic_notification.xml` → ícono blanco monocromo del status bar.
- `res/values/colors.xml` → tinte (`@color/notification_color`).
- `AndroidManifest.xml` → meta-data `default_notification_channel_id`,
  `default_notification_icon`, `default_notification_color`. Las tres llevan
  `tools:replace` porque `@react-native-firebase/messaging` ya las declara
  con valores por defecto, y sin la directiva el manifest merger aborta.

Si tras un cambio en estos archivos las notificaciones dejan de aparecer en
background, **desinstale la app del dispositivo** antes de re-instalar:
Android cachea la configuración del canal y no la reemplaza una vez
registrada.

## 5.4 iOS

    npx react-native run-ios --simulator "iPhone 17 Pro"

Para habilitar notificaciones push en dispositivos físicos se requiere
adicionalmente:

1. Cuenta activa en Apple Developer Program.
2. APNs Auth Key (`.p8`) cargada en Firebase Console
   → *Project Settings* → *Cloud Messaging*.
3. Capabilities en Xcode → target → *Signing & Capabilities*: agregar
   **Push Notifications** y **Background Modes** (con *Remote notifications*
   marcado).
4. Archivo `MisoTravelhubApp/MisoTravelhubApp.entitlements` enlazado en
   *Code Signing Entitlements*.

## 5.5 Configuración del backend

La URL base del backend se centraliza en `src/config/api.ts`:

```ts
export const API_BASE_URL = 'https://apitravelhubdev.site';
```

Modifique esta constante para apuntar a un entorno distinto (staging,
producción). Los servicios expuestos son:

| Servicio | Método | Ruta |
|---|---|---|
| `authApi.login` | POST | `/api/v1/auth/login` |
| `authApi.register` | POST | `/api/v1/auth/register` |
| `searchApi.searchRooms` | GET | `/search/search_rooms` |
| `bookingApi.bookRoom` | POST | `/api/v1/booking/booking_room` |
| `bookingApi.getBookings` | GET | `/api/v1/booking/get_bookings?moneda=<COP\|EUR\|USD>` |
| `notificationsApi.registerDeviceToken` | POST | `/api/v1/notifications/register-device` |
| `notificationsApi.unregisterDeviceToken` | POST | `/api/v1/notifications/unregister_device` |

El parámetro `moneda` en `getBookings` corresponde a la preferencia del
usuario configurada en *Settings*; el backend devuelve los totales ya
convertidos a esa moneda. La petición se re-dispara automáticamente al
volver a la tab Reservas (`useFocusEffect`) y al cambiar la preferencia.

La pasarela de pagos externa reside en
`https://miso-pasarela-pagos-evbwp.ondigitalocean.app/payment` y es invocada
desde `BookingDetailScreen` cuando el estado de la reserva es `CONFIRMADA`.

# 6. Ejecución de Pruebas

## 6.1 Pruebas unitarias y de componente (Jest + React Native Testing Library)

    npx jest --coverage

- **43 *suites* · 577 pruebas** que cubren utilidades, servicios HTTP
  (con `fetch` mockeado), *context providers*, componentes individuales,
  pantallas (integración con mocks de navegación), *navigators*, banner
  in-app de push y handler de apertura por notificación.
- Cobertura actual: **92.7 % statements / 83.6 % branches / 92.7 %
  functions / 92.8 % lines** (medida sobre `src/**/*.{ts,tsx}` + `App.tsx`).
- Umbral mínimo configurado en `jest.config.js`: 70 % en las cuatro
  métricas.
- La carpeta `e2e/` se excluye automáticamente de la suite unitaria mediante
  `testPathIgnorePatterns`.

## 6.2 Pruebas extremo a extremo (Detox)

Las pruebas E2E se ubican en `/e2e` y se ejecutan contra la aplicación
instalada en un simulador iOS o un emulador Android, validando flujos
reales del usuario (taps, escritura, navegación).

### Requisitos

- **iOS**: macOS con Xcode + iOS Simulator y la herramienta `applesimutils`:

      brew tap wix/brew && brew install applesimutils

- **Android**: Android Studio con un AVD creado. La configuración por
  defecto utiliza `Pixel_7_API_34`; modifíquela en
  `.detoxrc.js > devices.emulator.avdName` si su entorno usa otro nombre.

### Ejecución local — iOS

    npm run e2e:build:ios
    npm start              # en otra terminal
    npm run e2e:test:ios

### Ejecución local — Android

    export JAVA_HOME="$(/usr/libexec/java_home -v 17)"
    npm run e2e:build:android
    npm start              # en otra terminal
    emulator -avd Pixel_7_API_34 &
    npm run e2e:test:android

### Pruebas E2E incluidas

| Archivo | Pruebas | Cubre |
|---|---|---|
| `e2e/smoke.test.js` | 7 | Arranque, render de la pantalla de búsqueda, presencia de los tres *tabs*, contadores, *chevrons* del calendario, ingreso de destino |
| `e2e/search.test.js` | 13 (1 *skip*) | Inputs del destino (typing, clearText), contadores (incremento/decremento/mínimo), navegación de meses, selección de fechas |
| `e2e/accessibility.test.js` | 6 | Labels de accesibilidad sobre destino, botón Buscar, contadores y tabs; interacción del contador a través del `accessibilityLabel` |
| `e2e/i18n.test.js` | 8 (1 *skip*) | Renderizado de strings en español, etiquetas de los contadores localizadas, días de la semana abreviados en español en el calendario |
| `e2e/login.test.js` | 3 (todas *skipped*) | Validación de correo, inicio de sesión, navegación a Register — bloqueadas por el bug de Detox + Fabric (la navegación al tab "Usuario" no es confiable) |

**Total: 34 pruebas activas + 5 documentadas como `skip`.** La suite completa
se ejecuta en aproximadamente 2 minutos 30 segundos sobre un simulador iOS.

### Limitación conocida — Detox 20 con arquitectura nueva de React Native

La arquitectura Fabric introducida en RN 0.84 reporta de manera incorrecta
los `visibleBounds` de ciertos elementos (botones del `BottomTabBar` y
botón principal de la pantalla de búsqueda). En consecuencia, la
invocación de `tap()` puede fallar con el mensaje
`"View does not pass visibility percent threshold (100)"` pese a que los
elementos sí están en pantalla. Los flujos afectados se documentan con
`it.skip` y se cubren mediante pruebas unitarias y QA manual hasta que
Detox y RN reconcilien la API.

### Inicio de sesión con backend real (opcional)

    export E2E_USER_EMAIL=usuario@ejemplo.co
    export E2E_USER_PASSWORD='contraseña_segura'
    npm run e2e:test:ios

Si dichas variables no se definen, el `describe` correspondiente se omite
automáticamente.

# 7. Integración Continua (GitHub Actions)

El *workflow* `.github/workflows/ci.yml` ejecuta cuatro *jobs* en cada
*push* o *pull request* sobre las ramas `main` y `develop`:

| Job | Runner | Tiempo aproximado | Descripción |
|---|---|---|---|
| **lint** | ubuntu-latest | ~2 min | `npm run lint` (ESLint) |
| **test** | ubuntu-latest | ~3 min | `npm test --coverage --ci` y publicación de `coverage/` como artefacto |
| **e2e-ios** | macos-14 | ~20 min | Pods + applesimutils + build Xcode + Detox |
| **e2e-android** | ubuntu-latest | ~25 min | KVM + AVD cacheado + Gradle + Detox |

```
            push / pull_request
                    │
                  ┌─┴─┐
                  │lint│   (gate barato — análisis estático)
                  └─┬─┘
                    │
                  ┌─┴─┐
                  │test│   (gate intermedio — pruebas unitarias)
                  └─┬─┘
                    │
            ┌───────┴───────┐
            ▼               ▼
        e2e-ios       e2e-android
        (macOS)         (ubuntu)
```

El *pipeline* ejecuta las etapas en orden creciente de costo computacional.
`lint` (~2 min) y `test` (~3 min) actúan como compuertas previas: si
fallan, los *jobs* de E2E ni se inician. Esto evita consumir los ~45 min
combinados de los *runners* macOS y Android cuando una regresión hubiera
podido detectarse con análisis estático o pruebas unitarias.

Los *jobs* `e2e-ios` y `e2e-android` se ejecutan en paralelo entre sí una
vez superados `lint` y `test`. Cargan artefactos (capturas, video y logs)
**sólo cuando fallan**, con retención de 7 días bajo los nombres
`detox-artifacts-ios` y `detox-artifacts-android`.

## 7.1 Optimizaciones de caché

- **iOS**: caché de `ios/Pods` indexada por el *hash* de `Podfile.lock`,
  con ahorro estimado de 5 minutos.
- **Android**:
  - Caché de Gradle (`~/.gradle/caches`, `~/.gradle/wrapper`) indexada por
    los archivos `*.gradle*`.
  - Caché del *snapshot* del AVD (`~/.android/avd/*`) indexada por API y
    nombre del dispositivo. Sin ella, cada arranque del emulador añade
    entre 2 y 3 minutos.

## 7.2 Credenciales reales en CI

Para activar el `describe` de inicio de sesión que requiere conexión al
backend, configure los siguientes **GitHub Secrets** en el repositorio:

- `E2E_USER_EMAIL`
- `E2E_USER_PASSWORD`

Y exponga ambos en el paso *Run Detox E2E tests* (iOS o Android):

```yaml
env:
  E2E_USER_EMAIL: ${{ secrets.E2E_USER_EMAIL }}
  E2E_USER_PASSWORD: ${{ secrets.E2E_USER_PASSWORD }}
```

## 7.3 Consideraciones de costo

El *runner* `macos-14` consume **diez veces más minutos** que un *runner*
Linux en GitHub Actions. Para optimizar el consumo se sugiere:

- Restringir los *jobs* `e2e-ios` y `e2e-android` a `push: branches: [main]`,
  de modo que no se ejecuten en cada *pull request*.
- O bien, condicionar su ejecución a una etiqueta del *pull request* con
  `if: contains(github.event.pull_request.labels.*.name, 'run-e2e')` y
  añadir la etiqueta manualmente cuando se desee.

# 8. Funcionalidades principales

- **Búsqueda de hospedaje** con filtros por destino, fechas, número de
  adultos, niños y habitaciones. La moneda de la consulta corresponde a la
  preferencia del usuario configurada en *Settings*; sin sesión activa, se
  emplea COP por defecto.
- **Detalle del hospedaje** con galería de imágenes, listado de amenidades
  con íconos, calificación por estrellas, precio original tachado en caso
  de existir descuento y precio efectivo destacado.
- **Creación de reserva** con desglose de subtotal, impuestos y total,
  enviados al backend en la moneda nativa de la búsqueda sin conversiones
  intermedias.
- **Listado de reservas** del usuario autenticado. La petición envía la
  moneda preferida del usuario al backend (`?moneda=<COP|EUR|USD>`), que
  devuelve los totales convertidos. La lista se refresca automáticamente al
  re-entrar a la tab ("Reservas") o al cambiar la preferencia, gracias a
  `useFocusEffect` de React Navigation.
- **Detalle de reserva** con etiqueta de estado (*Pendiente*, *Confirmada*,
  *Pagada*, *Completada*, *Cancelada*) y presentación del monto en la
  moneda original de la compra.
- **Código QR** de la reserva, visible **únicamente cuando el estado es
  `PAGADA`**. Sirve como ticket de check-in en el hospedaje.
- **Pago externo** vía pasarela de pagos cuando la reserva se encuentra en
  estado `CONFIRMADA`.
- **Notificaciones push (FCM)** — el sistema tiene tres puntos de entrada
  según el estado de la app:
  - *Foreground* (app abierta): un banner in-app azul (`ForegroundNotificationBanner`)
    aparece sobre la UI, se auto-descarta a los 5 s, y al tap navega a Reservas.
  - *Background* (app en segundo plano): el sistema muestra la push en la
    bandeja; al tap, `onNotificationOpenedApp` ↦ `navigateToReservations`.
  - *Quit-state* (app cerrada): al tap, `getInitialNotification` resuelve
    en el primer mount y la app aterriza directamente en la tab Reservas.

  El token FCM se registra en el backend al iniciar sesión y se desregistra al
  cerrarla (`POST /notifications/register-device` y `/unregister_device`).
- **Internacionalización** español / inglés con conmutación en tiempo de
  ejecución desde *Settings*. La totalidad de pantallas, *tabs* y diálogos
  está localizada.
- **Soporte multi-moneda** (COP, EUR, USD) configurable desde *Settings*.
- **Persistencia** de sesión, idioma y moneda en `AsyncStorage`.
