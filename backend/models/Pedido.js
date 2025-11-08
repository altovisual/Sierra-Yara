const mongoose = require('mongoose');

/**
 * Modelo de Pedido
 * Representa los pedidos individuales realizados por cada dispositivo en una mesa
 */
const pedidoSchema = new mongoose.Schema({
  mesaId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Mesa',
    required: [true, 'El ID de la mesa es obligatorio']
  },
  dispositivoId: {
    type: String,
    required: [true, 'El ID del dispositivo es obligatorio']
  },
  nombreUsuario: {
    type: String,
    default: 'Cliente'
  },
  items: [{
    productoId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Producto',
      required: true
    },
    nombreProducto: String,
    cantidad: {
      type: Number,
      required: true,
      min: [1, 'La cantidad debe ser al menos 1']
    },
    precioUnitario: {
      type: Number,
      required: true
    },
    personalizaciones: {
      type: Map,
      of: String
    },
    subtotal: Number
  }],
  total: {
    type: Number,
    required: true,
    default: 0
  },
  estado: {
    type: String,
    enum: ['recibido', 'en_preparacion', 'listo', 'entregado', 'cancelado'],
    default: 'recibido'
  },
  propina: {
    type: Number,
    default: 0
  },
  metodoPago: {
    type: String,
    enum: ['pago_movil', 'transferencia', 'efectivo', 'zelle', 'paypal', 'biopago', 'punto_venta', 'pendiente'],
    default: 'pendiente'
  },
  pagado: {
    type: Boolean,
    default: false
  },
  estadoPago: {
    type: String,
    enum: ['pendiente', 'procesando', 'confirmado', 'rechazado'],
    default: 'pendiente'
  },
  comprobantePago: {
    type: String, // URL o base64 de la imagen del comprobante
    default: null
  },
  referenciaPago: {
    type: String, // Número de referencia del pago
    trim: true
  },
  notas: {
    type: String,
    trim: true
  }
}, {
  timestamps: true
});

// Calcular subtotales y total antes de guardar
pedidoSchema.pre('save', function(next) {
  this.items.forEach(item => {
    item.subtotal = item.cantidad * item.precioUnitario;
  });
  
  this.total = this.items.reduce((sum, item) => sum + item.subtotal, 0);
  next();
});

// Índices para consultas frecuentes
pedidoSchema.index({ mesaId: 1, estado: 1 });
pedidoSchema.index({ dispositivoId: 1 });

module.exports = mongoose.model('Pedido', pedidoSchema);
