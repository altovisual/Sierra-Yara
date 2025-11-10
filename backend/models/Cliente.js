const mongoose = require('mongoose');

/**
 * Modelo de Cliente
 * Almacena información de clientes para marketing y análisis
 */
const clienteSchema = new mongoose.Schema({
  nombre: {
    type: String,
    required: [true, 'El nombre es obligatorio'],
    trim: true
  },
  cedula: {
    type: String,
    required: [true, 'La cédula es obligatoria'],
    unique: true,
    trim: true,
    index: true
  },
  telefono: {
    type: String,
    required: [true, 'El teléfono es obligatorio'],
    trim: true
  },
  email: {
    type: String,
    trim: true,
    lowercase: true,
    default: null
  },
  // Estadísticas del cliente
  totalVisitas: {
    type: Number,
    default: 1
  },
  totalPedidos: {
    type: Number,
    default: 0
  },
  totalGastado: {
    type: Number,
    default: 0
  },
  promedioGasto: {
    type: Number,
    default: 0
  },
  ultimaVisita: {
    type: Date,
    default: Date.now
  },
  primeraVisita: {
    type: Date,
    default: Date.now
  },
  // Preferencias y comportamiento
  productosPreferidos: [{
    productoId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Producto'
    },
    nombreProducto: String,
    vecesOrdenado: Number
  }],
  mesasPreferidas: [Number],
  // Segmentación para marketing
  segmento: {
    type: String,
    enum: ['nuevo', 'regular', 'frecuente', 'vip', 'inactivo'],
    default: 'nuevo'
  },
  // Notas y observaciones
  notas: {
    type: String,
    default: ''
  },
  // Control de marketing
  aceptaMarketing: {
    type: Boolean,
    default: true
  },
  ultimoContacto: {
    type: Date,
    default: null
  },
  // Metadata
  activo: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

// Índices para búsquedas eficientes
clienteSchema.index({ nombre: 'text' });
clienteSchema.index({ telefono: 1 });
clienteSchema.index({ segmento: 1 });
clienteSchema.index({ ultimaVisita: -1 });

// Método para actualizar estadísticas
clienteSchema.methods.actualizarEstadisticas = async function(pedido) {
  this.totalPedidos += 1;
  this.totalGastado += pedido.total + pedido.propina;
  this.promedioGasto = this.totalGastado / this.totalPedidos;
  this.ultimaVisita = new Date();
  
  // Actualizar segmento basado en comportamiento
  if (this.totalPedidos >= 20) {
    this.segmento = 'vip';
  } else if (this.totalPedidos >= 10) {
    this.segmento = 'frecuente';
  } else if (this.totalPedidos >= 3) {
    this.segmento = 'regular';
  }
  
  await this.save();
};

// Método para agregar producto preferido
clienteSchema.methods.agregarProductoPreferido = async function(productoId, nombreProducto) {
  const productoExistente = this.productosPreferidos.find(
    p => p.productoId.toString() === productoId.toString()
  );
  
  if (productoExistente) {
    productoExistente.vecesOrdenado += 1;
  } else {
    this.productosPreferidos.push({
      productoId,
      nombreProducto,
      vecesOrdenado: 1
    });
  }
  
  // Ordenar por veces ordenado (descendente) y mantener solo top 10
  this.productosPreferidos.sort((a, b) => b.vecesOrdenado - a.vecesOrdenado);
  this.productosPreferidos = this.productosPreferidos.slice(0, 10);
  
  await this.save();
};

module.exports = mongoose.model('Cliente', clienteSchema);
