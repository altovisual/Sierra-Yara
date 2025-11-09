require('dotenv').config();
const mongoose = require('mongoose');
const Promocion = require('../models/Promocion');
const Producto = require('../models/Producto');

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/sierra_yara';

async function seedPromocionesConProductos() {
  try {
    console.log('🔄 Conectando a MongoDB...');
    await mongoose.connect(MONGODB_URI);
    console.log('✅ Conectado a MongoDB');

    // Obtener algunos productos existentes
    const cafes = await Producto.find({ categoria: 'Café' }).limit(3);
    const batidos = await Producto.find({ categoria: { $in: ['Batidos Clásicos', 'Batidos de la Sierra'] } }).limit(2);
    const postres = await Producto.find({ categoria: { $in: ['Pastelería & Galletería', 'Tortas Frías', 'Pasteles'] } }).limit(2);

    console.log(`📦 Productos encontrados: ${cafes.length} cafés, ${batidos.length} batidos, ${postres.length} postres`);

    console.log('🗑️  Limpiando promociones existentes...');
    await Promocion.deleteMany({});
    console.log('✅ Promociones eliminadas');

    const promocionesEjemplo = [
      {
        titulo: '2x1 en Cafés',
        descripcion: 'Lleva 2 cafés y paga solo 1. Válido para todos los tipos de café.',
        descuento: 50,
        tipoDescuento: 'porcentaje',
        fechaInicio: new Date(),
        fechaFin: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
        activa: true,
        destacada: true,
        horaInicio: '00:00',
        horaFin: '23:59',
        diasSemana: [],
        productos: cafes.map(c => c._id), // Asociar cafés
        condiciones: 'Válido solo para consumo en local. No acumulable con otras promociones.'
      },
      {
        titulo: 'Combo Batidos',
        descripcion: 'Batidos seleccionados con 30% de descuento',
        descuento: 30,
        tipoDescuento: 'porcentaje',
        fechaInicio: new Date(),
        fechaFin: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000),
        activa: true,
        destacada: false,
        horaInicio: '00:00',
        horaFin: '23:59',
        diasSemana: [],
        productos: batidos.map(b => b._id), // Asociar batidos
        condiciones: 'Aplica para batidos seleccionados'
      },
      {
        titulo: 'Combo Dulce',
        descripcion: 'Postre + Café con descuento especial',
        descuento: 5,
        tipoDescuento: 'monto_fijo',
        fechaInicio: new Date(),
        fechaFin: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000),
        activa: true,
        destacada: true,
        horaInicio: '00:00',
        horaFin: '23:59',
        diasSemana: [],
        productos: [...postres.map(p => p._id), ...cafes.slice(0, 1).map(c => c._id)], // Postres + 1 café
        condiciones: 'Combo especial postre + café'
      },
      {
        titulo: 'Descuento General 20%',
        descripcion: '¡20% de descuento en todo tu pedido!',
        descuento: 20,
        tipoDescuento: 'porcentaje',
        fechaInicio: new Date(),
        fechaFin: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
        activa: true,
        destacada: true,
        horaInicio: '00:00',
        horaFin: '23:59',
        diasSemana: [],
        productos: [], // Sin productos específicos = descuento general
        condiciones: 'Aplica a todo el pedido. Promoción por tiempo limitado.'
      }
    ];

    console.log('📝 Creando promociones con productos...');
    const promocionesCreadas = await Promocion.insertMany(promocionesEjemplo);
    console.log(`✅ ${promocionesCreadas.length} promociones creadas exitosamente`);
    
    // Verificar cuáles están vigentes ahora
    console.log('\n🔍 Verificando promociones vigentes...');
    const vigentes = promocionesCreadas.filter(p => p.estaVigente());
    console.log(`✅ ${vigentes.length} promociones vigentes en este momento`);

    console.log('\n📋 Promociones creadas:');
    for (const promo of promocionesCreadas) {
      console.log(`\n${promo.titulo}`);
      console.log(`   - Descuento: ${promo.descuento}${promo.tipoDescuento === 'porcentaje' ? '%' : ' Bs'}`);
      console.log(`   - Vigencia: ${promo.fechaInicio.toLocaleDateString()} - ${promo.fechaFin.toLocaleDateString()}`);
      console.log(`   - Productos asociados: ${promo.productos.length}`);
      console.log(`   - Activa: ${promo.activa ? 'Sí' : 'No'}`);
      console.log(`   - Destacada: ${promo.destacada ? 'Sí' : 'No'}`);
      
      if (promo.productos.length > 0) {
        // Obtener nombres de productos
        const productosInfo = await Producto.find({ _id: { $in: promo.productos } });
        console.log(`   - Productos: ${productosInfo.map(p => p.nombre).join(', ')}`);
      }
    }

    console.log('\n✅ Seed de promociones con productos completado exitosamente');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error al crear promociones:', error);
    process.exit(1);
  }
}

seedPromocionesConProductos();
