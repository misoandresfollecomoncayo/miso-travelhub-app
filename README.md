Universidad de los Andes<br/>
Departamento de Ingeniería de Sistemas y Computación<br/>
Maestría en Ingeniería de Software<br/>
Proyecto Final 2<br/>
TravelHub - App Móvil<br/>

# 1. Estudiantes:

|Nombres|Correo Uniandes|
|---|---|
|Andrés Folleco Moncayo|oa.folleco41@uniandes.edu.co|
|Edwin Cruz Silva|e.cruzs@uniandes.edu.co|
|Omar Pava Perez|o.pava@uniandes.edu.co|
|Pablo Rivera Herrera|p.riverah@uniandes.edu.co|

# 2. Contexto del Proyecto

El proyecto TravelHub tiene como objetivo transformar digitalmente una plataforma de reservas hoteleras con presencia en seis países de Latinoamérica, que actualmente enfrenta problemas críticos de rendimiento, escalabilidad, seguridad y experiencia de usuario, impactando directamente la conversión y los ingresos; en este contexto, se plantea el desarrollo de una aplicación móvil que permita a los viajeros buscar, comparar y reservar hospedajes de forma rápida, intuitiva y confiable, integrando funcionalidades como consulta de disponibilidad en tiempo casi real, gestión de reservas, notificaciones, y check-in mediante QR, todo soportado por una arquitectura moderna, distribuida y desacoplada que garantice alta disponibilidad (≥99.95%), tiempos de respuesta óptimos (≤800 ms en búsquedas), escalabilidad ante picos de demanda y cumplimiento de estándares de seguridad como PCI-DSS, con el fin de mejorar la experiencia del usuario, reducir la tasa de abandono y habilitar la evolución continua del negocio en un entorno altamente competitivo.

# 3. Estructura del Proyecto

```
miso-travelhub-app/
├── src/                              # Código fuente principal
│   ├── components/                   # Componentes reutilizables de UI
│   │   ├── AccommodationCard.tsx     # Tarjeta de información de hospedaje
│   │   ├── Calendar.tsx              # Selector de fechas
│   │   └── CounterInput.tsx          # Control de cantidad de huéspedes
│   ├── screens/                      # Pantallas de la aplicación
│   │   ├── SearchScreen.tsx          # Pantalla principal de búsqueda
│   │   ├── ResultsScreen.tsx         # Resultados de hospedajes
│   │   ├── ReservationsScreen.tsx    # Listado de reservas del usuario
│   │   └── UserScreen.tsx            # Perfil del usuario
│   ├── navigation/                   # Configuración de navegación
│   │   ├── AppNavigator.tsx          # Navegación por tabs inferiores
│   │   └── SearchStackNavigator.tsx  # Navegación de flujo de búsqueda
│   ├── theme/                        # Sistema de diseño
│   │   └── colors.ts                 # Paleta de colores
│   └── data/                         # Datos e interfaces
│       └── mockData.ts              # Datos de ejemplo de hospedajes
├── android/                          # Código nativo Android
├── ios/                              # Código nativo iOS
├── __tests__/                        # Pruebas unitarias
├── App.tsx                           # Componente raíz de la aplicación
├── index.js                          # Punto de entrada de la app
├── package.json                      # Dependencias y scripts NPM
├── tsconfig.json                     # Configuración de TypeScript
├── babel.config.js                   # Configuración de Babel
├── metro.config.js                   # Configuración del bundler Metro
├── jest.config.js                    # Configuración de Jest
└── app.json                          # Metadatos de la aplicación
```

# 4. Tecnologías Utilizadas

| Tecnología | Versión | Descripción |
|---|---|---|
| React | 19.2.3 | Biblioteca para construcción de interfaces de usuario |
| React Native | 0.84.1 | Framework para desarrollo móvil multiplataforma |
| TypeScript | 5.9.3 | Superset de JavaScript con tipado estático |
| React Navigation | 7.x | Navegación entre pantallas (stack y bottom tabs) |
| React Native Vector Icons | 10.3.0 | Biblioteca de iconos (Ionicons) |
| Jest | 29.6.3 | Framework de pruebas unitarias |
| Babel | 7.25.2 | Transpilador de JavaScript |
| Metro | - | Bundler por defecto de React Native |
| ESLint | 8.19.0 | Linter para análisis estático de código |
| Prettier | 2.8.8 | Formateador de código |
| CocoaPods | - | Gestor de dependencias nativas para iOS |
| Gradle | - | Sistema de compilación para Android |
| Java | 17 | Requerido para compilación de Android |
| Node.js | >= 22.11.0 | Entorno de ejecución requerido |

# 5. Instrucciones de Ejecución:

### Android:

**Nota:** La build de Android requiere Java 17. Asegurar exportar el JAVA_HOME antes de compilar Android.

    1. export JAVA_HOME=/path/to/java17
    2. npx react-native run-android
### iOS:
    npx react-native run-ios

### Evidencia de funcionamiento:
![alt text](<Screen Shot 2026-03-28 at 19.40.57 PM.png>)