/**
 * Configuración de la sesión del usuario
 */

// Tiempo de expiración de la sesión en milisegundos
// Por defecto: 2 horas (2 * 60 * 60 * 1000)
// Puedes ajustar estos valores según tus necesidades:
// - 30 minutos: 30 * 60 * 1000
// - 1 hora: 60 * 60 * 1000
// - 4 horas: 4 * 60 * 60 * 1000
export const TIEMPO_EXPIRACION_SESION = 2 * 60 * 60 * 1000;

// Mostrar advertencia antes de que expire la sesión (en milisegundos)
// Por defecto: 10 minutos antes
export const TIEMPO_ADVERTENCIA_EXPIRACION = 10 * 60 * 1000;

// Limpiar automáticamente el carrito al cambiar de mesa
export const LIMPIAR_CARRITO_AL_CAMBIAR_MESA = true;

// Limpiar automáticamente los favoritos al cambiar de mesa
export const LIMPIAR_FAVORITOS_AL_CAMBIAR_MESA = false; // Los favoritos pueden persistir

const configSesion = {
  TIEMPO_EXPIRACION_SESION,
  TIEMPO_ADVERTENCIA_EXPIRACION,
  LIMPIAR_CARRITO_AL_CAMBIAR_MESA,
  LIMPIAR_FAVORITOS_AL_CAMBIAR_MESA,
};

export default configSesion;
