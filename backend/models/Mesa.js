const mongoose = require('mongoose');

/**
 * Modelo de Mesa
 * Representa las mesas del café y su estado actual
 */
const mesaSchema = new mongoose.Schema({
  numeroMesa: {
    type: Number,
    required: [true, 'El número de mesa es obligatorio'],
    unique: true,
    min: [1, 'El número de mesa debe ser mayor a 0']
  },
  estado: {
    type: String,
    enum: ['libre', 'ocupada', 'esperando_pago'],
    default: 'libre'
  },
  pedidos: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Pedido'
  }],
  dispositivosActivos: [{
    dispositivoId: String,
    nombreUsuario: String,
    cedula: String,
    telefono: String,
    horaConexion: Date
  }],
  totalMesa: {
    type: Number,
    default: 0
  },
  horaOcupacion: {
    type: Date
  },
  horaCierre: {
    type: Date
  }
}, {
  timestamps: true
});

// Método para calcular el total de la mesa
mesaSchema.methods.calcularTotal = async function() {
  const Pedido = mongoose.model('Pedido');
  const pedidos = await Pedido.find({ 
    _id: { $in: this.pedidos },
    estado: { $ne: 'cancelado' }
  });
  
  this.totalMesa = pedidos.reduce((sum, pedido) => sum + pedido.total, 0);
  return this.totalMesa;
};

// Método para actualizar el estado de la mesa según los pedidos
mesaSchema.methods.actualizarEstado = async function() {
  const Pedido = mongoose.model('Pedido');
  
  // Si no hay dispositivos conectados y no hay pedidos, liberar mesa
  if (this.dispositivosActivos.length === 0 && this.pedidos.length === 0) {
    this.estado = 'libre';
    this.horaOcupacion = null;
    this.horaCierre = null;
    this.totalMesa = 0;
    return this.estado;
  }
  
  // Obtener todos los pedidos de la mesa
  const pedidos = await Pedido.find({ 
    _id: { $in: this.pedidos },
    estado: { $ne: 'cancelado' }
  });
  
  if (pedidos.length === 0) {
    // Si no hay pedidos pero hay dispositivos, mantener ocupada
    if (this.dispositivosActivos.length > 0) {
      this.estado = 'ocupada';
    } else {
      this.estado = 'libre';
      this.horaOcupacion = null;
      this.horaCierre = null;
    }
    return this.estado;
  }
  
  // Verificar si todos los pedidos están pagados
  const todosPagados = pedidos.every(p => p.pagado);
  const hayPedidosPendientes = pedidos.some(p => !p.pagado);
  
  if (todosPagados) {
    // Si todos están pagados y no hay dispositivos, liberar
    if (this.dispositivosActivos.length === 0) {
      this.estado = 'libre';
      this.horaOcupacion = null;
      this.horaCierre = new Date();
    } else {
      // Si hay dispositivos aún conectados, mantener ocupada
      this.estado = 'ocupada';
    }
  } else if (hayPedidosPendientes) {
    // Si hay pedidos sin pagar, marcar como esperando pago
    this.estado = 'esperando_pago';
  } else {
    // Estado por defecto: ocupada
    this.estado = 'ocupada';
  }
  
  return this.estado;
};

module.exports = mongoose.model('Mesa', mesaSchema);
