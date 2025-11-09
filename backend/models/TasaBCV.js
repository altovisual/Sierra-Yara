const mongoose = require('mongoose');

/**
 * Modelo para almacenar el histórico de tasas BCV
 */
const tasaBCVSchema = new mongoose.Schema({
  valor: {
    type: Number,
    required: [true, 'El valor de la tasa es obligatorio'],
    min: [0, 'El valor debe ser positivo']
  },
  fuente: {
    type: String,
    enum: ['api', 'manual'],
    default: 'api'
  },
  actualizadoPor: {
    type: String,
    default: 'sistema'
  },
  notas: {
    type: String,
    trim: true
  },
  activa: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

// Índice para búsquedas rápidas
tasaBCVSchema.index({ activa: 1, createdAt: -1 });

// Método estático para obtener la tasa actual
tasaBCVSchema.statics.obtenerTasaActual = async function() {
  const tasa = await this.findOne({ activa: true }).sort({ createdAt: -1 });
  return tasa ? tasa.valor : 36.50; // Valor por defecto si no hay tasa
};

// Método estático para crear nueva tasa y desactivar la anterior
tasaBCVSchema.statics.actualizarTasa = async function(valor, fuente = 'api', actualizadoPor = 'sistema', notas = '') {
  // Desactivar todas las tasas anteriores
  await this.updateMany({ activa: true }, { activa: false });
  
  // Crear nueva tasa activa
  const nuevaTasa = await this.create({
    valor,
    fuente,
    actualizadoPor,
    notas,
    activa: true
  });
  
  return nuevaTasa;
};

module.exports = mongoose.model('TasaBCV', tasaBCVSchema);
