import axios from 'axios';

/**
 * Configuración de Axios para las llamadas a la API
 * Detecta automáticamente si estamos en localhost o en red local
 */
const getApiUrl = () => {
  // FORZAR localhost para desarrollo
  return 'http://localhost:5000/api';
};

const API_URL = getApiUrl();

// Debug: Mostrar la URL que se está usando
console.log('🔧 API_URL configurada:', API_URL);
console.log('🔧 REACT_APP_API_URL:', process.env.REACT_APP_API_URL);

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor para manejo de errores
api.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error('Error en la API:', error.response?.data || error.message);
    return Promise.reject(error);
  }
);

// ============ PRODUCTOS ============
export const productosAPI = {
  obtenerTodos: (params) => api.get('/productos', { params }),
  obtenerPorId: (id) => api.get(`/productos/${id}`),
  obtenerCategorias: () => api.get('/productos/categorias'),
  crear: (data) => api.post('/productos', data),
  actualizar: (id, data) => api.put(`/productos/${id}`, data),
  eliminar: (id) => api.delete(`/productos/${id}`),
};

// ============ MESAS ============
export const mesasAPI = {
  obtenerTodas: () => api.get('/mesas'),
  obtenerPorNumero: (numeroMesa) => api.get(`/mesas/${numeroMesa}`),
  conectarDispositivo: (numeroMesa, data) => api.post(`/mesas/${numeroMesa}/conectar`, data),
  desconectarDispositivo: (numeroMesa, dispositivoId) => api.post(`/mesas/${numeroMesa}/desconectar`, { dispositivoId }),
  obtenerCuenta: (numeroMesa) => api.get(`/mesas/${numeroMesa}/cuenta`),
  crear: (data) => api.post('/mesas', data),
  actualizar: (id, data) => api.put(`/mesas/${id}`, data),
  cerrar: (id) => api.post(`/mesas/${id}/cerrar`),
};

// ============ PEDIDOS ============
export const pedidosAPI = {
  obtenerTodos: (params) => api.get('/pedidos', { params }),
  obtenerPorId: (id) => api.get(`/pedidos/${id}`),
  obtenerPorDispositivo: (dispositivoId) => api.get(`/pedidos/dispositivo/${dispositivoId}`),
  crear: (data) => api.post('/pedidos', data),
  actualizarEstado: (id, estado) => api.put(`/pedidos/${id}/estado`, { estado }),
  procesarPago: (id, data) => api.post(`/pedidos/${id}/pagar`, data),
  confirmarPago: (id) => api.post(`/pedidos/${id}/confirmar-pago`),
  cancelar: (id) => api.delete(`/pedidos/${id}`),
  obtenerEstadisticasDia: () => api.get('/pedidos/estadisticas/dia'),
};

// ============ PROMOCIONES ============
export const promocionesAPI = {
  obtenerTodas: () => api.get('/promociones'),
  obtenerActivas: () => api.get('/promociones/activas'),
  obtenerPorId: (id) => api.get(`/promociones/${id}`),
  crear: (data) => api.post('/promociones', data),
  actualizar: (id, data) => api.put(`/promociones/${id}`, data),
  eliminar: (id) => api.delete(`/promociones/${id}`),
  toggleActiva: (id) => api.patch(`/promociones/${id}/toggle`),
};

// ============ CONFIGURACIÓN ============
export const configAPI = {
  obtenerDatosPago: () => api.get('/config/pago'),
  verificarSalud: () => api.get('/health'),
};

export default api;
