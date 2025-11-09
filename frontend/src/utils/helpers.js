/**
 * Funciones auxiliares para el frontend
 */

// Formatear precio en bolívares
export const formatearPrecio = (precio) => {
  return new Intl.NumberFormat('es-VE', {
    style: 'currency',
    currency: 'VES',
    minimumFractionDigits: 2,
  }).format(precio);
};

// Formatear precio en dólares
export const formatearPrecioDolares = (precio) => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
  }).format(precio);
};

// Convertir USD a Bs usando tasa BCV
export const convertirUSDaBs = (precioUSD, tasaBCV) => {
  return precioUSD * tasaBCV;
};

// Formatear precio dual (USD y Bs)
export const formatearPrecioDual = (precioUSD, tasaBCV) => {
  const precioBs = convertirUSDaBs(precioUSD, tasaBCV);
  return {
    usd: formatearPrecioDolares(precioUSD),
    bs: formatearPrecio(precioBs),
    valorUSD: precioUSD,
    valorBs: precioBs
  };
};

// Formatear fecha y hora
export const formatearFechaHora = (fecha) => {
  return new Intl.DateTimeFormat('es-VE', {
    dateStyle: 'short',
    timeStyle: 'short',
  }).format(new Date(fecha));
};

// Formatear solo hora
export const formatearHora = (fecha) => {
  return new Intl.DateTimeFormat('es-VE', {
    timeStyle: 'short',
  }).format(new Date(fecha));
};

// Calcular propina
export const calcularPropina = (total, porcentaje) => {
  return (total * porcentaje) / 100;
};

// Obtener color de estado
export const obtenerColorEstado = (estado) => {
  const colores = {
    recibido: 'bg-blue-100 text-blue-800',
    en_preparacion: 'bg-yellow-100 text-yellow-800',
    listo: 'bg-green-100 text-green-800',
    entregado: 'bg-gray-100 text-gray-800',
    cancelado: 'bg-red-100 text-red-800',
  };
  return colores[estado] || 'bg-gray-100 text-gray-800';
};

// Obtener texto de estado
export const obtenerTextoEstado = (estado) => {
  const textos = {
    recibido: 'Recibido',
    en_preparacion: 'En Preparación',
    listo: 'Listo',
    entregado: 'Entregado',
    cancelado: 'Cancelado',
  };
  return textos[estado] || estado;
};

// Obtener icono de método de pago
export const obtenerMetodoPagoTexto = (metodo) => {
  const metodos = {
    pago_movil: 'Pago Móvil',
    transferencia: 'Transferencia',
    efectivo: 'Efectivo',
    zelle: 'Zelle',
    paypal: 'PayPal',
    punto_venta: 'Punto de Venta',
    pendiente: 'Pendiente',
  };
  return metodos[metodo] || metodo;
};

// Validar número de teléfono venezolano
export const validarTelefonoVenezolano = (telefono) => {
  const regex = /^(0414|0424|0412|0416|0426)\d{7}$/;
  return regex.test(telefono);
};

// Validar cédula venezolana
export const validarCedulaVenezolana = (cedula) => {
  const regex = /^[VEJGvejg]-?\d{6,9}$/;
  return regex.test(cedula);
};

// Generar código QR para mesa
export const generarUrlMesa = (numeroMesa) => {
  const baseUrl = window.location.origin;
  return `${baseUrl}/mesa/${numeroMesa}`;
};

// Agrupar productos por categoría
export const agruparPorCategoria = (productos) => {
  return productos.reduce((acc, producto) => {
    const categoria = producto.categoria;
    if (!acc[categoria]) {
      acc[categoria] = [];
    }
    acc[categoria].push(producto);
    return acc;
  }, {});
};

// Calcular total del carrito
export const calcularTotalCarrito = (items) => {
  return items.reduce((total, item) => {
    return total + (item.precio * item.cantidad);
  }, 0);
};

// Guardar en localStorage
export const guardarEnStorage = (clave, valor) => {
  try {
    localStorage.setItem(clave, JSON.stringify(valor));
  } catch (error) {
    console.error('Error al guardar en localStorage:', error);
  }
};

// Obtener de localStorage
export const obtenerDeStorage = (clave) => {
  try {
    const item = localStorage.getItem(clave);
    return item ? JSON.parse(item) : null;
  } catch (error) {
    console.error('Error al obtener de localStorage:', error);
    return null;
  }
};

// Limpiar localStorage
export const limpiarStorage = (clave) => {
  try {
    if (clave) {
      localStorage.removeItem(clave);
    } else {
      localStorage.clear();
    }
  } catch (error) {
    console.error('Error al limpiar localStorage:', error);
  }
};

// Debounce para búsquedas
export const debounce = (func, wait) => {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
};

// Generar ID único simple
export const generarIdUnico = () => {
  return Date.now().toString(36) + Math.random().toString(36).substr(2);
};
