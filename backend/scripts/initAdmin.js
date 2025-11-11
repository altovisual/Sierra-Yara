require('dotenv').config();
const mongoose = require('mongoose');
const Admin = require('../models/Admin');

/**
 * Script para crear el administrador inicial
 * Credenciales de prueba para desarrollo
 */

const ADMIN_INICIAL = {
  nombre: 'Administrador',
  email: 'admin@sierrayara.com',
  password: 'admin123',
  rol: 'superadmin'
};

const initAdmin = async () => {
  try {
    // Conectar a la base de datos
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/sierra_yara');
    console.log('✅ Conectado a MongoDB');

    // Verificar si ya existe un admin
    const adminExistente = await Admin.findOne({ email: ADMIN_INICIAL.email });
    
    if (adminExistente) {
      console.log('⚠️  El administrador ya existe');
      console.log('📧 Email:', ADMIN_INICIAL.email);
      console.log('🔑 Password: (sin cambios)');
      
      // Actualizar password si es necesario
      adminExistente.password = ADMIN_INICIAL.password;
      await adminExistente.save();
      console.log('✅ Password actualizado');
    } else {
      // Crear nuevo admin
      const admin = await Admin.create(ADMIN_INICIAL);
      console.log('✅ Administrador creado exitosamente');
      console.log('📧 Email:', admin.email);
      console.log('🔑 Password:', ADMIN_INICIAL.password);
      console.log('👤 Nombre:', admin.nombre);
      console.log('🎖️  Rol:', admin.rol);
    }

    console.log('\n🎉 ¡Listo! Puedes iniciar sesión con estas credenciales:');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('📧 Email:    admin@sierrayara.com');
    console.log('🔑 Password: admin123');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
};

// Ejecutar
initAdmin();
