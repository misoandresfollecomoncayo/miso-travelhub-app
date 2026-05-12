export interface Room {
  id: string;
  nombreHotel: string;
  /**
   * Precio por noche que paga el usuario (ya tiene el descuento aplicado si
   * lo hay). Se almacena tal cual lo devuelve el backend, en la `moneda`
   * que se pidió en el query de búsqueda. NO se convierte internamente.
   */
  precio: number;
  /**
   * Código de moneda con la que se obtuvo el precio (ej. 'COP', 'EUR',
   * 'USD'). Coincide con el parámetro `moneda` enviado a /search_rooms.
   */
  moneda: string;
  /**
   * Precio por noche CON impuestos (campo `total` del backend dividido entre
   * las noches). El backend aplica su propia tasa de impuestos, no la
   * calculamos en el cliente. Si no viene del backend cae a 0 y la pantalla
   * de reserva calcula impuestos de forma local como fallback.
   */
  precioConImpuestos: number;
  /**
   * Precio por noche original sin descuento, en la misma `moneda`. Sólo
   * presente cuando hay un descuento activo.
   */
  precioOriginal?: number;
  direccion: string;
  capacidadMaxima: number;
  distancia: string;
  acceso: string;
  estrellas: number;
  puntuacionResena: number;
  cantidadResenas: number;
  tipoHabitacion: string;
  tipoCama: string[];
  tamanoHabitacion: string;
  amenidades: string[];
  imagenes: string[];
}
