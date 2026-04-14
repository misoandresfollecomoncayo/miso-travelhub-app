export interface Room {
  id: string;
  nombreHotel: string;
  precio: number;
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
