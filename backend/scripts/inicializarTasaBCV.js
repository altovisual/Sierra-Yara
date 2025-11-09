require('dotenv').config();
const mongoose = require('mongoose');
const TasaBCV = require('../models/TasaBCV');
const axios = require('axios');

/**
 * Script para inicializar la tasa BCV
 * Ejecutar con: node backend/scripts/inicializarTasaBCV.js
 */

const inicializarTasa = async () => {
  try {
    // Conectar a MongoDB
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Conectado a MongoDB');

    // Verificar si ya existe una tasa
    const tasaExistente = await TasaBCV.findOne({ activa: true });
    
    if (tasaExistente) {
      console.log('ℹ️  Ya existe una tasa activa:', tasaExistente.valor);
      console.log('¿Desea actualizarla? Ejecute: node backend/scripts/actualizarTasaBCV.js');
      process.exit(0);
    }

    // Intentar obtener tasa de API
    console.log('🔄 Obteniendo tasa desde API...');
    let tasaValor = null;

    try {
      const response = await axios.get('https://pydolarve.org/api/v1/dollar?page=bcv', {
        timeout: 10000
      });
      
      if (response.data && response.data.monitors && response.data.monitors.usd) {
        tasaValor = parseFloat(response.data.monitors.usd.price);
        console.log('✅ Tasa obtenida de PyDolarVe:', tasaValor);
      }
    } catch (apiError) {
      console.log('⚠️  No se pudo obtener de API, usando valor por defecto');
      tasaValor = 36.50; // Valor por defecto
    }

    // Crear tasa inicial
    const nuevaTasa = await TasaBCV.create({
      valor: tasaValor,
      fuente: tasaValor === 36.50 ? 'manual' : 'api',
      actualizadoPor: 'sistema',
      notas: 'Tasa inicial',
      activa: true
    });

    console.log('✅ Tasa BCV inicializada exitosamente:');
    console.log('   Valor:', nuevaTasa.valor);
    console.log('   Fuente:', nuevaTasa.fuente);
    console.log('   Fecha:', nuevaTasa.createdAt);

    process.exit(0);
  } catch (error) {
    console.error('❌ Error al inicializar tasa:', error);
    process.exit(1);
  }
};

inicializarTasa();
