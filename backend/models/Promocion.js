const mongoose = require('mongoose');

/**
 * Modelo de Promoción
 * Representa las promociones del día o especiales del café
 */
const promocionSchema = new mongoose.Schema({
  titulo: {
    type: String,
    required: [true, 'El título de la promoción es obligatorio'],
    trim: true
  },
  descripcion: {
    type: String,
    required: [true, 'La descripción es obligatoria'],
    trim: true
  },
  descuento: {
    type: Number,
    min: [0, 'El descuento no puede ser negativo'],
    max: [100, 'El descuento no puede ser mayor a 100%'],
    default: 0
  },
  tipoDescuento: {
    type: String,
    enum: ['porcentaje', 'monto_fijo'],
    default: 'porcentaje'
  },
  imagenUrl: {
    type: String,
    default: '/images/default-promo.jpg'
  },
  productos: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Producto'
  }],
  categorias: [{
    type: String
  }],
  fechaInicio: {
    type: Date,
    required: [true, 'La fecha de inicio es obligatoria']
  },
  fechaFin: {
    type: Date,
    required: [true, 'La fecha de fin es obligatoria']
  },
  activa: {
    type: Boolean,
    default: true
  },
  destacada: {
    type: Boolean,
    default: false
  },
  diasSemana: [{
    type: String,
    enum: ['lunes', 'martes', 'miercoles', 'jueves', 'viernes', 'sabado', 'domingo']
  }],
  horaInicio: {
    type: String, // Formato HH:mm
    default: '00:00'
  },
  horaFin: {
    type: String, // Formato HH:mm
    default: '23:59'
  },
  condiciones: {
    type: String,
    trim: true
  }
}, {
  timestamps: true
});

// Índice para búsquedas rápidas
promocionSchema.index({ activa: 1, fechaInicio: 1, fechaFin: 1 });

// Método para verificar si la promoción está vigente
promocionSchema.methods.estaVigente = function() {
  const ahora = new Date();
  const diaActual = ['domingo', 'lunes', 'martes', 'miercoles', 'jueves', 'viernes', 'sabado'][ahora.getDay()];
  const horaActual = ahora.getHours().toString().padStart(2, '0') + ':' + ahora.getMinutes().toString().padStart(2, '0');
  
  // Verificar si está activa
  if (!this.activa) return false;
  
  // Verificar rango de fechas
  if (ahora < this.fechaInicio || ahora > this.fechaFin) return false;
  
  // Verificar día de la semana (si está especificado)
  if (this.diasSemana && this.diasSemana.length > 0 && !this.diasSemana.includes(diaActual)) {
    return false;
  }
  
  // Verificar horario (si está especificado)
  if (this.horaInicio && this.horaFin) {
    if (horaActual < this.horaInicio || horaActual > this.horaFin) {
      return false;
    }
  }
  
  return true;
};

module.exports = mongoose.model('Promocion', promocionSchema);
