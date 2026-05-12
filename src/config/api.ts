/**
 * Configuración centralizada de la API del backend.
 *
 * Toda llamada HTTP en `src/services/*` debe importar `API_BASE_URL` desde
 * aquí. No dupliques esta constante en otros módulos — cambiar de entorno
 * (dev / staging / prod) debe ser un solo cambio en este archivo.
 */
export const API_BASE_URL = 'https://apitravelhubdev.site';
