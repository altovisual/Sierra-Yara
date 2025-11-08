require('dotenv').config();
const mongoose = require('mongoose');
const Producto = require('../models/Producto');
const Mesa = require('../models/Mesa');
const productosParte1 = require('./seedDataParte1');
const productosParte2 = require('./seedDataParte2');

/**
 * Script para poblar la base de datos con el menú completo de Sierra Yara Café
 */

// Combinar todos los productos
const productosMenu = [...productosParte1, ...productosParte2];

const mesasEjemplo = [
  { numeroMesa: 1, estado: 'libre' },
  { numeroMesa: 2, estado: 'libre' },
  { numeroMesa: 3, estado: 'libre' },
  { numeroMesa: 4, estado: 'libre' },
  { numeroMesa: 5, estado: 'libre' },
  { numeroMesa: 6, estado: 'libre' },
  { numeroMesa: 7, estado: 'libre' },
  { numeroMesa: 8, estado: 'libre' },
  { numeroMesa: 9, estado: 'libre' },
  { numeroMesa: 10, estado: 'libre' }
];

async function seedDatabase() {
  try {
    // Conectar a MongoDB
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Conectado a MongoDB');

    // Limpiar colecciones existentes
    await Producto.deleteMany({});
    await Mesa.deleteMany({});
    console.log('🗑️  Colecciones limpiadas');

    // Insertar productos
    const productosCreados = await Producto.insertMany(productosMenu);
    console.log(`✅ ${productosCreados.length} productos creados`);

    // Insertar mesas
    const mesasCreadas = await Mesa.insertMany(mesasEjemplo);
    console.log(`✅ ${mesasCreadas.length} mesas creadas`);

    console.log('\n🎉 Base de datos poblada exitosamente!');
    console.log('\n📊 Resumen:');
    console.log(`   - Productos: ${productosCreados.length}`);
    console.log(`   - Mesas: ${mesasCreadas.length}`);
    
    // Mostrar categorías
    const categorias = [...new Set(productosMenu.map(p => p.categoria))];
    console.log(`   - Categorías: ${categorias.length}`);
    console.log('\n📋 Categorías disponibles:');
    categorias.forEach(cat => {
      const count = productosMenu.filter(p => p.categoria === cat).length;
      console.log(`   • ${cat}: ${count} productos`);
    });
    
    console.log('\n💡 Puedes acceder al sistema en:');
    console.log('   - Cliente: http://localhost:3000');
    console.log('   - Admin: http://localhost:3000/admin');

    process.exit(0);
  } catch (error) {
    console.error('❌ Error al poblar la base de datos:', error);
    process.exit(1);
  }
}

// Ejecutar el script
seedDatabase();
