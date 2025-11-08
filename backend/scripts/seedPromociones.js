require('dotenv').config();
const mongoose = require('mongoose');
const Promocion = require('../models/Promocion');

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/sierra_yara';

const promocionesEjemplo = [
  {
    titulo: '2x1 en Cafés',
    descripcion: 'Lleva 2 cafés y paga solo 1. Válido para todos los tipos de café.',
    descuento: 50,
    tipoDescuento: 'porcentaje',
    fechaInicio: new Date(),
    fechaFin: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 días
    activa: true,
    destacada: true,
    horaInicio: '07:00',
    horaFin: '11:00',
    diasSemana: ['lunes', 'martes', 'miercoles', 'jueves', 'viernes'],
    condiciones: 'Válido solo para consumo en local. No acumulable con otras promociones.'
  },
  {
    titulo: 'Happy Hour - Batidos',
    descripcion: '30% de descuento en todos los batidos durante el happy hour',
    descuento: 30,
    tipoDescuento: 'porcentaje',
    fechaInicio: new Date(),
    fechaFin: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000), // 60 días
    activa: true,
    destacada: false,
    horaInicio: '15:00',
    horaFin: '18:00',
    condiciones: 'Aplica para batidos clásicos y de la sierra'
  },
  {
    titulo: 'Desayuno Completo',
    descripcion: 'Croissant + Café por precio especial',
    descuento: 5,
    tipoDescuento: 'monto_fijo',
    fechaInicio: new Date(),
    fechaFin: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000), // 90 días
    activa: true,
    destacada: true,
    horaInicio: '07:00',
    horaFin: '10:00',
    diasSemana: ['sabado', 'domingo'],
    condiciones: 'Combo especial de fin de semana'
  }
];

async function seedPromociones() {
  try {
    console.log('🔄 Conectando a MongoDB...');
    await mongoose.connect(MONGODB_URI);
    console.log('✅ Conectado a MongoDB');

    console.log('🗑️  Limpiando promociones existentes...');
    await Promocion.deleteMany({});
    console.log('✅ Promociones eliminadas');

    console.log('📝 Creando promociones de ejemplo...');
    const promocionesCreadas = await Promocion.insertMany(promocionesEjemplo);
    console.log(`✅ ${promocionesCreadas.length} promociones creadas exitosamente`);

    console.log('\n📋 Promociones creadas:');
    promocionesCreadas.forEach((promo, index) => {
      console.log(`\n${index + 1}. ${promo.titulo}`);
      console.log(`   - Descuento: ${promo.descuento}${promo.tipoDescuento === 'porcentaje' ? '%' : ' Bs'}`);
      console.log(`   - Vigencia: ${promo.fechaInicio.toLocaleDateString()} - ${promo.fechaFin.toLocaleDateString()}`);
      console.log(`   - Horario: ${promo.horaInicio} - ${promo.horaFin}`);
      console.log(`   - Activa: ${promo.activa ? 'Sí' : 'No'}`);
      console.log(`   - Destacada: ${promo.destacada ? 'Sí' : 'No'}`);
    });

    console.log('\n✅ Seed de promociones completado exitosamente');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error al crear promociones:', error);
    process.exit(1);
  }
}

seedPromociones();
