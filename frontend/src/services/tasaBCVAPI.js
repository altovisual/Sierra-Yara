import api from './api';

/**
 * Servicio para gestionar tasas BCV
 */
export const tasaBCVAPI = {
  // Obtener tasa actual
  obtenerTasaActual: () => api.get('/tasa-bcv/actual'),

  // Obtener histórico de tasas
  obtenerHistorico: (limite = 30) => api.get(`/tasa-bcv/historico?limite=${limite}`),

  // Actualizar tasa manualmente
  actualizarManual: (valor, actualizadoPor, notas = '') => 
    api.post('/tasa-bcv/actualizar', { valor, actualizadoPor, notas }),

  // Actualizar desde API externa
  actualizarDesdeAPI: () => api.post('/tasa-bcv/actualizar-api'),

  // Obtener estadísticas
  obtenerEstadisticas: (dias = 30) => api.get(`/tasa-bcv/estadisticas?dias=${dias}`)
};

export default tasaBCVAPI;
