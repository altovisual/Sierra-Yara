const mongoose = require('mongoose');

/**
 * Modelo de Producto
 * Representa los productos disponibles en el menú del café
 */
const productoSchema = new mongoose.Schema({
  nombre: {
    type: String,
    required: [true, 'El nombre del producto es obligatorio'],
    trim: true
  },
  descripcion: {
    type: String,
    required: [true, 'La descripción es obligatoria'],
    trim: true
  },
  precio: {
    type: Number,
    required: [true, 'El precio es obligatorio'],
    min: [0, 'El precio no puede ser negativo']
  },
  imagenUrl: {
    type: String,
    default: '/images/default-product.jpg'
  },
  categoria: {
    type: String,
    required: [true, 'La categoría es obligatoria'],
    enum: [
      'Café',
      'Ice Tea',
      'Infusiones & Tea',
      'Croissant',
      'Croissant Portugués',
      'Paninis',
      'Focaccia',
      'Batidos Clásicos',
      'Batidos de la Sierra',
      'Bebidas',
      'Limonadas',
      'Cachitos',
      'Pastelería & Galletería',
      'Tortas Frías',
      'Pasteles',
      'Muffins',
      'Heladería',
      'Panadería',
      'Menú Saludable',
      'Ensaladas',
      'Charcuterie'
    ]
  },
  disponible: {
    type: Boolean,
    default: true
  },
  personalizaciones: [{
    nombre: String,
    opciones: [String]
  }]
}, {
  timestamps: true
});

// Índice para búsquedas rápidas por categoría
productoSchema.index({ categoria: 1, disponible: 1 });

module.exports = mongoose.model('Producto', productoSchema);
